#!/usr/bin/env bash
# Set Supabase Edge Function secrets from backend env (for linked project).
# Run from repo root after: supabase link --project-ref <ref>
# Uses backend/.env.production for prod; run resolve-env.sh first.
# Usage: ./scripts/set-edge-secrets.sh [dev|prod]
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
"$ROOT/scripts/resolve-env.sh"

MODE="${1:-prod}"
if [ "$MODE" = "dev" ]; then
  ENV_FILE="backend/.env.development"
else
  ENV_FILE="backend/.env.production"
fi

[ -f "$ENV_FILE" ] || { echo "$ENV_FILE not found"; exit 1; }
SUPABASE_URL=$(grep -E '^\s*SUPABASE_URL\s*=' "$ENV_FILE" | sed 's/^[^=]*=\s*//' | tr -d "\"'" | head -1)
SUPABASE_SERVICE_ROLE_KEY=$(grep -E '^\s*SUPABASE_SERVICE_ROLE_KEY\s*=' "$ENV_FILE" | sed 's/^[^=]*=\s*//' | tr -d "\"'" | head -1)
[ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] || { echo "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in root .env"; exit 1; }

supabase secrets set "SUPABASE_URL=$SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY"
echo "Edge Function secrets set. Add AI keys via: supabase secrets set OPENAI_API_KEY=... (etc.)"
