#!/usr/bin/env bash
# Fetch JWKS from **dev** Supabase and write backend/jwks.json. Uses backend/.env.development.
# Run from repo root: ./scripts/fetch-jwks-dev.sh
# Use when working in dev so backend validates JWTs from the dev Supabase project.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="backend/.env.development"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Create from backend/.env.development.example and set SUPABASE_URL."
  exit 1
fi

SUPABASE_URL=$(grep -E '^\s*SUPABASE_URL\s*=' "$ENV_FILE" | sed 's/^[^=]*=\s*//' | tr -d '"'"'"' | head -1)
if [ -z "$SUPABASE_URL" ]; then
  echo "SUPABASE_URL not set in $ENV_FILE"
  exit 1
fi

python backend/scripts/fetch_jwks.py "$SUPABASE_URL"
echo "JWKS for dev project written to backend/jwks.json."
