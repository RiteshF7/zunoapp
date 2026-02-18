#!/usr/bin/env bash
# Link to dev Supabase and push migrations. Uses SUPABASE_URL from backend/.env.development.
# Run from backend/: ./scripts/supabase-push-dev.sh
set -e
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"
python scripts/resolve_env.py --mode dev
PROJECT_REF=$(python scripts/get_env_var.py .env.development PROJECT_REF 2>/dev/null) || true
[ -n "$PROJECT_REF" ] || { echo "Missing or invalid SUPABASE_URL in .env.development."; exit 1; }
echo "Dev Supabase: linking project ref $PROJECT_REF"
npx supabase link --project-ref "$PROJECT_REF"
echo "Pushing migrations..."
npx supabase db push
