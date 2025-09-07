from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging
import uuid
from datetime import datetime

from ..database import db_manager
from ..ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # low, medium, high
    due_date: Optional[str] = None
    assignee_id: Optional[str] = None
    project_id: Optional[str] = None

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # todo, in-progress, completed
    priority: Optional[str] = None
    due_date: Optional[str] = None
    progress: Optional[int] = None
    assignee_id: Optional[str] = None
    project_id: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[str]
    progress: int
    assignee_id: Optional[str]
    project_id: Optional[str]
    created_at: str
    updated_at: str
    projects: Optional[Dict[str, Any]] = None

# Development: Get current user from email header
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

@router.get("/", response_model=List[AssignmentResponse])
async def get_assignments(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all assignments for the current user"""
    try:
        # Get assignments by user ID and email (to handle both cases)
        assignments_by_id = await db_manager.get_user_assignments(current_user["id"])
        assignments_by_email = await db_manager.get_user_assignments_by_email(current_user["email"])
        
        # Combine and deduplicate assignments
        all_assignments = assignments_by_id + assignments_by_email
        seen_ids = set()
        unique_assignments = []
        for assignment in all_assignments:
            if assignment["id"] not in seen_ids:
                seen_ids.add(assignment["id"])
                unique_assignments.append(assignment)
        
        # Transform assignments to match response model
        formatted_assignments = []
        for assignment in unique_assignments:
            formatted_assignment = AssignmentResponse(
                id=assignment["id"],
                title=assignment["title"],
                description=assignment.get("description"),
                status=assignment.get("status", "todo"),
                priority=assignment.get("priority", "medium"),
                due_date=assignment.get("due_date"),
                progress=assignment.get("progress", 0),
                assignee_id=assignment.get("assignee_id"),
                project_id=assignment.get("project_id"),
                created_at=assignment["created_at"],
                updated_at=assignment["updated_at"],
                projects=assignment.get("projects")
            )
            formatted_assignments.append(formatted_assignment)
        
        return formatted_assignments
    
    except Exception as e:
        logger.error(f"Error getting assignments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve assignments"
        )

@router.post("/", response_model=AssignmentResponse)
async def create_assignment(
    assignment: AssignmentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new assignment"""
    try:
        # Handle assignee_id - convert email to user ID if needed
        assignee_id = current_user["id"]  # Default to current user
        
        if assignment.assignee_id:
            # Check if assignee_id is an email or already a UUID
            if "@" in assignment.assignee_id:
                # It's an email, look up the user
                assignee_user = await db_manager.get_user_by_email(assignment.assignee_id)
                if assignee_user:
                    assignee_id = assignee_user["id"]
                else:
                    # If user not found, create a placeholder or use current user
                    logger.warning(f"User with email {assignment.assignee_id} not found, assigning to current user")
                    assignee_id = current_user["id"]
            else:
                # Assume it's already a user ID
                assignee_id = assignment.assignee_id
        
        assignment_data = {
            "id": str(uuid.uuid4()),
            "title": assignment.title,
            "description": assignment.description,
            "status": "todo",  # Default status
            "priority": assignment.priority,
            "due_date": assignment.due_date,
            "progress": 0,  # Default progress
            "assignee_id": assignee_id,
            "project_id": assignment.project_id
        }
        
        created_assignment = await db_manager.create_assignment(assignment_data)
        
        if not created_assignment:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create assignment!!"
            )
        
        return AssignmentResponse(
            id=created_assignment["id"],
            title=created_assignment["title"],
            description=created_assignment.get("description"),
            status=created_assignment["status"],
            priority=created_assignment["priority"],
            due_date=created_assignment.get("due_date"),
            progress=created_assignment["progress"],
            assignee_id=created_assignment.get("assignee_id"),
            project_id=created_assignment.get("project_id"),
            created_at=created_assignment["created_at"],
            updated_at=created_assignment["updated_at"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating assignment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create assignment."
        )

@router.get("/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(
    assignment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific assignment by ID"""
    try:
        # Get all user assignments and find the specific one
        assignments = await db_manager.get_user_assignments(current_user["id"])
        assignment = next((a for a in assignments if a["id"] == assignment_id), None)
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found"
            )
        
        return AssignmentResponse(
            id=assignment["id"],
            title=assignment["title"],
            description=assignment.get("description"),
            status=assignment.get("status", "todo"),
            priority=assignment.get("priority", "medium"),
            due_date=assignment.get("due_date"),
            progress=assignment.get("progress", 0),
            assignee_id=assignment.get("assignee_id"),
            project_id=assignment.get("project_id"),
            created_at=assignment["created_at"],
            updated_at=assignment["updated_at"],
            projects=assignment.get("projects")
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting assignment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve assignment"
        )

@router.put("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: str,
    assignment_update: AssignmentUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update an existing assignment"""
    try:
        # Prepare update data (only include non-None values)
        update_data = {}
        if assignment_update.title is not None:
            update_data["title"] = assignment_update.title
        if assignment_update.description is not None:
            update_data["description"] = assignment_update.description
        if assignment_update.status is not None:
            update_data["status"] = assignment_update.status
        if assignment_update.priority is not None:
            update_data["priority"] = assignment_update.priority
        if assignment_update.due_date is not None:
            update_data["due_date"] = assignment_update.due_date
        if assignment_update.progress is not None:
            update_data["progress"] = assignment_update.progress
        if assignment_update.assignee_id is not None:
            update_data["assignee_id"] = assignment_update.assignee_id
        if assignment_update.project_id is not None:
            update_data["project_id"] = assignment_update.project_id
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided"
            )
        
        updated_assignment = await db_manager.update_assignment(assignment_id, update_data)
        
        if not updated_assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found or update failed"
            )
        
        return AssignmentResponse(
            id=updated_assignment["id"],
            title=updated_assignment["title"],
            description=updated_assignment.get("description"),
            status=updated_assignment["status"],
            priority=updated_assignment["priority"],
            due_date=updated_assignment.get("due_date"),
            progress=updated_assignment["progress"],
            assignee_id=updated_assignment.get("assignee_id"),
            project_id=updated_assignment.get("project_id"),
            created_at=updated_assignment["created_at"],
            updated_at=updated_assignment["updated_at"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating assignment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update assignment"
        )

@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete an assignment"""
    try:
        success = await db_manager.delete_assignment(assignment_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found or deletion failed"
            )
        
        return {"message": "Assignment deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting assignment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete assignment"
        )

@router.patch("/{assignment_id}/status")
async def update_assignment_status(
    assignment_id: str,
    status_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Quick update assignment status and progress"""
    try:
        new_status = status_data.get("status")
        new_progress = status_data.get("progress")
        
        if not new_status and new_progress is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status or progress must be provided"
            )
        
        update_data = {}
        if new_status:
            update_data["status"] = new_status
        if new_progress is not None:
            update_data["progress"] = new_progress
            
        updated_assignment = await db_manager.update_assignment(assignment_id, update_data)
        
        if not updated_assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found or update failed"
            )
        
        return {
            "message": "Assignment status updated successfully",
            "id": assignment_id,
            "status": updated_assignment.get("status"),
            "progress": updated_assignment.get("progress")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating assignment status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update assignment status"
        )

