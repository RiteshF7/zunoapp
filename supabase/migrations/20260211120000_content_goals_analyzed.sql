-- ============================================================================
-- Migration: Add goals_analyzed tracking to content table
-- Description: Tracks whether each content item has been analyzed by the
--              goal intelligence engine, so we can efficiently find and
--              process only unanalyzed content.
-- ============================================================================

-- Add the column (default false for all existing rows)
ALTER TABLE public.content
    ADD COLUMN IF NOT EXISTS goals_analyzed BOOLEAN NOT NULL DEFAULT false;

-- Add the timestamp for when it was last analyzed
ALTER TABLE public.content
    ADD COLUMN IF NOT EXISTS goals_analyzed_at TIMESTAMPTZ;

-- Index for quickly finding unanalyzed content
CREATE INDEX IF NOT EXISTS idx_content_goals_unanalyzed
    ON public.content(user_id, goals_analyzed)
    WHERE ai_processed = true AND goals_analyzed = false;
