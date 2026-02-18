-- =============================================================
-- Zuno App — User Preferences table
-- Per-user configuration (feed_type toggle, etc.)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  feed_type   TEXT        NOT NULL DEFAULT 'usersaved'
                          CHECK (feed_type IN ('usersaved', 'suggestedcontent')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences(user_id);

-- Auto-update the updated_at timestamp
CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Also add ai_structured_content column to content if missing
ALTER TABLE public.content
  ADD COLUMN IF NOT EXISTS ai_structured_content JSONB;
