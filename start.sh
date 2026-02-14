#!/usr/bin/env bash
# Start Zuno in dev or prod mode. Run from repo root: ./start.sh dev | prod [backend|frontend|both] [--prep]
# Examples:
#   ./start.sh dev           # Development: backend + frontend
#   ./start.sh prod          # Production: build UI, run backend
#   ./start.sh dev backend   # Dev mode, backend only
#   ./start.sh prod --prep   # Production with full prep (setup, JWKS, migrations, build)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec "$ROOT/scripts/start.sh" "$@"