@router.get("/stats/summary")
async def get_assignment_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get assignment statistics for the current user"""
    try:
        assignments = await db_manager.get_user_assignments(current_user["id"])
        
        total_assignments = len(assignments)
        completed_assignments = len([a for a in assignments if a.get("status") == "completed"])
        in_progress_assignments = len([a for a in assignments if a.get("status") == "in-progress"])
        pending_assignments = len([a for a in assignments if a.get("status") == "todo"])
        high_priority_assignments = len([a for a in assignments if a.get("priority") == "high"])
        
        # Calculate completion rate
        completion_rate = (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0
        
        # Get overdue assignments (assignments past due date)
        now = datetime.utcnow().isoformat()
        overdue_assignments = []
        for assignment in assignments:
            if assignment.get("due_date") and assignment.get("status") != "completed":
                if assignment["due_date"] < now:
                    overdue_assignments.append(assignment)
        
        return {
            "total_assignments": total_assignments,
            "completed_assignments": completed_assignments,
            "in_progress_assignments": in_progress_assignments,
            "pending_assignments": pending_assignments,
            "high_priority_assignments": high_priority_assignments,
            "overdue_assignments": len(overdue_assignments),
            "completion_rate": round(completion_rate, 2)
        }
    
    except Exception as e:
        logger.error(f"Error getting assignment stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve assignment statistics"
        )

@router.post("/{assignment_id}/insights")
async def get_assignment_insights(
    assignment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate AI insights for a specific assignment"""
    try:
        # Get the assignment data
        assignments = await db_manager.get_user_assignments(current_user["id"])
        assignment = next((a for a in assignments if a["id"] == assignment_id), None)
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignment not found"
            )
        
        # Generate AI insights
        user_context = {"user_id": current_user["id"]}
        insights_result = await ai_service.generate_assignment_insights(assignment, user_context)
        
        if not insights_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate insights: {insights_result.get('error', 'Unknown error')}"
            )
        
        return {
            "assignment_id": assignment_id,
            "assignment_title": assignment.get("title"),
            "insights": insights_result["insights"],
            "generated_at": insights_result["generated_at"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating assignment insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate assignment insights"
        )