#!/usr/bin/env bash
# Resolve root .env (with _DEV/_PROD suffixes) into backend and ui env files.
# Run from repo root: ./scripts/resolve-env.sh
# Mode from ZUNO_MODE in root .env or ZUNO_ENV. Generates:
#   backend/.env.development, backend/.env.production
#   ui/.env.development, ui/.env.production
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "root/.env not found. Copy from .env.example and fill values." >&2
  exit 1
fi

python backend/scripts/resolve_env.py
echo "Resolved .env -> backend/.env.development, backend/.env.production, ui/.env.development, ui/.env.production"
