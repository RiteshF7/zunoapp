#!/usr/bin/env bash
# Build UI and landing. Uses ui/.env for VITE_* at build time.
# Output: backend/static/app (main app), backend/static/ (landing)
# Build order: ui first, then landing (landing overwrites index.html at root)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# 1. Build main app → backend/static/app/
cd "$ROOT/ui"
npm run build

# 2. Build landing → backend/static/ (index.html, flow/, assets/)
cd "$ROOT/landing-ui"
npm run build
