-- =============================================================
-- Zuno App — Knowledge Engine: content_chunks + RAG search
-- =============================================================

-- =============================================================
-- 1. Content Chunks Table
-- Stores chunked text segments with Vertex AI embeddings (768 dims)
-- for RAG retrieval. Each chunk belongs to a content item.
-- =============================================================

CREATE TABLE public.content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  token_count INTEGER DEFAULT 0,
  embedding VECTOR(768),  -- Vertex AI text-embedding-005 = 768 dimensions
  metadata JSONB DEFAULT '{}',  -- source title, platform, url, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_chunks_content ON public.content_chunks(content_id);
CREATE INDEX idx_chunks_user ON public.content_chunks(user_id);
CREATE INDEX idx_chunks_content_index ON public.content_chunks(content_id, chunk_index);

-- HNSW index for fast approximate nearest-neighbor search on embeddings
CREATE INDEX idx_chunks_embedding ON public.content_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);


-- =============================================================
-- 2. Add full_text column to content for storing raw scraped text
-- =============================================================

ALTER TABLE public.content
  ADD COLUMN IF NOT EXISTS full_text TEXT;


-- =============================================================
-- 3. RPC: match_chunks — vector similarity search on chunks
-- Returns top-k chunks for a user filtered by cosine similarity
-- =============================================================

CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(768),
  match_user_id UUID,
  match_count INT DEFAULT 8,
  similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  content_id UUID,
  chunk_index INTEGER,
  chunk_text TEXT,
  token_count INTEGER,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL
STABLE
AS $$
SELECT
  cc.id,
  cc.content_id,
  cc.chunk_index,
  cc.chunk_text,
  cc.token_count,
  cc.metadata,
  (1 - (cc.embedding <=> query_embedding))::FLOAT AS similarity
FROM public.content_chunks cc
WHERE cc.user_id = match_user_id
  AND cc.embedding IS NOT NULL
  AND (1 - (cc.embedding <=> query_embedding)) > similarity_threshold
ORDER BY cc.embedding <=> query_embedding
LIMIT match_count;
$$;


-- =============================================================
-- 4. Row Level Security for content_chunks
-- =============================================================

ALTER TABLE public.content_chunks ENABLE ROW LEVEL SECURITY;

-- Users can view their own chunks
CREATE POLICY "Users can view own chunks"
  ON public.content_chunks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own chunks (service role bypasses RLS anyway)
CREATE POLICY "Users can create own chunks"
  ON public.content_chunks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own chunks
CREATE POLICY "Users can delete own chunks"
  ON public.content_chunks FOR DELETE
  USING (auth.uid() = user_id);
