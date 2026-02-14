#!/usr/bin/env bash
# Build UI and landing. Resolves root .env first, then uses ui/.env.production for prod build.
# Output: backend/static/app (main app), backend/static/ (landing)
# Run from repo root: ./scripts/build-ui.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

"$ROOT/scripts/resolve-env.sh"

# 1. Build main app → backend/static/app/
cd "$ROOT/ui"
npm run build

# 2. Build landing → backend/static/ (index.html, flow/, assets/)
cd "$ROOT/landing-ui"
npm run build
