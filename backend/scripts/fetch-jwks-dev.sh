#!/usr/bin/env bash
# Fetch JWKS from dev Supabase and write backend/jwks.json.
# Run from backend/: ./scripts/fetch-jwks-dev.sh
set -e
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"
python scripts/resolve_env.py --mode dev
python scripts/fetch_jwks.py .env.development
echo "JWKS for dev project written to jwks.json."
