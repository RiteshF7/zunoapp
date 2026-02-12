#!/usr/bin/env bash
# Copy .env.example -> .env for backend and ui if .env does not exist.
# Run from repo root. Edit the new .env files with your values.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env from .env.example"
else
  echo "backend/.env already exists"
fi

if [ ! -f ui/.env ]; then
  cp ui/.env.example ui/.env
  echo "Created ui/.env from .env.example"
else
  echo "ui/.env already exists"
fi

echo "Edit backend/.env and ui/.env with your Supabase URL, keys, and (for prod) ENVIRONMENT and CORS_ORIGINS."
