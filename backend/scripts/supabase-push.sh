#!/usr/bin/env bash
# Link Supabase project and push migrations.
# Run from backend/: ./scripts/supabase-push.sh [PROJECT_REF]
set -e
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"
python scripts/resolve_env.py --mode prod
PROJECT_REF="$1"
if [ -z "$PROJECT_REF" ] && [ -f .env.production ]; then
  PROJECT_REF=$(python scripts/get_env_var.py .env.production PROJECT_REF 2>/dev/null) || true
fi
if [ -z "$PROJECT_REF" ]; then
  echo "Usage: ./scripts/supabase-push.sh [PROJECT_REF]"
  exit 1
fi
echo "Linking project ref: $PROJECT_REF"
npx supabase link --project-ref "$PROJECT_REF"
echo "Pushing migrations..."
npx supabase db push
