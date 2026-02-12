#!/usr/bin/env bash
# Build landing page only. Output: backend/static/ (index.html, flow/, assets/)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/landing-ui"
npm run build
