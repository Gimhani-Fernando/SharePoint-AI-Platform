from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import logging

from ..auth import auth_manager
from ..database import db_manager

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]


@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """Development login - accepts any email, ignores password"""
    try:
        # Get user by email (ignore password for development)
        user = await db_manager.get_user_by_email(user_credentials.email)
        
        if not user:
            # Create user if doesn't exist
            user = await auth_manager.register_user({
                "email": user_credentials.email,
                "password": "dev", # dummy password for development
                "name": user_credentials.email.split("@")[0].title()
            })
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to login or create user"
            )
        
        # Create simple token (just the email for development)
        access_token = user_credentials.email
        
        # Remove sensitive data
        user_data = {k: v for k, v in user.items() if k not in ["password_hash"]}
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_data
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        # Create new user
        new_user = await auth_manager.register_user({
            "email": user_data.email,
            "password": user_data.password,
            "name": user_data.name or user_data.email.split("@")[0]
        })
        
        if not new_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered or registration failed"
            )
        
        # Create access token
        access_token = auth_manager.create_access_token(
            data={"sub": new_user["id"], "email": new_user["email"]}
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=new_user
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.get("/me")
async def get_current_user_info(request: Request):
    """Get current user information (development mode)"""
    try:
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
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Remove sensitive data
        user_data = {k: v for k, v in user.items() if k not in ["password_hash"]}
        
        return user_data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user info error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )

@router.get("/users")
async def get_all_users():
    """Get all users for assignment dropdown"""
    try:
        # Get all users from database
        users = await db_manager.get_all_users()
        
        # Remove sensitive data from all users
        safe_users = []
        for user in users:
            safe_user = {k: v for k, v in user.items() if k not in ["password_hash"]}
            safe_users.append(safe_user)
        
        return safe_users
    
    except Exception as e:
        logger.error(f"Get all users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get users"
        )

