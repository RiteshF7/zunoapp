#!/usr/bin/env bash
# Migrate values from backend/.env.development, backend/.env.production,
# ui/.env.development, ui/.env.production into root .env (with _DEV/_PROD suffixes).
# Run from repo root: ./scripts/migrate-env-to-root.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python backend/scripts/migrate_env_to_root.py
