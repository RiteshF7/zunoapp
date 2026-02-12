#!/usr/bin/env bash
# Set Supabase Edge Function secrets from backend/.env (for linked project).
# Run from repo root after: supabase link --project-ref <ref>
# Usage: ./scripts/set-edge-secrets.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
[ -f backend/.env ] || { echo "backend/.env not found"; exit 1; }

SUPABASE_URL=$(grep -E '^\s*SUPABASE_URL\s*=' backend/.env | sed 's/^[^=]*=\s*//' | tr -d '"'"'"' | head -1)
SUPABASE_SERVICE_ROLE_KEY=$(grep -E '^\s*SUPABASE_SERVICE_ROLE_KEY\s*=' backend/.env | sed 's/^[^=]*=\s*//' | tr -d '"'"'"' | head -1)
[ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] || { echo "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env"; exit 1; }

supabase secrets set "SUPABASE_URL=$SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY"
echo "Edge Function secrets set. Add AI keys via: supabase secrets set OPENAI_API_KEY=... (etc.)"
