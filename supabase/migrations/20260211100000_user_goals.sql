-- ============================================================================
-- Migration: User Personality & Goals Engine
-- Description: Creates tables for AI-managed user personality profiles,
--              auto-detected goals, and interactive goal steps.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. user_personality — internal AI-managed personality profile
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_personality (
    user_id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    summary        TEXT        NOT NULL DEFAULT '',
    primary_interests JSONB   NOT NULL DEFAULT '[]'::jsonb,
    behavior_patterns JSONB   NOT NULL DEFAULT '[]'::jsonb,
    content_themes    JSONB   NOT NULL DEFAULT '[]'::jsonb,
    last_analyzed_content_id UUID,
    version        INTEGER    NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_personality IS 'Internal AI-managed user personality profile derived from saved content patterns.';

-- --------------------------------------------------------------------------
-- 2. user_goals — user-facing interactive goals
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_goals (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title                TEXT        NOT NULL,
    description          TEXT        NOT NULL DEFAULT '',
    category             TEXT        NOT NULL DEFAULT '',
    status               TEXT        NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'completed', 'dismissed')),
    confidence           FLOAT       NOT NULL DEFAULT 0.5
                         CHECK (confidence >= 0 AND confidence <= 1),
    evidence_content_ids UUID[]      NOT NULL DEFAULT '{}',
    ai_reasoning         TEXT        NOT NULL DEFAULT '',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_goals IS 'AI-detected user goals with step-by-step instructions. Users can interact (mark complete, dismiss, edit).';

-- --------------------------------------------------------------------------
-- 3. goal_steps — interactive steps within each goal
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goal_steps (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id            UUID        NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
    step_index         INTEGER     NOT NULL DEFAULT 0,
    title              TEXT        NOT NULL,
    description        TEXT        NOT NULL DEFAULT '',
    source_content_ids UUID[]      NOT NULL DEFAULT '{}',
    is_completed       BOOLEAN     NOT NULL DEFAULT false,
    completed_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.goal_steps IS 'Step-by-step instructions for each goal. Users can mark steps complete.';

-- --------------------------------------------------------------------------
-- Indexes
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_goals_user_status
    ON public.user_goals(user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_created
    ON public.user_goals(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_goal_steps_goal_index
    ON public.goal_steps(goal_id, step_index);

-- --------------------------------------------------------------------------
-- Row Level Security
-- --------------------------------------------------------------------------

-- user_personality
ALTER TABLE public.user_personality ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own personality"
    ON public.user_personality FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personality"
    ON public.user_personality FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personality"
    ON public.user_personality FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
    ON public.user_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
    ON public.user_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON public.user_goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
    ON public.user_goals FOR DELETE
    USING (auth.uid() = user_id);

-- goal_steps
ALTER TABLE public.goal_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal steps"
    ON public.goal_steps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_goals g
            WHERE g.id = goal_steps.goal_id
              AND g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own goal steps"
    ON public.goal_steps FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_goals g
            WHERE g.id = goal_steps.goal_id
              AND g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own goal steps"
    ON public.goal_steps FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_goals g
            WHERE g.id = goal_steps.goal_id
              AND g.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_goals g
            WHERE g.id = goal_steps.goal_id
              AND g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own goal steps"
    ON public.goal_steps FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_goals g
            WHERE g.id = goal_steps.goal_id
              AND g.user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------------
-- Updated-at triggers
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_personality_updated_at
    BEFORE UPDATE ON public.user_personality
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_user_goals_updated_at
    BEFORE UPDATE ON public.user_goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_goal_steps_updated_at
    BEFORE UPDATE ON public.goal_steps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
