# AI Document Processing Setup Instructions

## Overview
Your SharePoint AI Platform now includes comprehensive AI-powered document processing that can:

1. **Extract text** from multiple file formats (PDF, Word, Excel, PowerPoint, HTML, plain text)
2. **Create vector embeddings** for semantic search using OpenAI
3. **Enable intelligent chat** that can answer questions about document content
4. **Search through document contents** using natural language

## Required Setup Steps

### 1. Add OpenAI API Key
Edit your `.env` file and uncomment one of the OpenAI API key lines:

```bash
# Uncomment one of these lines with your actual OpenAI API key
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

**Cost-Optimized Configuration:**
- Uses `text-embedding-3-small` for embeddings ($0.02/1M tokens)
- Uses `gpt-4o-mini` for chat responses ($0.15/1M input tokens)
- Chunks documents efficiently to minimize token usage

### 2. Install Document Processing Libraries
```bash
cd backend
pip install -r requirements.txt
```

### 3. Set Up Database Tables
Run the SQL script to create the document_chunks table:

```sql
-- Connect to your Supabase database and run:
-- File: backend/sql/create_document_chunks_table.sql

-- This will create:
-- - document_chunks table with vector embeddings
-- - Vector similarity search functions
-- - Proper indexes for performance
-- - Row-level security policies
```

### 4. Test the Setup

1. **Start the backend server:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

2. **Upload a document** through the Document Manager
3. **Ask questions** in the AI chat about the document content

## How It Works

### Document Upload Process
1. **File Upload** → Text extraction using appropriate library
2. **Text Chunking** → Split into 1000-character chunks with 200-character overlap
3. **Vector Embeddings** → Create OpenAI embeddings for each chunk
4. **Database Storage** → Store chunks with embeddings in Supabase

### AI Chat Process
1. **User Question** → Convert to vector embedding
2. **Similarity Search** → Find most relevant document chunks
3. **Context Building** → Combine relevant chunks with user context
4. **AI Response** → Generate answer using OpenAI with document context

## Supported File Formats

### Fully Supported (Text Extraction + AI Processing)
- ✅ **Plain Text** (.txt, .md, .csv, .json)
- ✅ **HTML** (.html, .htm)
- ✅ **PDF** (.pdf) - using PyPDF2
- ✅ **Word Documents** (.docx) - using python-docx
- ✅ **Excel Spreadsheets** (.xlsx) - using openpyxl
- ✅ **PowerPoint** (.pptx) - using python-pptx

### Partially Supported (Requires Conversion)
- ⚠️ **Legacy Word** (.doc) - recommend converting to .docx
- ⚠️ **Legacy Excel** (.xls) - using xlrd library
- ⚠️ **Legacy PowerPoint** (.ppt) - recommend converting to .pptx

### Examples of What the AI Can Do

**Document Content Questions:**
- "What are the key points in the security audit document?"
- "Summarize the budget spreadsheet"
- "What requirements are mentioned in the project proposal?"
- "Find all mentions of 'compliance' in my documents"

**Cross-Document Search:**
- "Which documents mention API security?"
- "Show me all assignment deadlines from my project files"
- "What documents are related to user authentication?"

**Contextual Assistance:**
- "Based on my documents, what should I prioritize this week?"
- "Help me understand the technical requirements from the specification"
- "What are the next steps mentioned in the project plan?"

## Performance & Cost Optimization

### Current Settings (Budget-Friendly)
- **Embedding Model:** `text-embedding-3-small` (cheapest option)
- **Chat Model:** `gpt-4o-mini` (cost-effective with good quality)
- **Chunk Size:** 1000 characters (optimal for cost/performance)
- **Max Chunks per Query:** 3 (limits token usage)

### Expected Costs (Approximate)
- **Document Processing:** ~$0.02 per 50 pages of text
- **Chat Queries:** ~$0.01-$0.05 per question depending on document context
- **Monthly Usage:** Typically $2-10 for moderate usage

## Troubleshooting

### Common Issues

**1. "OpenAI client not available"**
- Check that OPENAI_API_KEY is set in .env file
- Verify the API key is valid and has sufficient credits

**2. "Document processing failed"**
- Check if the file format is supported
- Verify the document isn't corrupted
- Check server logs for specific errors

**3. "No relevant documents found"**
- Make sure documents have been processed (check processing_status)
- Try more specific questions
- Verify the document_chunks table has data

**4. Vector search not working**
- Ensure the pgvector extension is enabled in Supabase
- Verify the match_document_chunks function exists
- Check database connection

### Debug Information
Check the server logs to see:
- Document upload and processing status
- Text extraction results
- Embedding creation
- Search query results
- AI response generation

## Next Steps

Once everything is working, you can:

1. **Upload existing documents** and let the AI process them
2. **Sync OneDrive documents** and process them for AI search
3. **Ask complex questions** spanning multiple documents
4. **Use the AI** for project planning and task management
5. **Scale up** by increasing chunk limits or using more powerful models

## Security Notes

- Document chunks are stored with row-level security
- Users can only search their own documents or shared project documents
- OpenAI does not store your document data (as per their policy)
- Vector embeddings are mathematical representations, not raw text storage