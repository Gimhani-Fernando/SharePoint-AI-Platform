-- Fix vector search function conflicts
-- This script resolves the overloading issue with match_document_chunks function

-- Drop all existing versions of the function
DROP FUNCTION IF EXISTS match_document_chunks(vector, float, int);
DROP FUNCTION IF EXISTS match_document_chunks(vector, float, int, uuid[]);

-- Recreate the function with a single signature that handles optional filter
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    document_id uuid,
    content text,
    chunk_index integer,
    metadata jsonb,
    similarity float,
    document_title text,
    document_file_type text
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        dc.chunk_index,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) as similarity,
        d.title as document_title,
        d.file_type as document_file_type
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE 
        1 - (dc.embedding <=> query_embedding) > match_threshold
        AND (filter_document_ids IS NULL OR dc.document_id = ANY(filter_document_ids))
    ORDER BY similarity DESC
    LIMIT match_count;
$$;

-- Create a simpler version for basic search (fallback)
CREATE OR REPLACE FUNCTION search_document_chunks(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.7,
    result_limit int DEFAULT 10
)
RETURNS TABLE(
    chunk_id uuid,
    document_id uuid,
    content text,
    similarity_score float,
    document_title text
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        dc.id as chunk_id,
        dc.document_id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) as similarity_score,
        d.title as document_title
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE 1 - (dc.embedding <=> query_embedding) > similarity_threshold
    ORDER BY similarity_score DESC
    LIMIT result_limit;
$$;

-- Test function exists
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name IN ('match_document_chunks', 'search_document_chunks') 
AND routine_schema = 'public';