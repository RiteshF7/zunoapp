#!/usr/bin/env bash
# Resolve .env (with _DEV/_PROD suffixes) into backend/.env and optionally frontend/ui/.env.
# Run from backend/: ./scripts/resolve-env.sh
# Reads backend/.env or repo root .env. Writes backend/.env, backend/.env.development, .env.production.
set -e
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"
if [ ! -f .env ] && [ ! -f ../.env ]; then
  echo ".env not found. Copy backend/.env.example (or root .env.example) and fill values." >&2
  exit 1
fi
python scripts/resolve_env.py
echo "Active env: backend/.env (and frontend/ui/.env if frontend present)."
