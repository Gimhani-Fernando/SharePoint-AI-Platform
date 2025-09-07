from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging
import uuid

from ..database import db_manager
from .assignments import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str
    manager_id: Optional[str]
    created_at: str
    updated_at: str

@router.get("/", response_model=List[ProjectResponse])
async def get_projects():
    """Get all projects"""
    try:
        projects = await db_manager.get_all_projects()
        
        # Transform projects to match response model
        formatted_projects = []
        for project in projects:
            formatted_project = ProjectResponse(
                id=project["id"],
                name=project["name"],
                description=project.get("description"),
                status=project.get("status", "active"),
                manager_id=project.get("manager_id"),
                created_at=project["created_at"],
                updated_at=project["updated_at"]
            )
            formatted_projects.append(formatted_project)
        
        return formatted_projects
    
    except Exception as e:
        logger.error(f"Error getting projects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve projects"
        )

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new project"""
    try:
        project_data = {
            "id": str(uuid.uuid4()),
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "manager_id": current_user["id"]
        }
        
        created_project = await db_manager.create_project(project_data)
        
        if not created_project:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create project"
            )
        
        return ProjectResponse(
            id=created_project["id"],
            name=created_project["name"],
            description=created_project.get("description"),
            status=created_project["status"],
            manager_id=created_project.get("manager_id"),
            created_at=created_project["created_at"],
            updated_at=created_project["updated_at"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create project"
        )