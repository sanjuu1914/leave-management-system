import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def generate_firebase_token(email, password):
    """
    Generate Firebase ID token for authentication
    """
    api_key = os.getenv("FIREBASE_API_KEY")
    
    if not api_key:
        raise ValueError("Firebase API Key not found in environment")

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"

    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }

    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        data = response.json()
        
        if "idToken" in data:
            print("✅ Login Successful!")
            return data["idToken"]
        else:
            print("❌ Login Failed!")
            return None
    
    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        return None

def main():
    # Use environment variables for credentials
    email = os.getenv("TEST_USER_EMAIL")
    password = os.getenv("TEST_USER_PASSWORD")
    
    if not email or not password:
        print("Please set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env file")
        return
    
    token = generate_firebase_token(email, password)
    if token:
        print("ID Token:", token)

if __name__ == "__main__":
    main()