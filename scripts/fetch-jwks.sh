#!/usr/bin/env bash
# Fetch JWKS from prod Supabase and write backend/jwks.json.
# NOTE: Backend now fetches JWKS from Supabase URL at runtime; this script is optional.
# Run from repo root. Uses backend/.env.production (run resolve-env.sh first).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
"$ROOT/scripts/resolve-env.sh"
python backend/scripts/fetch_jwks.py backend/.env.production
