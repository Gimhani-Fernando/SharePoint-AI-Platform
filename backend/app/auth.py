from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging
import uuid

from .config import settings
from .database import db_manager

logger = logging.getLogger(__name__)

class AuthManager:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = settings.jwt_secret_key
        self.algorithm = settings.jwt_algorithm
        self.access_token_expire_minutes = settings.jwt_expire_minutes
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def decode_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate a JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            logger.error(f"JWT decode error: {e}")
            return None
    
    async def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
        """Get the current user from a JWT token"""
        try:
            payload = self.decode_access_token(token)
            if payload is None:
                return None
            
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            
            # Get user from database
            user = await db_manager.get_user_by_id(user_id)
            return user
        except Exception as e:
            logger.error(f"Error getting current user: {e}")
            return None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate a user with email and password"""
        try:
            # Get user from database
            user = await db_manager.get_user_by_email(email)
            if not user:
                return None
            
            # For demo purposes, we'll create a simple password check
            # In production, you'd verify against a hashed password
            if not user.get("password_hash"):
                # If no password set, this might be a Microsoft SSO user
                return None
            
            if not self.verify_password(password, user["password_hash"]):
                return None
            
            return user
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
    
    
    async def register_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Register a new user with email/password"""
        try:
            email = user_data.get("email")
            password = user_data.get("password")
            name = user_data.get("name", email.split("@")[0])
            
            if not email or not password:
                return None
            
            # Check if user already exists
            existing_user = await db_manager.get_user_by_email(email)
            if existing_user:
                logger.warning(f"User with email {email} already exists")
                return None
            
            # Hash password and create user
            hashed_password = self.get_password_hash(password)
            new_user_data = {
                "id": str(uuid.uuid4()),
                "email": email,
                "name": name,
                "role": "user",
                "password_hash": hashed_password
            }
            
            new_user = await db_manager.create_user(new_user_data)
            
            # Remove password hash from return data
            if new_user and "password_hash" in new_user:
                del new_user["password_hash"]
            
            return new_user
        except Exception as e:
            logger.error(f"Error registering user: {e}")
            return None
    

# Global auth manager instance
auth_manager = AuthManager()