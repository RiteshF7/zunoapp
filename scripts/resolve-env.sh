#!/usr/bin/env bash
# Resolve root .env (with _DEV/_PROD suffixes) into backend and ui.
# Run from repo root: ./scripts/resolve-env.sh
# Mode from ZUNO_MODE in root .env or ZUNO_ENV. Writes:
#   backend/.env, ui/.env (active) + backend/.env.development, .env.production for scripts that need both.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "root/.env not found. Copy from .env.example and fill values." >&2
  exit 1
fi

python backend/scripts/resolve_env.py
echo "Active env: backend/.env and ui/.env (from ZUNO_MODE). Run ./scripts/use-dev.sh or use-prod.sh to switch."
