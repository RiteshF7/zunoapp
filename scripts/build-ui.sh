#!/usr/bin/env bash
# Build UI (Vite). Uses ui/.env for VITE_* at build time. Output: backend/static/
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/ui"
npm run build
