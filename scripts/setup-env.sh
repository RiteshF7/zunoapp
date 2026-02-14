#!/usr/bin/env bash
# Copy root .env.example -> .env if missing. Run resolve-env to generate backend and ui env files.
# Run from repo root: ./scripts/setup-env.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Edit .env with your values (use _DEV and _PROD suffixes)."
else
  echo ".env already exists"
fi

echo "Run ./scripts/resolve-env.sh to generate backend/.env.development, backend/.env.production, ui/.env.development, ui/.env.production"
