-- =============================================================
-- Pro waitlist (landing page signups for Pro / Pro Plus)
-- Backend writes via service role; no anon inserts.
-- =============================================================

CREATE TABLE public.pro_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'pro_plus')),
  discount_code TEXT,
  source TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pro_waitlist_created_at ON public.pro_waitlist(created_at DESC);
CREATE INDEX idx_pro_waitlist_tier ON public.pro_waitlist(tier);

-- RLS: no anon access; backend uses service role to insert/select
ALTER TABLE public.pro_waitlist ENABLE ROW LEVEL SECURITY;

-- No policies: only service_role (backend) can read/write
-- Anon and authenticated users get no access by default

COMMENT ON TABLE public.pro_waitlist IS 'Landing page waitlist for Pro/Pro Plus; backend-only writes';
