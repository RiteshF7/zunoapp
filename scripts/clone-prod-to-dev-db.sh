#!/usr/bin/env bash
# Clone prod Supabase DB (schema + data) to dev using pg_dump/psql.
# Run from repo root. Requires: pg_dump, psql, and DB passwords (no Docker).
#
# Passwords: read from backend/.env.production (SUPABASE_DB_PASSWORD_PROD) and
# backend/.env.development (SUPABASE_DB_PASSWORD_DEV), or env vars, or prompt.
#
# Warning: This overwrites the dev database. Ensure dev is the target.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROD_REF=$(python backend/scripts/get_env_var.py backend/.env.production PROJECT_REF 2>/dev/null) || true
DEV_REF=$(python backend/scripts/get_env_var.py backend/.env.development PROJECT_REF 2>/dev/null) || true
[ -n "$PROD_REF" ] || { echo "Missing SUPABASE_URL in backend/.env.production"; exit 1; }
[ -n "$DEV_REF" ] || { echo "Missing SUPABASE_URL in backend/.env.development"; exit 1; }

PROD_PWD=$(python backend/scripts/get_env_var.py backend/.env.production SUPABASE_DB_PASSWORD_PROD 2>/dev/null) || true
[ -z "$PROD_PWD" ] && PROD_PWD="${SUPABASE_DB_PASSWORD_PROD:-}"
DEV_PWD=$(python backend/scripts/get_env_var.py backend/.env.development SUPABASE_DB_PASSWORD_DEV 2>/dev/null) || true
[ -z "$DEV_PWD" ] && DEV_PWD="${SUPABASE_DB_PASSWORD_DEV:-}"
if [ -z "$PROD_PWD" ]; then
  echo -n "Prod DB password (project $PROD_REF): "
  read -rs PROD_PWD
  echo
fi
if [ -z "$DEV_PWD" ]; then
  echo -n "Dev DB password (project $DEV_REF): "
  read -rs DEV_PWD
  echo
fi

# URL-encode password for connection string
_urlenc() { python -c "import urllib.parse,sys; print(urllib.parse.quote_plus(sys.argv[1]))" "$1" 2>/dev/null || python3 -c "import urllib.parse,sys; print(urllib.parse.quote_plus(sys.argv[1]))" "$1"; }
PROD_PWD_ENC=$(_urlenc "$PROD_PWD")
DEV_PWD_ENC=$(_urlenc "$DEV_PWD")
PROD_URL="postgresql://postgres:${PROD_PWD_ENC}@db.${PROD_REF}.supabase.co:5432/postgres"
DEV_URL="postgresql://postgres:${DEV_PWD_ENC}@db.${DEV_REF}.supabase.co:5432/postgres"

DUMP_DIR="$ROOT/.supabase-clone-tmp"
mkdir -p "$DUMP_DIR"
trap "rm -rf '$DUMP_DIR'" EXIT

echo "Dumping from prod ($PROD_REF)..."
pg_dump "$PROD_URL" --schema-only -n public -f "$DUMP_DIR/schema.sql"
pg_dump "$PROD_URL" --data-only -n public -f "$DUMP_DIR/data.sql"

echo "Resetting dev public schema..."
psql "$DEV_URL" --single-transaction -v ON_ERROR_STOP=1 -c "
  DROP SCHEMA IF EXISTS public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
"

echo "Restoring schema and data to dev ($DEV_REF)..."
psql "$DEV_URL" --single-transaction -v ON_ERROR_STOP=1 -f "$DUMP_DIR/schema.sql"
psql "$DEV_URL" --single-transaction -v ON_ERROR_STOP=1 -c "SET session_replication_role = replica" -f "$DUMP_DIR/data.sql"

echo "Done. Prod DB cloned to dev."
