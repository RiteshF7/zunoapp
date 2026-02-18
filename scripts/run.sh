#!/usr/bin/env bash
# Single entry point: run Android (debug/prod) or web (debug/prod).
# From repo root: ./scripts/run.sh <command>
#
# Commands:
#   android-debug   Resolve dev env, build UI for mobile, copy to mobile/www, sync, build & install debug APK
#   android-prod    Resolve prod env, build UI for mobile, copy to mobile/www, sync, build & install release APK
#   web-debug       Resolve dev env, start backend (reload) + frontend (Vite dev server)
#   web-prod        Resolve prod env, build UI + landing, start backend only
#
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CMD="${1:-}"
if [[ -z "$CMD" ]]; then
  echo "Usage: ./scripts/run.sh <command>"
  echo ""
  echo "  android-debug   Build and install debug APK (dev backend/Supabase)"
  echo "  android-prod    Build and install release APK (prod backend/Supabase)"
  echo "  web-debug       Run backend + Vite dev server"
  echo "  web-prod        Build UI + landing, then run backend"
  exit 1
fi

# Ensure .env exists
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example. Edit .env with your values."
fi

_resolve() {
  local mode="$1"
  python "$ROOT/backend/scripts/resolve_env.py" --mode "$mode"
}

_build_ui_mobile() {
  local mode="$1"   # dev or prod
  local vite_mode="$2"   # development or production
  _resolve "$mode"
  cd "$ROOT/ui"
  npx vite build --mode "$vite_mode" --base ./ --outDir "$ROOT/backend/static/app-mobile"
  cd "$ROOT"
  rm -rf "$ROOT/mobile/www"
  mkdir -p "$ROOT/mobile/www"
  cp -r "$ROOT/backend/static/app-mobile/"* "$ROOT/mobile/www/"
}

_build_ui_web_prod() {
  _resolve prod
  cd "$ROOT/ui"
  npm run build
  cd "$ROOT"
  if [[ -d "$ROOT/landing-ui" ]]; then
    cd "$ROOT/landing-ui"
    npm run build
    cd "$ROOT"
  fi
}

case "$CMD" in
  android-debug)
    _build_ui_mobile dev development
    cd "$ROOT/mobile"
    # Force emulator-friendly URL so WebView never uses localhost:5173 (emulator can't reach it)
    export CAPACITOR_SERVER_URL="http://10.0.2.2:5173"
    npx cap sync android
    cd "$ROOT/mobile/android"
    ./gradlew assembleDebug installDebug
    echo "Done. Debug APK installed. Output: mobile/android/app/build/outputs/apk/debug/"
    ;;
  android-prod)
    _build_ui_mobile prod production
    cd "$ROOT/mobile"
    # Force Capacitor to use bundled www/ (no dev server URL) so prod APK doesn't load 10.0.2.2:5173
    export CAPACITOR_USE_BUNDLE=1
    unset CAPACITOR_DEV_SERVER
    unset CAPACITOR_SERVER_URL
    npx cap sync android
    cd "$ROOT/mobile/android"
    ./gradlew assembleRelease installRelease
    echo "Done. Release APK installed. Output: mobile/android/app/build/outputs/apk/release/"
    ;;
  web-debug)
    _resolve dev
    cleanup() { kill $(jobs -p) 2>/dev/null || true; exit 0; }
    trap cleanup INT TERM
    cd "$ROOT/backend"
    PY="${ROOT}/backend/venv/bin/python"
    [[ -x "$PY" ]] || PY="python"
    $PY -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    sleep 2
    cd "$ROOT/ui" && npm run dev
    ;;
  web-prod)
    _build_ui_web_prod
    cd "$ROOT/backend"
    PY="${ROOT}/backend/venv/bin/python"
    [[ -x "$PY" ]] || PY="python"
    $PY -m uvicorn app.main:app --host 0.0.0.0 --port 8000
    ;;
  *)
    echo "Unknown command: $CMD"
    echo "Use: android-debug | android-prod | web-debug | web-prod"
    exit 1
    ;;
esac
