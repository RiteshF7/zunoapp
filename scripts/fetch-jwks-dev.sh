#!/usr/bin/env bash
# Fetch JWKS from dev Supabase and write backend/jwks.json. Uses backend/.env.development.
# Run from repo root: ./scripts/fetch-jwks-dev.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ENV_FILE="backend/.env.development"
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE. Create from backend/.env.development.example and set SUPABASE_URL."; exit 1; }
python backend/scripts/fetch_jwks.py "$ENV_FILE"
echo "JWKS for dev project written to backend/jwks.json."
