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
        """Search for similar document chunks using vector embeddings with text search fallback"""
        try:
            # First try vector similarity search if we have OpenAI client
            if self.client:
                try:
                    # Create query embedding
                    query_embedding = await self.create_embedding(query)
                    
                    # Use vector similarity search through database manager
                    chunks = await db_manager.vector_search_chunks(query_embedding, limit)
                    
                    if chunks:
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
                        
                        logger.info(f"Found {len(formatted_chunks)} similar chunks via vector search for query: {query[:50]}...")
                        return formatted_chunks
                except Exception as vector_error:
                    logger.warning(f"Vector search failed: {str(vector_error)}, falling back to text search")
            
            # Fallback to text search with multiple search terms
            logger.info(f"Using text search fallback for query: {query[:50]}...")
            text_chunks = []
            
            # Try the original query first
            text_chunks = await db_manager.search_document_chunks(query, limit)
            
            # If no results, try individual words from the query
            if not text_chunks and len(query.split()) > 1:
                for word in query.split():
                    if len(word) > 2:  # Only search for words longer than 2 characters
                        word_chunks = await db_manager.search_document_chunks(word, limit)
                        text_chunks.extend(word_chunks)
                        if len(text_chunks) >= limit:
                            text_chunks = text_chunks[:limit]
                            break
            
            # Format text search results to match vector search format
            formatted_chunks = []
            for chunk in text_chunks:
                doc_info = chunk.get("documents", {})
                formatted_chunks.append({
                    "id": chunk["id"],
                    "document_id": chunk["document_id"], 
                    "content": chunk["content"],
                    "metadata": chunk.get("metadata", {}),
                    "document_title": doc_info.get("title", "Unknown") if doc_info else "Unknown",
                    "file_type": doc_info.get("file_type", "unknown") if doc_info else "unknown",
                    "similarity": 0.8  # Default similarity for text search
                })
            
            logger.info(f"Found {len(formatted_chunks)} chunks via text search for query: {query[:50]}...")
            return formatted_chunks
            
        except Exception as e:
            logger.error(f"Error in all search methods: {str(e)}")
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
                for assignment in assignments[:5]:  # Show top 5
                    status = assignment.get("status", "unknown")
                    title = assignment.get("title", "Unknown")
                    due_date = assignment.get("due_date", "No due date")
                    priority = assignment.get("priority", "medium")
                    progress = assignment.get("progress", 0)
                    description = assignment.get("description", "No description")[:100]
                    
                    context_parts.append(f"- **{title}** ({status})")
                    context_parts.append(f"  Priority: {priority} | Progress: {progress}% | Due: {due_date}")
                    if description != "No description":
                        context_parts.append(f"  Description: {description}...")
                context_parts.append("")
            
            if documents:
                context_parts.append(f"USER HAS {len(documents)} DOCUMENTS AVAILABLE:")
                for doc in documents[:5]:  # Show top 5
                    title = doc.get("title", "Unknown document")
                    file_type = doc.get("file_type", "unknown")
                    created_at = doc.get("created_at", "unknown date")[:10]  # Just date part
                    file_size = doc.get("file_size", 0)
                    
                    size_kb = round(file_size / 1024, 1) if file_size else "Unknown"
                    context_parts.append(f"- **{title}** ({file_type}) - {size_kb}KB, uploaded {created_at}")
                context_parts.append("")
            
            # Build the prompt
            system_prompt = """You are an AI assistant for a SharePoint document management platform. You help users with:
1. Finding information in their documents
2. Managing assignments and tasks
3. Organizing their work
4. Answering questions based on their uploaded documents

IMPORTANT INSTRUCTIONS:
- When users ask about assignments/tasks: Use the assignments data provided in context to give specific details
- When users ask about documents: Use the documents data provided to list actual files with names and details
- When users ask about due dates: Check the assignments for specific due dates
- When users ask about document names: List the actual document titles from the context
- Be helpful, concise, and specific. Always use the provided context data.
- If context shows "No specific documents or context available", then say you don't have access to the data."""
            context_text = "\n".join(context_parts) if context_parts else "No specific documents or context available."
            
            # Debug: Log the context being sent to AI
            logger.info(f"AI Context for user {user_id}: {context_text[:500]}...")
            
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

    async def generate_assignment_insights(self, assignment_data: Dict[str, Any], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI insights for a specific assignment including document suggestions and timeline"""
        try:
            user_id = user_context.get("user_id")
            
            # Get user's documents for matching
            documents = []
            if user_id:
                documents = await db_manager.get_user_documents(user_id)
            
            # Search for relevant document chunks based on assignment content
            search_queries = []
            if assignment_data.get("title"):
                search_queries.append(assignment_data["title"])
            if assignment_data.get("description"):
                search_queries.append(assignment_data["description"])
            
            relevant_chunks = []
            for query in search_queries:
                if query and len(query.strip()) > 3:
                    chunks = await self.search_similar_chunks(query, limit=3)
                    relevant_chunks.extend(chunks)
            
            # Remove duplicates
            seen_doc_ids = set()
            unique_chunks = []
            for chunk in relevant_chunks:
                if chunk.get("document_id") not in seen_doc_ids:
                    unique_chunks.append(chunk)
                    seen_doc_ids.add(chunk.get("document_id"))
            
            # Build AI prompt for insights
            assignment_info = f"""
ASSIGNMENT DETAILS:
- Title: {assignment_data.get('title', 'Unknown')}
- Description: {assignment_data.get('description', 'No description provided')}
- Status: {assignment_data.get('status', 'pending')}
- Priority: {assignment_data.get('priority', 'medium')}
- Due Date: {assignment_data.get('due_date', 'No due date')}
- Progress: {assignment_data.get('progress', 0)}%
"""

            documents_context = ""
            if documents:
                documents_context = f"\nAVAILABLE DOCUMENTS ({len(documents)} total):\n"
                for doc in documents[:10]:  # Show top 10 documents
                    documents_context += f"- {doc.get('title', 'Unknown')} ({doc.get('file_type', 'unknown')})\n"

            relevant_content = ""
            if unique_chunks:
                relevant_content = f"\nRELEVANT DOCUMENT CONTENT:\n"
                for i, chunk in enumerate(unique_chunks[:3], 1):
                    relevant_content += f"{i}. From '{chunk.get('document_title', 'Unknown')}': {chunk.get('content', '')[:200]}...\n"

            system_prompt = """You are an AI assignment assistant that helps users complete their tasks efficiently. 

Your job is to analyze an assignment and provide:
1. RELEVANT DOCUMENTS: Suggest which of the user's uploaded documents might be helpful for this assignment
2. TASK BREAKDOWN: Create a timeline with specific, actionable subtasks
3. TIPS & INSIGHTS: Provide strategic advice for completing the assignment

Be specific, practical, and helpful. Focus on actionable suggestions."""

            user_prompt = f"""Analyze this assignment and provide insights:

{assignment_info}
{documents_context}
{relevant_content}

Please provide a JSON response with this structure:
{{
    "relevant_documents": [
        {{
            "title": "Document name",
            "reason": "Why this document is relevant",
            "confidence": "high/medium/low"
        }}
    ],
    "task_breakdown": [
        {{
            "task": "Specific task description",
            "estimated_hours": 2,
            "deadline_suggestion": "X days before due date",
            "priority": "high/medium/low"
        }}
    ],
    "tips_and_insights": [
        "Practical tip 1",
        "Strategic advice 2",
        "Resource suggestion 3"
    ],
    "overall_strategy": "Brief paragraph summarizing the best approach to complete this assignment"
}}

Focus on being practical and specific to this assignment."""

            # Generate AI response
            if not self.client:
                # Fallback response when OpenAI is not available
                return self._generate_fallback_insights(assignment_data, unique_chunks, documents)
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            
            # Try to parse JSON response
            try:
                import json
                raw_insights = json.loads(ai_response)
                
                # Convert to frontend-expected format
                insights_data = {
                    "analysis": raw_insights.get("overall_strategy", "No analysis available"),
                    "timeline": self._convert_task_breakdown_to_timeline(raw_insights.get("task_breakdown", [])),
                    "document_suggestions": self._convert_documents_to_suggestions(raw_insights.get("relevant_documents", []), documents),
                    "recommendations": raw_insights.get("tips_and_insights", [])
                }
            except:
                # If JSON parsing fails, create structured response from text
                insights_data = {
                    "analysis": ai_response[:500] + "..." if len(ai_response) > 500 else ai_response,
                    "timeline": self._generate_basic_timeline(assignment_data),
                    "document_suggestions": self._extract_document_suggestions(unique_chunks, documents),
                    "recommendations": [
                        "Review relevant documents before starting",
                        "Break the task into smaller, manageable parts",
                        "Set intermediate deadlines to track progress"
                    ]
                }
            
            logger.info(f"Successfully generated insights for assignment: {assignment_data.get('id')}")
            logger.debug(f"Insights data structure: {insights_data}")
            
            return {
                "success": True,
                "insights": insights_data,
                "assignment_id": assignment_data.get("id"),
                "generated_at": db_manager.get_timestamp()
            }
            
        except Exception as e:
            logger.error(f"Error generating assignment insights: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "insights": self._generate_fallback_insights(assignment_data, [], [])
            }

    def _convert_task_breakdown_to_timeline(self, task_breakdown):
        """Convert task breakdown to timeline format expected by frontend"""
        timeline = []
        for task in task_breakdown:
            timeline.append({
                "step": task.get("task", "Unknown task"),
                "estimated_hours": task.get("estimated_hours", 2),
                "priority": task.get("priority", "medium")
            })
        return timeline
    
    def _convert_documents_to_suggestions(self, relevant_docs, available_docs):
        """Convert document suggestions to format expected by frontend"""
        suggestions = []
        for doc in relevant_docs:
            # Find matching document from available docs
            matching_doc = None
            for available in available_docs:
                if doc.get("title", "").lower() in available.get("title", "").lower():
                    matching_doc = available
                    break
            
            # Map confidence to relevance score
            confidence_map = {"high": 0.9, "medium": 0.7, "low": 0.5}
            relevance_score = confidence_map.get(doc.get("confidence", "medium"), 0.7)
            
            suggestions.append({
                "document_id": matching_doc.get("document_id") if matching_doc else f"doc_{len(suggestions)}",
                "title": doc.get("title", "Unknown Document"),
                "relevance_score": relevance_score,
                "reason": doc.get("reason", "Relevant to assignment requirements")
            })
        return suggestions

    def _extract_document_suggestions(self, chunks, documents):
        """Extract document suggestions from found chunks"""
        suggestions = []
        for chunk in chunks:
            suggestions.append({
                "document_id": chunk.get("document_id", f"doc_{len(suggestions)}"),
                "title": chunk.get("document_title", "Unknown"),
                "relevance_score": 0.8,
                "reason": "Contains relevant content for this assignment"
            })
        return suggestions

    def _generate_basic_timeline(self, assignment_data):
        """Generate basic timeline for assignment"""
        progress = assignment_data.get("progress", 0)
        
        timeline = []
        
        if progress < 25:
            timeline.append({
                "step": "Research and gather materials",
                "estimated_hours": 2,
                "priority": "high"
            })
        
        if progress < 50:
            timeline.append({
                "step": "Create outline and plan approach",
                "estimated_hours": 1,
                "priority": "high"
            })
        
        if progress < 75:
            timeline.append({
                "step": "Execute main work/development",
                "estimated_hours": 4,
                "priority": "high"
            })
        
        timeline.append({
            "step": "Review, test, and finalize",
            "estimated_hours": 2,
            "priority": "medium"
        })
        
        return timeline

    def _generate_fallback_insights(self, assignment_data, chunks, documents):
        """Generate basic insights when AI is not available"""
        return {
            "analysis": f"For '{assignment_data.get('title', 'this assignment')}', focus on systematic planning and execution. Use available resources and maintain steady progress toward the due date.",
            "timeline": self._generate_basic_timeline(assignment_data),
            "document_suggestions": self._extract_document_suggestions(chunks, documents),
            "recommendations": [
                "Break down the assignment into smaller tasks",
                "Review any relevant uploaded documents", 
                "Set intermediate deadlines to track progress",
                "Start with research and planning phase"
            ]
        }

# Global AI service instance
ai_service = AIService()