#!/usr/bin/env bash
# Set Supabase Edge Function secrets from backend env.
# Run from backend/: ./scripts/set-edge-secrets.sh [dev|prod]
set -e
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"
python scripts/resolve_env.py

MODE="${1:-prod}"
if [ "$MODE" = "dev" ]; then
  ENV_FILE=".env.development"
else
  ENV_FILE=".env.production"
fi

[ -f "$ENV_FILE" ] || { echo "$ENV_FILE not found"; exit 1; }
SUPABASE_URL=$(grep -E '^\s*SUPABASE_URL\s*=' "$ENV_FILE" | sed 's/^[^=]*=\s*//' | tr -d "\"'" | head -1)
SUPABASE_SERVICE_ROLE_KEY=$(grep -E '^\s*SUPABASE_SERVICE_ROLE_KEY\s*=' "$ENV_FILE" | sed 's/^[^=]*=\s*//' | tr -d "\"'" | head -1)
[ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] || { echo "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"; exit 1; }

npx supabase secrets set "SUPABASE_URL=$SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY"
echo "Edge Function secrets set."
