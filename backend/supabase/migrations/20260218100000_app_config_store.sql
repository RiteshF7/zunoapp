-- Store editable global (app) and local (about) config for admin UI.
-- key: 'global' = AppConfigOut JSON, 'local' = AboutConfigOut (dev/prod refs) JSON.
-- Public GET /api/config and /api/about-config read from here when present; else defaults/env.

CREATE TABLE IF NOT EXISTS public.app_config_store (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.app_config_store ENABLE ROW LEVEL SECURITY;

-- No policies: access via backend service role only.

COMMENT ON TABLE public.app_config_store IS 'Admin-editable app config: global (feature flags, limits, links) and local (about/reference URLs).';
