#!/usr/bin/env bash
# Link Supabase project (if not linked) and push migrations.
# Run from repo root. Uses SUPABASE_URL from backend/.env to get project-ref, or pass PROJECT_REF as first arg.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Load SUPABASE_URL from backend/.env if present
if [ -f backend/.env ]; then
  SUPABASE_URL=$(grep -E '^\s*SUPABASE_URL\s*=' backend/.env | sed 's/^[^=]*=\s*//' | tr -d '"'"'"' | head -1)
  export SUPABASE_URL
fi

PROJECT_REF="$1"
if [ -z "$PROJECT_REF" ] && [ -n "$SUPABASE_URL" ]; then
  # Extract ref from https://XXX.supabase.co
  PROJECT_REF=$(echo "$SUPABASE_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co.*|\1|p')
fi

if [ -z "$PROJECT_REF" ]; then
  echo "Usage: ./scripts/supabase-push.sh [PROJECT_REF]"
  echo "  Or set SUPABASE_URL in backend/.env (project ref is derived from URL)"
  exit 1
fi

echo "Linking project ref: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"
echo "Pushing migrations..."
supabase db push
