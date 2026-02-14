#!/usr/bin/env bash
# Link to dev Supabase and push migrations. Uses SUPABASE_URL from backend/.env.development.
# Run from repo root: ./scripts/supabase-push-dev.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
"$ROOT/scripts/resolve-env.sh"
PROJECT_REF=$(python backend/scripts/get_env_var.py backend/.env.development PROJECT_REF 2>/dev/null) || true
[ -n "$PROJECT_REF" ] || { echo "Missing or invalid SUPABASE_URL in backend/.env.development."; exit 1; }
echo "Dev Supabase: linking project ref $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"
echo "Pushing migrations..."
supabase db push
