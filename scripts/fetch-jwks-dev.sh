#!/usr/bin/env bash
# Fetch JWKS from dev Supabase and write backend/jwks.json. Uses backend/.env.development.
# NOTE: Backend now fetches JWKS from Supabase URL at runtime; this script is optional.
# Run from repo root: ./scripts/fetch-jwks-dev.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
"$ROOT/scripts/resolve-env.sh"
python backend/scripts/fetch_jwks.py backend/.env.development
echo "JWKS for dev project written to backend/jwks.json."
