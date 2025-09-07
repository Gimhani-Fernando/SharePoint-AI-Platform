# AI service for document processing and intelligent chat
import os
import uuid
import logging
from typing import List, Dict, Any, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from openai import OpenAI
import numpy as np
from dotenv import load_dotenv
from .database import db_manager

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            logger.warning("OPENAI_API_KEY not found in environment variables")
            # Try to continue with mock responses for now
            self.client = None
            self.embeddings = None
            self.llm = None
        else:
            self.client = OpenAI(api_key=self.openai_api_key)
            # Use cheapest embedding model
            self.embeddings = OpenAIEmbeddings(
                api_key=self.openai_api_key,
                model="text-embedding-3-small"  # Cheapest embedding option
            )
            self.llm = ChatOpenAI(
                api_key=self.openai_api_key,
                model="gpt-4o-mini",  # Cheapest model at $0.15/1M input, $0.60/1M output
                temperature=0.7,
                max_tokens=200  # Further reduced to save costs
            )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,   # Reduced from 1000 to save on embedding costs
            chunk_overlap=150, # Reduced from 200
            length_function=len,
        )

    async def process_document_content(self, content: str, document_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Process document content into chunks with embeddings"""
        try:
            logger.info(f"Processing document {document_id} with {len(content)} characters")
            
            # Split content into chunks
            chunks = self.text_splitter.split_text(content)
            logger.info(f"Created {len(chunks)} chunks for document {document_id}")
            
            processed_chunks = 0
            
            for i, chunk in enumerate(chunks):
                if not chunk.strip():
                    continue
                
                # Create embedding for the chunk
                embedding = await self.create_embedding(chunk)
                
                # Save chunk to database using database manager
                chunk_data = {
                    "id": str(uuid.uuid4()),
                    "document_id": document_id,
                    "content": chunk,
                    "chunk_index": i,
                    "embedding": embedding,
                    "metadata": {**metadata, "chunk_index": i}
                }
                
                result = await db_manager.create_document_chunk(chunk_data)
                if result:
                    processed_chunks += 1
                    logger.debug(f"Saved chunk {i+1}/{len(chunks)} for document {document_id}")
            
            logger.info(f"Successfully processed {processed_chunks} chunks for document {document_id}")
            
            return {
                "success": True,
                "total_chunks": len(chunks),
                "processed_chunks": processed_chunks,
                "document_id": document_id
            }
            
        except Exception as e:
            logger.error(f"Error processing document {document_id}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "document_id": document_id
            }

    async def create_embedding(self, text: str) -> List[float]:
        """Create embedding for text using OpenAI"""
        try:
            if not self.client:
                logger.warning("OpenAI client not available, returning mock embedding")
                # Return a mock embedding vector of dimension 1536
                return [0.0] * 1536
            
            response = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=text.replace("\n", " ")
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error creating embedding: {str(e)}")
            # Return mock embedding on error
            return [0.0] * 1536

    async def search_similar_chunks(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar document chunks using vector embeddings"""
        try:
            # Create query embedding
            query_embedding = await self.create_embedding(query)
            
            # Use vector similarity search through database manager
            chunks = await db_manager.vector_search_chunks(query_embedding, limit)
            
            # Format results for consistency
            formatted_chunks = []
            for chunk in chunks:
                formatted_chunks.append({
                    "id": chunk["id"],
                    "document_id": chunk["document_id"],
                    "content": chunk["content"],
                    "metadata": chunk.get("metadata", {}),
                    "document_title": chunk.get("document_title", "Unknown"),
                    "file_type": chunk.get("document_file_type", "unknown"),
                    "similarity": chunk.get("similarity", 0.0)
                })
            
            logger.info(f"Found {len(formatted_chunks)} similar chunks for query: {query[:50]}...")
            return formatted_chunks
            
        except Exception as e:
            logger.error(f"Error searching similar chunks: {str(e)}")
            return []

    async def generate_chat_response(self, user_message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate intelligent chat response using OpenAI and document context"""
        try:
            logger.info(f"Generating chat response for user message: {user_message[:100]}...")
            
            # Search for relevant document chunks (reduced limit to save costs)
            relevant_chunks = await self.search_similar_chunks(user_message, limit=2)
            
            # Get user's assignments for additional context
            user_id = user_context.get("user_id")
            assignments = []
            documents = []
            
            if user_id:
                assignments = await db_manager.get_user_assignments(user_id)
                documents = await db_manager.get_user_documents(user_id)
            
            # Build context for the AI
            context_parts = []
            
            # Add document context if available
            if relevant_chunks:
                context_parts.append("RELEVANT DOCUMENTS:")
                for i, chunk in enumerate(relevant_chunks, 1):
                    context_parts.append(f"{i}. From '{chunk['document_title']}': {chunk['content'][:300]}...")
                context_parts.append("")
            
            # Add user context
            if assignments:
                context_parts.append(f"USER HAS {len(assignments)} ASSIGNMENTS:")
                for assignment in assignments[:3]:  # Show top 3
                    status = assignment.get("status", "unknown")
                    title = assignment.get("title", "Unknown")
                    context_parts.append(f"- {title} ({status})")
                context_parts.append("")
            
            if documents:
                context_parts.append(f"USER HAS {len(documents)} DOCUMENTS AVAILABLE")
                context_parts.append("")
            
            # Build the prompt
            system_prompt = """You are an AI assistant for a SharePoint document management platform. You help users with:
1. Finding information in their documents
2. Managing assignments and tasks
3. Organizing their work
4. Answering questions based on their uploaded documents

Be helpful, concise, and specific. When referencing documents, mention the document name.
If you don't have relevant information, say so clearly."""
            
            context_text = "\n".join(context_parts) if context_parts else "No specific documents or context available."
            
            user_prompt = f"""Context:
{context_text}

User Question: {user_message}

Please provide a helpful response based on the available context and documents."""
            
            # Generate response using OpenAI
            if not self.client:
                logger.warning("OpenAI client not available, returning fallback response")
                ai_response = f"I understand you're asking: '{user_message}'. However, I'm currently running in fallback mode without AI capabilities. Please check the OpenAI API key configuration."
            else:
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=800,
                    temperature=0.7
                )
                ai_response = response.choices[0].message.content
            
            # Prepare sources information
            sources = []
            if relevant_chunks:
                for chunk in relevant_chunks:
                    sources.append({
                        "document_title": chunk["document_title"],
                        "content_preview": chunk["content"][:150] + "...",
                        "file_type": chunk["file_type"]
                    })
            
            result = {
                "response": ai_response,
                "sources": sources,
                "context_used": {
                    "documents_found": len(relevant_chunks),
                    "assignments_count": len(assignments),
                    "total_documents": len(documents)
                },
                "confidence": "high" if relevant_chunks else "medium"
            }
            
            logger.info(f"Generated response with {len(sources)} sources")
            return result
            
        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            return {
                "response": f"I apologize, but I encountered an error processing your request: {str(e)}",
                "sources": [],
                "context_used": {},
                "confidence": "low"
            }

    async def get_chat_suggestions(self, user_context: Dict[str, Any]) -> List[str]:
        """Generate contextual chat suggestions based on user's data"""
        try:
            user_id = user_context.get("user_id")
            suggestions = [
                "What documents do I have?",
                "Help me organize my work",
                "What should I focus on today?"
            ]
            
            if user_id:
                # Get user's assignments and documents
                assignments = await db_manager.get_user_assignments(user_id)
                documents = await db_manager.get_user_documents(user_id)
                
                if assignments:
                    pending_count = len([a for a in assignments if a.get("status") == "todo"])
                    if pending_count > 0:
                        suggestions.append(f"Show me my {pending_count} pending assignments")
                    
                    in_progress_count = len([a for a in assignments if a.get("status") == "in-progress"])
                    if in_progress_count > 0:
                        suggestions.append(f"What's the status of my {in_progress_count} active tasks?")
                
                if documents:
                    suggestions.extend([
                        "Search through my uploaded documents",
                        "What are my most recent documents?",
                        "Summarize my document collection"
                    ])
            
            return suggestions[:6]  # Return max 6 suggestions
            
        except Exception as e:
            logger.error(f"Error generating suggestions: {str(e)}")
            return [
                "What can you help me with?",
                "Show me my assignments",
                "Help me find documents"
            ]

# Global AI service instance
ai_service = AIService()