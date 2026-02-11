-- ============================================================================
-- Migration: Goal Consolidation — parent-child hierarchy & merge suggestions
-- Description: Adds parent_goal_id to user_goals for hierarchy, and a new
--              goal_merge_suggestions table for AI-proposed goal merges.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Add parent_goal_id column to user_goals
-- --------------------------------------------------------------------------
ALTER TABLE public.user_goals
  ADD COLUMN IF NOT EXISTS parent_goal_id UUID REFERENCES public.user_goals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_goals_parent
    ON public.user_goals(parent_goal_id);

COMMENT ON COLUMN public.user_goals.parent_goal_id IS 'References the parent goal when this goal is a sub-goal within a consolidated hierarchy.';

-- --------------------------------------------------------------------------
-- 2. goal_merge_suggestions — AI-proposed goal consolidations
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goal_merge_suggestions (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    suggested_parent_title      TEXT        NOT NULL,
    suggested_parent_description TEXT       NOT NULL DEFAULT '',
    suggested_parent_category   TEXT        NOT NULL DEFAULT '',
    child_goal_ids              UUID[]      NOT NULL,
    ai_reasoning                TEXT        NOT NULL DEFAULT '',
    new_steps                   JSONB       NOT NULL DEFAULT '[]'::jsonb,
    status                      TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'accepted', 'dismissed')),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.goal_merge_suggestions IS 'AI-suggested goal consolidations awaiting user approval.';

-- --------------------------------------------------------------------------
-- Indexes
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_goal_merge_suggestions_user_status
    ON public.goal_merge_suggestions(user_id, status);

-- --------------------------------------------------------------------------
-- Row Level Security
-- --------------------------------------------------------------------------
ALTER TABLE public.goal_merge_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own merge suggestions"
    ON public.goal_merge_suggestions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own merge suggestions"
    ON public.goal_merge_suggestions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own merge suggestions"
    ON public.goal_merge_suggestions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own merge suggestions"
    ON public.goal_merge_suggestions FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- Updated-at trigger
-- --------------------------------------------------------------------------
CREATE TRIGGER trg_goal_merge_suggestions_updated_at
    BEFORE UPDATE ON public.goal_merge_suggestions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
