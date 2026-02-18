#!/usr/bin/env bash
# Set backend config to dev or prod. Updates ZUNO_MODE in backend/.env or root .env.
# Run from backend/: ./scripts/use-env.sh dev   or   ./scripts/use-env.sh prod
set -e
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"

MODE_ARG="${1:-}"
if [ "$MODE_ARG" = "dev" ]; then
  MODE="development"
elif [ "$MODE_ARG" = "prod" ]; then
  MODE="production"
else
  echo "Usage: $0 dev|prod"
  exit 1
fi

ENV_FILE="$BACKEND/.env"
[ -f "$ENV_FILE" ] || ENV_FILE="$BACKEND/../.env"
[ -f "$ENV_FILE" ] || { echo ".env not found. Copy backend/.env.example and fill values." >&2; exit 1; }

if grep -q '^ZUNO_MODE=' "$ENV_FILE" 2>/dev/null; then
  sed -i.bak "s/^ZUNO_MODE=.*/ZUNO_MODE=$MODE/" "$ENV_FILE" 2>/dev/null || sed -i "s/^ZUNO_MODE=.*/ZUNO_MODE=$MODE/" "$ENV_FILE"
  rm -f "$ENV_FILE.bak" 2>/dev/null || true
else
  echo "ZUNO_MODE=$MODE" >> "$ENV_FILE"
fi

echo "Project config set to: $MODE"
python scripts/resolve_env.py
echo "Restart backend if running."
