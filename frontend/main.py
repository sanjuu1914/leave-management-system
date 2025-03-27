from fastapi import FastAPI, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse, HTMLResponse
# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use your actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Added DELETE to allowed methods
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="dist/leave-management-frontend/browser"), name="static")


@app.get("/{full_path:path}")  # Catch-all route
async def serve_frontend(full_path: str = ""):
    return FileResponse("dist/leave-management-frontend/browser/index.html")


# Run FastAPI Server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8080)