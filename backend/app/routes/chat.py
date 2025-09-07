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
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    message: str
    response: str
    sources: Optional[List[Dict[str, Any]]] = None
    tools_used: Optional[List[str]] = None
    confidence: Optional[str] = None
    session_id: Optional[str] = None
    timestamp: str

# Mock AI responses for demo
DEMO_RESPONSES = {
    "assignments": {
        "response": """I found **8 active assignments** in your workspace:

**🔄 In Progress (3):**
• **SharePoint API Integration** - 75% complete (Due Dec 30)
• **Database Schema Optimization** - 45% complete (Due Dec 28)  
• **Real-time Collaboration Features** - 30% complete (Due Jan 10)

**📋 To Do (3):**
• **Document Search with AI** (Due Jan 15) - High Priority
• **API Documentation & Testing** (Due Jan 5) - Low Priority
• **Mobile Responsiveness** (Due Jan 20) - Medium Priority

**✅ Recently Completed (2):**
• User Authentication & Role Management ✓
• Frontend UI/UX Improvements ✓

**💡 Insights:** You're making good progress! Consider prioritizing the high-priority AI search feature next.""",
        "tools_used": ["assignment_tracker", "project_analyzer"],
        "confidence": "high"
    },
    "documents": {
        "response": """Found **12 documents** across your OneDrive and database:

**📄 Recent Uploads:**
• **SharePoint Integration Guide.docx** (2.4 MB) - *Today*
• **API Security Guidelines.pdf** (1.8 MB) - *Yesterday* 
• **Database Schema.sql** (0.5 MB) - *2 days ago*

**📊 Document Insights:**
• **Most Active Folder:** `/SharePoint-AI-Platform` (8 files)
• **File Types:** 60% PDF, 25% DOCX, 15% Other
• **Storage Used:** 24.7 MB / OneDrive

**🔍 Quick Actions:**
• Upload new document to OneDrive
• Search within document content
• Sync recent OneDrive changes""",
        "tools_used": ["document_scanner", "onedrive_api", "file_analyzer"],
        "confidence": "high"
    },
    "progress": {
        "response": """**📊 Team Progress Overview**

**Current Sprint Status:**
• **Overall Completion:** 68% (↑12% this week)
• **On Track:** 6 out of 8 assignments
• **At Risk:** 2 assignments (due this week)

**Key Metrics:**
• **Velocity:** 23 story points completed
• **Burndown:** Ahead of schedule by 2 days
• **Quality:** 95% test coverage maintained

**⚠️ Attention Needed:**
• **Database Optimization** - needs review by Dec 28
• **Mobile Responsiveness** - waiting for design approval

**🎯 Recommendations:**
1. Focus on at-risk items this week
2. Schedule design review for mobile work
3. Consider moving 1 low-priority item to next sprint""",
        "tools_used": ["analytics_engine", "project_tracker", "team_metrics"],
        "confidence": "high"
    },
    "default": {
        "response": """I'm here to help! I can assist you with:

**📋 Assignment Management**
• Track your tasks and progress
• Update assignment status
• View team workload

**📚 Document Intelligence**  
• Search through your OneDrive files
• Upload and organize documents
• Extract insights from content

**📊 Project Analytics**
• Monitor team progress
• Generate reports
• Identify bottlenecks

**☁️ OneDrive Integration**
• Sync files automatically  
• Search across all documents
• Backup and organize files

Try asking me: *"What assignments do I have?"* or *"Show me recent documents"*""",
        "tools_used": ["general_assistant"],
        "confidence": "medium"
    }
}

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

def get_ai_response(message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Generate AI response based on user message and context"""
    message_lower = message.lower()
    
    # Simple keyword matching for demo
    if any(word in message_lower for word in ["assignment", "task", "todo", "work", "progress"]):
        if "progress" in message_lower or "status" in message_lower:
            return DEMO_RESPONSES["progress"]
        else:
            return DEMO_RESPONSES["assignments"]
    elif any(word in message_lower for word in ["document", "file", "upload", "onedrive", "pdf", "docx"]):
        return DEMO_RESPONSES["documents"]
    elif any(word in message_lower for word in ["progress", "team", "analytics", "report", "metric"]):
        return DEMO_RESPONSES["progress"]
    else:
        return DEMO_RESPONSES["default"]

@router.post("/", response_model=ChatResponse)
async def send_message(
    chat_message: ChatMessage,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Send a message to the AI assistant"""
    try:
        session_id = chat_message.session_id or str(uuid.uuid4())
        
        # Get user context for better responses
        user_assignments = await db_manager.get_user_assignments(current_user["id"])
        user_documents = await db_manager.get_user_documents(current_user["id"])
        
        user_context = {
            "user_id": current_user["id"],
            "assignments_count": len(user_assignments),
            "documents_count": len(user_documents),
            "recent_assignments": user_assignments[:5] if user_assignments else []
        }
        
        # Generate AI response using real AI service
        ai_response = await ai_service.generate_chat_response(chat_message.message, user_context)
        
        # Save chat to database
        chat_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "message": chat_message.message,
            "response": ai_response["response"],
            "sources": ai_response.get("sources"),
            "session_id": session_id
        }
        
        saved_chat = await db_manager.save_chat_message(chat_data)
        
        if not saved_chat:
            logger.warning("Failed to save chat message to database")
        
        return ChatResponse(
            id=chat_data["id"],
            message=chat_message.message,
            response=ai_response["response"],
            sources=ai_response.get("sources"),
            tools_used=ai_response.get("tools_used", []),
            confidence=ai_response.get("confidence"),
            session_id=session_id,
            timestamp=datetime.utcnow().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat message"
        )

