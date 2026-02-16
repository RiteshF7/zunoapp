#!/usr/bin/env bash
# Start backend and/or frontend in dev or prod mode.
# Run from repo root: ./scripts/start.sh <mode> [run] [--prep]
#
# Args:
#   mode    dev|prod (required)
#   run     backend|frontend|both (default: both for dev, backend for prod)
#   --prep  For prod: run setup-env, supabase-push, build-ui before starting
#
# Examples:
#   ./scripts/start.sh dev              # Dev mode: backend + frontend (Vite dev server)
#   ./scripts/start.sh dev backend      # Dev mode: backend only
#   ./scripts/start.sh dev frontend     # Dev mode: frontend only
#   ./scripts/start.sh prod             # Prod mode: build UI, run backend
#   ./scripts/start.sh prod --prep      # Prod: full prep (setup, JWKS, migrations, build) then run backend
#
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="${1:-}"
RUN="${2:-}"
PREP=false

# Parse --prep
for arg in "$@"; do
  [[ "$arg" == "--prep" ]] && PREP=true
done

# Filter RUN if it was consumed by --prep
if [[ "$RUN" == "--prep" ]]; then
  RUN=""
fi

# Defaults
if [[ "$MODE" != "dev" && "$MODE" != "prod" ]]; then
  echo "Usage: $0 dev|prod [backend|frontend|both] [--prep]"
  echo ""
  echo "  dev              Development mode (hot reload)"
  echo "  prod             Production mode (built UI served by backend)"
  echo "  backend          Run backend only"
  echo "  frontend         Run frontend only (dev: Vite; prod: N/A)"
  echo "  both             Run backend + frontend (default for dev)"
  echo "  --prep           Prod only: setup .env, fetch JWKS, push migrations, build UI"
  exit 1
fi

if [[ -z "$RUN" || "$RUN" == "--prep" ]]; then
  if [[ "$MODE" == "dev" ]]; then
    RUN="both"
  else
    RUN="backend"
  fi
fi

if [[ "$MODE" == "prod" && "$RUN" == "frontend" ]]; then
  echo "Prod mode serves frontend from backend. Use 'backend' or 'both' (same as backend)."
  RUN="backend"
fi

# Set env mode (ZUNO_MODE in root .env)
echo "Mode: $MODE"
if [[ "$MODE" == "dev" ]]; then
  MODE_VAL="development"
else
  MODE_VAL="production"
fi
if [ -f .env ]; then
  if grep -q '^ZUNO_MODE=' .env 2>/dev/null; then
    sed -i.bak "s/^ZUNO_MODE=.*/ZUNO_MODE=$MODE_VAL/" .env 2>/dev/null || sed -i "s/^ZUNO_MODE=.*/ZUNO_MODE=$MODE_VAL/" .env
    rm -f .env.bak 2>/dev/null || true
  else
    echo "ZUNO_MODE=$MODE_VAL" >> .env
  fi
fi
echo "Config: $MODE_VAL"

# Resolve root .env -> backend and ui env files
"$ROOT/scripts/resolve-env.sh"

# Prod prep (optional)
if [[ "$PREP" == true && "$MODE" == "prod" ]]; then
  echo ""
  echo "=== Prep: setup .env ==="
  "$ROOT/scripts/setup-env.sh"

  echo ""
  echo "=== Prep: Supabase link + push ==="
  ENV_FILE="backend/.env.production"
  if [ -f "$ENV_FILE" ]; then
    SUPABASE_URL=$(grep -E '^\s*SUPABASE_URL\s*=' "$ENV_FILE" | sed 's/^[^=]*=\s*//' | tr -d "\"'" | head -1)
    if [ -n "$SUPABASE_URL" ]; then
      PROJECT_REF=$(echo "$SUPABASE_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co.*|\1|p')
      if [ -n "$PROJECT_REF" ]; then
        supabase link --project-ref "$PROJECT_REF" 2>/dev/null || true
        supabase db push
      fi
    fi
  else
    echo "Missing $ENV_FILE. Run resolve-env.sh first."
  fi
fi

# Prod: build UI (same as scripts/build-ui.sh — one source of truth for production static)
if [[ "$MODE" == "prod" && ("$RUN" == "backend" || "$RUN" == "both") ]]; then
  echo ""
  echo "=== Building UI (app + landing → backend/static/) ==="
  "$ROOT/scripts/build-ui.sh"
fi

cleanup() {
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

if [[ "$RUN" == "backend" ]]; then
  cd "$ROOT/backend"
  if [[ -x "$ROOT/backend/venv/bin/python" ]]; then
    PY="$ROOT/backend/venv/bin/python"
  else
    PY="python"
  fi
  if [[ "$MODE" == "dev" ]]; then
    $PY -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  else
    $PY -m uvicorn app.main:app --host 0.0.0.0 --port 8000
  fi
elif [[ "$RUN" == "frontend" ]]; then
  cd "$ROOT/ui" && npm run dev
else
  # both
  if [[ "$MODE" == "dev" ]]; then
    cd "$ROOT/backend"
    if [[ -x "$ROOT/backend/venv/bin/python" ]]; then
      PY="$ROOT/backend/venv/bin/python"
    else
      PY="python"
    fi
    $PY -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    sleep 2
    cd "$ROOT/ui" && npm run dev
  else
    cd "$ROOT/backend"
    if [[ -x "$ROOT/backend/venv/bin/python" ]]; then
      PY="$ROOT/backend/venv/bin/python"
    else
      PY="python"
    fi
    $PY -m uvicorn app.main:app --host 0.0.0.0 --port 8000
  fi
fi
