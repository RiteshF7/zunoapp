-- =============================================================
-- Grant service_role full access to public schema tables
-- Fixes: "permission denied for table X" when backend uses service_role key
-- =============================================================

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Ensure future tables get the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
