#!/usr/bin/env bash
# Link to **dev** Supabase project and push migrations. Uses SUPABASE_URL from backend/.env.development.
# Run from repo root: ./scripts/supabase-push-dev.sh
# Requires backend/.env.development (create from .env.development.example).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="backend/.env.development"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Create from backend/.env.development.example and set SUPABASE_URL."
  exit 1
fi

SUPABASE_URL=$(grep -E '^\s*SUPABASE_URL\s*=' "$ENV_FILE" | sed 's/^[^=]*=\s*//' | tr -d '"'"'"' | head -1)
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co.*|\1|p')

if [ -z "$PROJECT_REF" ]; then
  echo "Could not derive PROJECT_REF from SUPABASE_URL in $ENV_FILE"
  exit 1
fi

echo "Dev Supabase: linking project ref $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"
echo "Pushing migrations..."
supabase db push
