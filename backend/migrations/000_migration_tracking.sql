-- ============================================================
-- Migration 000: Create migration tracking table
-- Run this ONCE before applying any other migrations.
-- ============================================================

CREATE TABLE IF NOT EXISTS _migrations (
  id          serial      PRIMARY KEY,
  name        text        UNIQUE NOT NULL,
  applied_at  timestamptz DEFAULT now()
);

-- Register this migration
INSERT INTO _migrations (name) VALUES ('000_migration_tracking')
ON CONFLICT (name) DO NOTHING;
