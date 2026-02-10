-- =============================================================
-- Zuno App — Migrate content.embedding from 1536 to 768 dims
-- (Consolidate to Vertex AI text-embedding-005)
-- =============================================================

-- 1. Change the content.embedding column from 1536 to 768 dimensions
--    (Vertex AI text-embedding-005 produces 768-dim vectors)
ALTER TABLE public.content
  ALTER COLUMN embedding TYPE VECTOR(768);


-- 2. Re-create the hybrid_search function to accept 768-dim vectors
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(768),
  match_count INT DEFAULT 20,
  full_text_weight FLOAT DEFAULT 1.0,
  semantic_weight FLOAT DEFAULT 1.0,
  rrf_k INT DEFAULT 60
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  url TEXT,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  platform TEXT,
  content_type TEXT,
  ai_category TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ,
  -- Scoring
  full_text_rank FLOAT,
  semantic_rank FLOAT,
  combined_score FLOAT
)
LANGUAGE SQL
AS $$
WITH full_text AS (
  SELECT
    c.id,
    ROW_NUMBER() OVER (ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) DESC) AS rank
  FROM public.content c
  WHERE c.fts @@ websearch_to_tsquery('english', query_text)
  AND c.user_id = auth.uid()
  ORDER BY rank
  LIMIT match_count * 2
),
semantic AS (
  SELECT
    c.id,
    ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) AS rank
  FROM public.content c
  WHERE c.embedding IS NOT NULL
  AND c.user_id = auth.uid()
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count * 2
)
SELECT
  c.id,
  c.user_id,
  c.url,
  c.title,
  c.description,
  c.thumbnail_url,
  c.platform,
  c.content_type,
  c.ai_category,
  c.ai_summary,
  c.created_at,
  COALESCE(1.0 / (rrf_k + ft.rank), 0.0)::FLOAT AS full_text_rank,
  COALESCE(1.0 / (rrf_k + s.rank), 0.0)::FLOAT AS semantic_rank,
  (
    COALESCE(1.0 / (rrf_k + ft.rank), 0.0) * full_text_weight +
    COALESCE(1.0 / (rrf_k + s.rank), 0.0) * semantic_weight
  )::FLOAT AS combined_score
FROM public.content c
LEFT JOIN full_text ft ON c.id = ft.id
LEFT JOIN semantic s ON c.id = s.id
WHERE c.user_id = auth.uid()
AND (ft.id IS NOT NULL OR s.id IS NOT NULL)
ORDER BY combined_score DESC
LIMIT match_count;
$$;
