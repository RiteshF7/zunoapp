#!/usr/bin/env bash
# Set project config to dev or prod. Writes to config/env-mode; backend loads .env.development or .env.production.
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

mkdir -p config
echo "$MODE" > config/env-mode
echo "Project config set to: $MODE"
echo "Backend will use backend/.env.$MODE. Restart backend if running."
