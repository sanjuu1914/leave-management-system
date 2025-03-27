import traceback
from fastapi import FastAPI, HTTPException, Depends, Header  # ✅ Added Header import
from pydantic import BaseModel
import firebase_admin
from firebase_admin import auth, credentials, firestore
from google.cloud import bigquery
import uuid
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

load_dotenv()

app = FastAPI(docs_url="/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use your actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Added DELETE to allowed methods
    allow_headers=["*"],
)


# Paths to the new credential files
firebase_cred_path = "url"
bigquery_cred_path = "url"

# Initialize Firebase

firebase_admin.initialize_app()

# Initialize Firestore
db = firestore.client()

# Initialize BigQuery with specific credentials
client = bigquery.Client()


# Class for Signup Request
class SignupRequest(BaseModel):
    email: str
    password: str
    role: str  # "employee" or "manager"


# Class for Leave Request
class LeaveRequest(BaseModel):
    start_date: str
    end_date: str
    leave_type: str
    reason: str
    status: str = "Pending"  # Default status is "Pending"

class LeaveStatusUpdate(BaseModel):
    leave_id: str
    status: str  # "approved" or "rejected"


# Modified function to extract token from the Authorization header
def verify_firebase_token(authorization: str = Header(None)):  
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    id_token = authorization.split("Bearer ")[1] 
    try:
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
        return decoded_token
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")


@app.get("/user_info/")
def get_user_info(user=Depends(verify_firebase_token)):
    """Fetches the username of the logged-in user."""
    employee_id = user  ["uid"]  # Extract Firebase UID
    
    query = """
    SELECT username FROM `leave-management-system-bc236.leave_management.users`
    WHERE employee_id = @employee_id
    """
    
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("employee_id", "STRING", employee_id)]
    )
    
    results = client.query(query, job_config=job_config).result()
    row = next(results, None)  # Fetch the first row
    
    if row:
        return {"username": row["username"]}
    return {"username": "Unknown"}  # Default if user not found


# User Signup
@app.post("/signup/")
def signup(request: SignupRequest):
    try:
        # Create user in Firebase Authentication
        user = auth.create_user(email=request.email, password=request.password)
        
        # Extract username from email
        username = request.email.split('@')[0]

        # Store user details in Firestore
        user_data = {"email": request.email, "username": username, "role": request.role, "uid": user.uid}
        db.collection("users").document(user.uid).set(user_data)

        # Store user in BigQuery using parameterized query
        query = """
        INSERT INTO `leave-management-system-bc236.leave_management.users`
        (uid, email, username, role)
        VALUES (@uid, @email, @username, @role)
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("uid", "STRING", user.uid),
                bigquery.ScalarQueryParameter("email", "STRING", request.email),
                bigquery.ScalarQueryParameter("username", "STRING", username),
                bigquery.ScalarQueryParameter("role", "STRING", request.role)
            ]
        )

        # Execute the query
        client.query(query, job_config=job_config).result()

        return {"message": "User registered successfully", "user_id": user.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Fetch User Role
@app.get("/user_role/{uid}")
def get_user_role(uid: str, user=Depends(verify_firebase_token)):
    user_data = db.collection("users").document(uid).get().to_dict()
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"role": user_data["role"]}


# Apply Leave
@app.post("/apply_leave/")
def apply_leave(request: LeaveRequest, user=Depends(verify_firebase_token)):
    employee_id = user["uid"]  # Ensure user can only apply for themselves
    query = """
    INSERT INTO `leave-management-system-bc236.leave_management.leaves`
    (leave_id, employee_id, start_date, end_date, leave_type, reason, status)
    VALUES (@leave_id, @employee_id, @start_date, @end_date, @leave_type, @reason, @status)
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("leave_id", "STRING", str(uuid.uuid4())),
            bigquery.ScalarQueryParameter("employee_id", "STRING", employee_id),
            bigquery.ScalarQueryParameter("start_date", "STRING", request.start_date),
            bigquery.ScalarQueryParameter("end_date", "STRING", request.end_date),
            bigquery.ScalarQueryParameter("leave_type", "STRING", request.leave_type),
            bigquery.ScalarQueryParameter("reason", "STRING", request.reason),
            bigquery.ScalarQueryParameter("status", "STRING", "Pending"),
        ]
    )

    try:
        client.query(query, job_config=job_config).result()
        return {"message": "Leave request submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BigQuery Error: {str(e)}")


# Withdraw Leave Request
@app.delete("/withdraw_leave/{leave_id}")
def withdraw_leave(leave_id: str, user=Depends(verify_firebase_token)):
    query = """
    DELETE FROM `leave-management-system-bc236.leave_management.leaves`
    WHERE leave_id = @leave_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("leave_id", "STRING", leave_id),
            bigquery.ScalarQueryParameter("employee_id", "STRING", user["uid"]),
        ]
    )

    client.query(query, job_config=job_config).result()
    return {"message": "Leave request withdrawn successfully","query":query,"parameters":{"leave_id":leave_id}}



# Fetch Leave Requests
@app.get("/leave_requests/")
def get_leave_requests(user=Depends(verify_firebase_token)):
    employee_id = user["uid"]  # Get employee ID from Firebase token
    query = """
    SELECT * FROM `leave-management-system-bc236.leave_management.leaves` 
    WHERE employee_id = @employee_id
    ORDER BY start_date DESC
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("employee_id", "STRING", employee_id)]
    )
    results = client.query(query, job_config=job_config).result()
    return {"leave_requests": [dict(row) for row in results]}

@app.post("/update_leave_status/")
def update_leave_status(request: LeaveStatusUpdate, user=Depends(verify_firebase_token)):
    # Ensure only managers can approve/reject leaves
    user_data = db.collection("users").document(user["uid"]).get().to_dict()
    if not user_data or user_data.get("role") != "manager":
        raise HTTPException(status_code=403, detail="Only managers can approve/reject leave requests")

    # Update leave status in BigQuery
    try:
        query = """
        UPDATE `leave-management-system-bc236.leave_management.leaves`
        SET status = @status
        WHERE leave_id = @leave_id
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("status", "STRING", request.status),
                bigquery.ScalarQueryParameter("leave_id", "STRING", request.leave_id),
            ]
        )

        client.query(query, job_config=job_config).result()

        return {"message": f"Leave request {request.status} successfully"}
    except Exception as e:
        traceback.print_exc()
        return {"message": f"Leave request failed"}

@app.get("/leaves/")
def get_all_leave_requests():
    query = """
    SELECT *
    FROM `leave-management-system-bc236.leave_management.leaves`
    
    """
    try:
        query_job = client.query(query)
        results = query_job.result()
        leave_requests = [dict(row) for row in results]
        
        return {"leave_requests": leave_requests}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BigQuery Error: {str(e)}")

# Run FastAPI Server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8080)