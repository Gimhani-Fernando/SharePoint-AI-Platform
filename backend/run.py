#!/usr/bin/env python3
"""
SharePoint AI Platform Backend
Run this file to start the development server
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("DEBUG", "True").lower() == "true"
    
    print("Starting SharePoint AI Platform Backend...")
    print(f"Server will be available at: http://localhost:{port}")
    print(f"API Documentation: http://localhost:{port}/docs")
    print(f"Debug mode: {reload}")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        reload_dirs=["app"] if reload else None
    )