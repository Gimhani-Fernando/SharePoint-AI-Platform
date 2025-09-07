from supabase import create_client, Client
from typing import Optional, Dict, List, Any
from datetime import datetime
import asyncio
import logging

from .config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.client: Optional[Client] = None
    
    async def initialize(self):
        """Initialize the database connection"""
        try:
            self.client = create_client(
                settings.supabase_url, 
                settings.supabase_service_role_key
            )
            logger.info("Database connection initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database connection: {e}")
            raise
    
    async def close(self):
        """Close the database connection"""
        if self.client:
            # Supabase client doesn't need explicit closing
            logger.info("Database connection closed")
    
    async def health_check(self) -> Dict[str, Any]:
        """Check database health"""
        try:
            if not self.client:
                return {"status": "disconnected"}
            
            # Simple query to test connection
            result = self.client.table("users").select("id").limit(1).execute()
            return {
                "status": "connected",
                "tables_accessible": True
            }
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_timestamp(self) -> str:
        """Get current timestamp"""
        return datetime.utcnow().isoformat()
    
    # User management methods
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            result = self.client.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            result = self.client.table("users").select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    async def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            user_data["created_at"] = self.get_timestamp()
            user_data["updated_at"] = self.get_timestamp()
            result = self.client.table("users").insert(user_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    async def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user information"""
        try:
            user_data["updated_at"] = self.get_timestamp()
            result = self.client.table("users").update(user_data).eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return None
    
    async def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all users"""
        try:
            result = self.client.table("users").select("*").order("name").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            return []
    
    # Project management methods
    async def get_all_projects(self) -> List[Dict[str, Any]]:
        """Get all projects"""
        try:
            result = self.client.table("projects").select("*").order("name").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting all projects: {e}")
            return []

    async def create_project(self, project_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new project"""
        try:
            project_data["created_at"] = self.get_timestamp()
            project_data["updated_at"] = self.get_timestamp()
            result = self.client.table("projects").insert(project_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating project: {e}")
            return None

    # Assignment management methods
    async def get_user_assignments(self, user_id: str) -> List[Dict[str, Any]]:
        """Get assignments for a specific user"""
        try:
            result = self.client.table("assignments")\
                .select("*, projects(name)")\
                .eq("assignee_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user assignments: {e}")
            return []
    
    async def get_user_assignments_by_email(self, user_email: str) -> List[Dict[str, Any]]:
        """Get assignments for a specific user by email"""
        try:
            result = self.client.table("assignments")\
                .select("*, projects(name)")\
                .eq("assignee_id", user_email)\
                .order("created_at", desc=True)\
                .execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user assignments by email: {e}")
            return []
    
    async def create_assignment(self, assignment_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new assignment"""
        try:
            assignment_data["created_at"] = self.get_timestamp()
            assignment_data["updated_at"] = self.get_timestamp()
            result = self.client.table("assignments").insert(assignment_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating assignment: {e}")
            return None
    
    async def update_assignment(self, assignment_id: str, assignment_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update assignment"""
        try:
            assignment_data["updated_at"] = self.get_timestamp()
            result = self.client.table("assignments").update(assignment_data).eq("id", assignment_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating assignment: {e}")
            return None
    
    async def delete_assignment(self, assignment_id: str) -> bool:
        """Delete assignment"""
        try:
            result = self.client.table("assignments").delete().eq("id", assignment_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error deleting assignment: {e}")
            return False
    
    # Document management methods
    async def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get documents for a specific user"""
        try:
            result = self.client.table("documents")\
                .select("*")\
                .eq("uploaded_by", user_id)\
                .order("created_at", desc=True)\
                .execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user documents: {e}")
            return []
    
    async def create_document(self, document_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new document record"""
        try:
            document_data["created_at"] = self.get_timestamp()
            document_data["updated_at"] = self.get_timestamp()
            result = self.client.table("documents").insert(document_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating document: {e}")
            return None
    
    async def get_document_by_id(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        try:
            result = self.client.table("documents").select("*").eq("id", document_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting document by ID: {e}")
            return None
    
    async def update_document(self, document_id: str, document_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update document"""
        try:
            document_data["updated_at"] = self.get_timestamp()
            result = self.client.table("documents").update(document_data).eq("id", document_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating document: {e}")
            return None
    
    # Chat history methods
    async def save_chat_message(self, chat_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save chat message to database"""
        try:
            chat_data["created_at"] = self.get_timestamp()
            result = self.client.table("chat_messages").insert(chat_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error saving chat message: {e}")
            return None
    
    async def get_chat_history(self, user_id: str, session_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get chat history for a user"""
        try:
            query = self.client.table("chat_messages").select("*").eq("user_id", user_id)
            
            if session_id:
                query = query.eq("session_id", session_id)
            
            result = query.order("created_at", desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting chat history: {e}")
            return []

    # Document chunks methods
    async def create_document_chunk(self, chunk_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a document chunk with embedding"""
        try:
            chunk_data["created_at"] = self.get_timestamp()
            result = self.client.table("document_chunks").insert(chunk_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating document chunk: {e}")
            return None
    
    async def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a document"""
        try:
            result = self.client.table("document_chunks")\
                .select("*")\
                .eq("document_id", document_id)\
                .order("chunk_index")\
                .execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting document chunks: {e}")
            return []
    
    async def search_document_chunks(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search document chunks by content (simple text search for now)"""
        try:
            result = self.client.table("document_chunks")\
                .select("*, documents(title, file_type)")\
                .ilike("content", f"%{query}%")\
                .limit(limit)\
                .execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error searching document chunks: {e}")
            return []

    async def vector_search_chunks(self, query_embedding: List[float], limit: int = 5, match_threshold: float = 0.7) -> List[Dict[str, Any]]:
        """Search document chunks using vector similarity"""
        try:
            # Use the simpler search function to avoid overloading conflicts
            result = self.client.rpc(
                "search_document_chunks",
                {
                    "query_embedding": query_embedding,
                    "similarity_threshold": match_threshold,
                    "result_limit": limit
                }
            ).execute()
            
            # Transform the result to match expected format
            if result.data:
                return [
                    {
                        "id": chunk["chunk_id"],
                        "document_id": chunk["document_id"],
                        "content": chunk["content"],
                        "similarity": chunk["similarity_score"],
                        "document_title": chunk["document_title"]
                    }
                    for chunk in result.data
                ]
            return []
        except Exception as e:
            logger.error(f"Error in vector search: {e}")
            # Fallback to text search if vector search fails
            return []

# Global database manager instance
db_manager = DatabaseManager()