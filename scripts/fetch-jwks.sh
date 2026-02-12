#!/usr/bin/env bash
# Fetch JWKS from Supabase (URL from backend/.env) and write backend/jwks.json.
# Run from repo root. Requires backend/.env with SUPABASE_URL.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python backend/scripts/fetch_jwks.py
