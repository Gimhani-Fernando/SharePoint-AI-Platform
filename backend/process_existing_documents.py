#!/usr/bin/env python3
"""
Script to process existing documents that are in 'pending' status
This will extract text content and create embeddings for AI search
"""
import asyncio
import sys
import logging

# Add the app directory to path
sys.path.append('app')

from app.database import db_manager
from app.ai_service import ai_service
from app.document_processor import document_processor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_existing_documents():
    """Process all documents with pending status"""
    print("Processing Existing Documents")
    print("=" * 50)
    
    try:
        # Initialize services
        await db_manager.initialize()
        
        # Get all documents with pending status
        pending_docs = db_manager.client.table("documents").select("*").eq("processing_status", "pending").execute()
        
        if not pending_docs.data:
            print("No pending documents found to process!")
            return
            
        print(f"Found {len(pending_docs.data)} pending documents to process")
        
        processed_count = 0
        failed_count = 0
        
        for doc in pending_docs.data:
            doc_id = doc["id"]
            title = doc["title"]
            
            print(f"\nProcessing: {title} (ID: {doc_id})")
            
            try:
                # Check if document has content already
                if doc.get("content") and doc["content"].strip():
                    content = doc["content"]
                    print(f"  - Using existing extracted content ({len(content)} chars)")
                else:
                    print(f"  - No content found, skipping...")
                    continue
                
                # Update status to processing
                await db_manager.update_document(doc_id, {"processing_status": "processing"})
                
                # Process with AI service
                processing_result = await ai_service.process_document_content(
                    content,
                    doc_id,
                    {
                        "filename": title,
                        "file_type": doc.get("file_type", "unknown"),
                        "uploaded_by": doc.get("uploaded_by", "unknown"),
                        "reprocessing": True
                    }
                )
                
                # Update document status based on result
                if processing_result and processing_result.get("success"):
                    await db_manager.update_document(doc_id, {
                        "processing_status": "completed",
                        "processed_at": db_manager.get_timestamp(),
                        "chunk_count": processing_result.get("processed_chunks", 0)
                    })
                    print(f"  - SUCCESS: Created {processing_result.get('processed_chunks', 0)} chunks")
                    processed_count += 1
                else:
                    await db_manager.update_document(doc_id, {
                        "processing_status": "failed",
                        "error_message": processing_result.get("error") if processing_result else "Processing failed"
                    })
                    print(f"  - FAILED: {processing_result.get('error') if processing_result else 'Unknown error'}")
                    failed_count += 1
                    
            except Exception as e:
                await db_manager.update_document(doc_id, {
                    "processing_status": "failed",
                    "error_message": str(e)
                })
                print(f"  - ERROR: {str(e)}")
                failed_count += 1
                
        print(f"\n" + "=" * 50)
        print(f"Processing Complete!")
        print(f"  - Processed successfully: {processed_count}")
        print(f"  - Failed: {failed_count}")
        print(f"  - Total: {processed_count + failed_count}")
        
    except Exception as e:
        logger.error(f"Error during processing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(process_existing_documents())