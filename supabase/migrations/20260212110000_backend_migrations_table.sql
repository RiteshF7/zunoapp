-- Backend migration tracking table (used by backend/migrations/ and optional tooling).
-- Health readiness no longer depends on this; it uses profiles. This table
-- exists so backend migration scripts can record applied migrations if needed.
CREATE TABLE IF NOT EXISTS public._migrations (
  id          serial      PRIMARY KEY,
  name        text        UNIQUE NOT NULL,
  applied_at  timestamptz DEFAULT now()
);

INSERT INTO public._migrations (name) VALUES ('000_migration_tracking')
ON CONFLICT (name) DO NOTHING;
