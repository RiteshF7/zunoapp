#!/usr/bin/env bash
# Link Supabase project and push migrations.
# Run from repo root: ./scripts/supabase-push.sh [PROJECT_REF]
# If PROJECT_REF omitted, derived from SUPABASE_URL in backend/.env.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PROJECT_REF="$1"
if [ -z "$PROJECT_REF" ] && [ -f backend/.env ]; then
  PROJECT_REF=$(python backend/scripts/get_env_var.py backend/.env PROJECT_REF 2>/dev/null) || true
fi
if [ -z "$PROJECT_REF" ]; then
  echo "Usage: ./scripts/supabase-push.sh [PROJECT_REF]"
  echo "  Or set SUPABASE_URL in backend/.env"
  exit 1
fi
echo "Linking project ref: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"
echo "Pushing migrations..."
supabase db push
