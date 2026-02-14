#!/usr/bin/env bash
# Set project config to dev or prod. Updates ZUNO_MODE in root .env.
# Run from repo root: ./scripts/use-env.sh dev   or   ./scripts/use-env.sh prod
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE_ARG="${1:-}"
if [ "$MODE_ARG" = "dev" ]; then
  MODE="development"
elif [ "$MODE_ARG" = "prod" ]; then
  MODE="production"
else
  echo "Usage: $0 dev|prod"
  exit 1
fi

if [ ! -f .env ]; then
  echo "root/.env not found. Copy from .env.example first." >&2
  exit 1
fi

if grep -q '^ZUNO_MODE=' .env 2>/dev/null; then
  sed -i.bak "s/^ZUNO_MODE=.*/ZUNO_MODE=$MODE/" .env 2>/dev/null || sed -i "s/^ZUNO_MODE=.*/ZUNO_MODE=$MODE/" .env
  rm -f .env.bak 2>/dev/null || true
else
  echo "ZUNO_MODE=$MODE" >> .env
fi

echo "Project config set to: $MODE"
"$ROOT/scripts/resolve-env.sh"
echo "Backend will use backend/.env.$MODE. Restart backend if running."
