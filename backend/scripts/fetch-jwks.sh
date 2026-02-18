#!/usr/bin/env bash
# Fetch JWKS from prod Supabase and write backend/jwks.json.
# Run from backend/: ./scripts/fetch-jwks.sh
set -e
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"
python scripts/resolve_env.py --mode prod
python scripts/fetch_jwks.py .env.production
echo "JWKS for prod project written to jwks.json."
