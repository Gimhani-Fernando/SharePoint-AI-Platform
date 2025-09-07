from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from .database import db_manager
from .auth import AuthManager
from .routes import auth, assignments, chat, documents, projects

# Initialize services (auth kept for login form only)
auth_manager = AuthManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db_manager.initialize()
    print("SharePoint AI Platform Backend Started")
    print("Database connected")
    print("Authentication ready")
    yield
    # Shutdown
    await db_manager.close()

app = FastAPI(
    title="SharePoint AI Platform API",
    description="Backend API for SharePoint AI Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Development: Simple user dependency based on email from request headers
async def get_current_user(request: Request):
    """Get current user from database based on email (development mode)"""
    user_email = request.headers.get("x-user-email")
    if not user_email:
        raise HTTPException(
            status_code=401,
            detail="No user email provided in headers"
        )
    
    # Get user from database
    user = await db_manager.get_user_by_email(user_email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in database"
        )
    
    return user

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "SharePoint AI Platform API",
        "version": "1.0.0",
        "status": "healthy",
        "features": [
            "User Authentication",
            "Assignment Management", 
            "AI Chat Assistant"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db_status = await db_manager.health_check()
        return {
            "status": "healthy",
            "database": db_status,
            "timestamp": db_manager.get_timestamp()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)