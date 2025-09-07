import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    
    # JWT Configuration
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 24 * 60  # 24 hours
    
    # Microsoft Azure/OneDrive Configuration
    azure_client_id: str = os.getenv("AZURE_CLIENT_ID", "")
    azure_client_secret: str = os.getenv("AZURE_CLIENT_SECRET", "")
    azure_tenant_id: str = os.getenv("AZURE_TENANT_ID", "common")
    azure_redirect_uri: str = os.getenv("AZURE_REDIRECT_URI", "http://localhost:8000/api/auth/microsoft/callback")
    onedrive_api_url: str = os.getenv("ONEDRIVE_API_URI", "https://graph.microsoft.com/v1.0/me/drive")

    # OpenAI Configuration
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    
    # Application Configuration
    app_name: str = "SharePoint AI Platform"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()