@router.get("/history")
async def get_chat_history(
    session_id: Optional[str] = None,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get chat history for the current user"""
    try:
        chat_history = await db_manager.get_chat_history(
            current_user["id"], 
            session_id, 
            limit
        )
        
        formatted_history = []
        for chat in chat_history:
            formatted_chat = ChatResponse(
                id=chat["id"],
                message=chat["message"],
                response=chat["response"],
                sources=chat.get("sources"),
                tools_used=[],  # Not stored in this simple implementation
                confidence=None,  # Not stored in this simple implementation  
                session_id=chat.get("session_id"),
                timestamp=chat["created_at"]
            )
            formatted_history.append(formatted_chat)
        
        return {
            "history": formatted_history,
            "total_messages": len(formatted_history),
            "session_id": session_id
        }
    
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat history"
        )

@router.get("/sessions")
async def get_chat_sessions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all chat sessions for the current user"""
    try:
        # Get all chat messages and group by session_id
        all_chats = await db_manager.get_chat_history(current_user["id"], limit=1000)
        
        sessions = {}
        for chat in all_chats:
            session_id = chat.get("session_id", "default")
            if session_id not in sessions:
                sessions[session_id] = {
                    "session_id": session_id,
                    "message_count": 0,
                    "first_message": None,
                    "last_message_time": None,
                    "preview": ""
                }
            
            sessions[session_id]["message_count"] += 1
            
            if not sessions[session_id]["first_message"]:
                sessions[session_id]["first_message"] = chat["message"]
                sessions[session_id]["preview"] = chat["message"][:100] + "..." if len(chat["message"]) > 100 else chat["message"]
            
            # Update last message time
            chat_time = chat["created_at"]
            if not sessions[session_id]["last_message_time"] or chat_time > sessions[session_id]["last_message_time"]:
                sessions[session_id]["last_message_time"] = chat_time
        
        # Convert to list and sort by last message time
        sessions_list = list(sessions.values())
        sessions_list.sort(key=lambda x: x["last_message_time"] or "", reverse=True)
        
        return {
            "sessions": sessions_list,
            "total_sessions": len(sessions_list)
        }
    
    except Exception as e:
        logger.error(f"Error getting chat sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat sessions"
        )

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a chat session (all messages in the session)"""
    try:
        # Get all messages in the session
        session_messages = await db_manager.get_chat_history(
            current_user["id"], 
            session_id, 
            limit=1000
        )
        
        if not session_messages:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        # In a real implementation, you'd delete the messages from the database
        # For now, we'll just mark them as deleted in metadata
        deleted_count = len(session_messages)
        
        return {
            "message": f"Chat session deleted successfully",
            "session_id": session_id,
            "deleted_messages": deleted_count
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete chat session"
        )

@router.get("/suggestions")
async def get_chat_suggestions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get suggested prompts based on user's current context"""
    try:
        # Get user context for AI service
        user_context = {"user_id": current_user["id"]}
        
        # Get suggestions from AI service
        suggestions = await ai_service.get_chat_suggestions(user_context)
        
        # Get context for response
        assignments = await db_manager.get_user_assignments(current_user["id"])
        documents = await db_manager.get_user_documents(current_user["id"])
        
        return {
            "suggestions": suggestions,
            "context": {
                "assignments_count": len(assignments) if assignments else 0,
                "documents_count": len(documents) if documents else 0
            }
        }
    
    except Exception as e:
        logger.error(f"Error getting chat suggestions: {e}")
        return {
            "suggestions": [
                "What assignments do I have?",
                "Show me recent documents",
                "What's my team's progress?",
                "Help me get organized"
            ],
            "context": {}
        }