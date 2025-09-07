from fastapi import APIRouter, HTTPException, Depends, status, Request, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging
import uuid
from datetime import datetime
import requests
import io

from ..database import db_manager
from ..ai_service import ai_service
from ..document_processor import document_processor

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class DocumentResponse(BaseModel):
    id: str
    title: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_by: str
    created_at: str
    processed: bool = False

class ProcessDocumentRequest(BaseModel):
    document_id: str

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

@router.get("/")
async def get_documents(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all documents for the current user"""
    try:
        documents = await db_manager.get_user_documents(current_user["id"])
        return {
            "documents": documents,
            "total": len(documents)
        }
    except Exception as e:
        logger.error(f"Error getting documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve documents"
        )

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload and process a document with AI text extraction"""
    try:
        # Read file content
        file_content = await file.read()
        
        logger.info(f"Uploading document: {file.filename}, type: {file.content_type}, size: {len(file_content)} bytes")
        
        # Extract text content using document processor
        extracted_text, extraction_metadata = await document_processor.extract_text(
            file_content, 
            file.content_type, 
            file.filename
        )
        
        # Create document record with processing status
        doc_id = str(uuid.uuid4())
        document_data = {
            "id": doc_id,
            "title": file.filename,
            "file_type": file.content_type,
            "file_size": len(file_content),
            "uploaded_by": current_user["id"],
            "content": extracted_text if extracted_text else None,
            "processing_status": "pending" if extracted_text else "failed",
            "error_message": extraction_metadata.get("error") if not extracted_text else None
        }
        
        # Save document to database
        result = await db_manager.create_document(document_data)
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to save document")
        
        # Process document content with AI if text was extracted successfully
        processing_result = None
        if extracted_text and extracted_text.strip():
            logger.info(f"Processing extracted text ({len(extracted_text)} characters) with AI")
            
            # Update processing status
            await db_manager.update_document(doc_id, {"processing_status": "processing"})
            
            processing_result = await ai_service.process_document_content(
                extracted_text,
                doc_id,
                {
                    "filename": file.filename,
                    "file_type": file.content_type,
                    "uploaded_by": current_user["id"],
                    "extraction_metadata": extraction_metadata
                }
            )
            
            # Update processing status based on result
            if processing_result and processing_result.get("success"):
                await db_manager.update_document(doc_id, {
                    "processing_status": "completed",
                    "processed_at": db_manager.get_timestamp(),
                    "chunk_count": processing_result.get("processed_chunks", 0)
                })
                logger.info(f"Document {doc_id} processed successfully with {processing_result.get('processed_chunks', 0)} chunks")
            else:
                await db_manager.update_document(doc_id, {
                    "processing_status": "failed",
                    "error_message": processing_result.get("error") if processing_result else "Processing failed"
                })
                logger.error(f"Document {doc_id} processing failed: {processing_result.get('error') if processing_result else 'Unknown error'}")
        
        return {
            "message": "Document uploaded successfully",
            "document_id": doc_id,
            "filename": file.filename,
            "size": len(file_content),
            "content_type": file.content_type,
            "text_extracted": bool(extracted_text and extracted_text.strip()),
            "extraction_metadata": extraction_metadata,
            "ai_processed": processing_result.get("success", False) if processing_result else False,
            "chunks_created": processing_result.get("processed_chunks", 0) if processing_result else 0,
            "processing_status": "completed" if (processing_result and processing_result.get("success")) else ("failed" if extracted_text else "no_text")
        }
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )

@router.post("/process-onedrive")
async def process_onedrive_document(
    request_data: ProcessDocumentRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Process an existing OneDrive document for AI search"""
    try:
        # Get document from database
        document = await db_manager.get_document_by_id(request_data.document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if document.get("uploaded_by") != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Check if document has content to process
        if not document.get("content") and not document.get("onedrive_download_url"):
            raise HTTPException(status_code=400, detail="Document has no processable content")
        
        content_to_process = document.get("content")
        
        # If no content but has OneDrive URL, try to fetch content
        if not content_to_process and document.get("onedrive_download_url"):
            try:
                # Get OneDrive access token for user
                access_token = current_user.get("microsoft_access_token")
                if not access_token:
                    raise HTTPException(status_code=400, detail="OneDrive not connected")
                
                # Download file content
                headers = {"Authorization": f"Bearer {access_token}"}
                response = requests.get(document["onedrive_download_url"], headers=headers)
                
                if response.status_code == 200:
                    content_to_process = response.text
                else:
                    raise HTTPException(status_code=400, detail="Failed to download OneDrive file")
                    
            except Exception as e:
                logger.error(f"Error downloading OneDrive content: {e}")
                raise HTTPException(status_code=500, detail="Failed to process OneDrive document")
        
        # Process document with AI
        processing_result = await ai_service.process_document_content(
            content_to_process,
            request_data.document_id,
            {
                "filename": document.get("title", "Unknown"),
                "file_type": document.get("file_type", "unknown"),
                "uploaded_by": current_user["id"],
                "source": "onedrive"
            }
        )
        
        # Update document as processed
        await db_manager.update_document(request_data.document_id, {"processed": True})
        
        return {
            "message": "Document processed successfully",
            "document_id": request_data.document_id,
            "success": processing_result.get("success", False),
            "chunks_created": processing_result.get("processed_chunks", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing OneDrive document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}"
        )

@router.get("/search/{query}")
async def search_documents(
    query: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Search through document content using AI"""
    try:
        # Use AI service to search document chunks
        results = await ai_service.search_similar_chunks(query, limit=10)
        
        return {
            "query": query,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search documents"
        )

@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific document"""
    try:
        document = await db_manager.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if document.get("uploaded_by") != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document"
        )

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a document and its chunks"""
    try:
        # Get document to verify ownership
        document = await db_manager.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if document.get("uploaded_by") != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete document chunks first (due to foreign key constraint)
        db_manager.client.table("document_chunks").delete().eq("document_id", document_id).execute()
        
        # Delete document
        result = db_manager.client.table("documents").delete().eq("id", document_id).execute()
        
        return {
            "message": "Document deleted successfully",
            "document_id": document_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )

# OneDrive integration endpoints
@router.get("/onedrive/status")
async def check_onedrive_status(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Check OneDrive connection status"""
    try:
        has_token = bool(current_user.get("microsoft_access_token"))
        
        return {
            "connected": has_token,
            "user_email": current_user.get("email"),
            "status": "connected" if has_token else "not_connected"
        }
        
    except Exception as e:
        logger.error(f"Error checking OneDrive status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check OneDrive status"
        )