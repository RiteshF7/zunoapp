#!/usr/bin/env bash
# Run frontend: Android (debug/prod) or web dev. Run from frontend/: ./scripts/run.sh <command>
#
# Commands:
#   android-debug   Build UI for mobile, copy to mobile/www, sync, build & install debug APK
#   android-prod    Build UI for mobile (prod), copy to mobile/www, sync, build & install release APK
#   web-debug       Start Vite dev server
#   web-prod        Build UI + landing to dist/
#
set -e
FRONTEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$FRONTEND"

CMD="${1:-}"
if [[ -z "$CMD" ]]; then
  echo "Usage: ./scripts/run.sh <command>"
  echo "  android-debug   Build and install debug APK"
  echo "  android-prod    Build and install release APK"
  echo "  web-debug       Run Vite dev server"
  echo "  web-prod        Build UI + landing to dist/"
  exit 1
fi

# Ensure ui/.env exists (copy from example if missing)
_resolve() {
  if [[ -f "$FRONTEND/ui/.env.example" ]] && [[ ! -f "$FRONTEND/ui/.env" ]]; then
    cp "$FRONTEND/ui/.env.example" "$FRONTEND/ui/.env"
    echo "Created ui/.env from .env.example. Edit with your VITE_API_BASE, Supabase URL, etc."
  fi
}

_build_ui_mobile() {
  local mode="$1"
  local vite_mode="$2"
  _resolve
  cd "$FRONTEND/ui"
  npm run build:mobile -- --mode "$vite_mode"
  cd "$FRONTEND"
  rm -rf "$FRONTEND/mobile/www"
  mkdir -p "$FRONTEND/mobile/www"
  cp -r "$FRONTEND/ui/dist/"* "$FRONTEND/mobile/www/"
}

_build_ui_web() {
  _resolve
  cd "$FRONTEND/ui"
  npm run build
  cd "$FRONTEND"
  if [[ -d "$FRONTEND/landing-ui" ]]; then
    cd "$FRONTEND/landing-ui"
    npm run build
    cd "$FRONTEND"
  fi
  echo "UI built to ui/dist. Landing to landing-ui/dist. Deploy to your host."
}

case "$CMD" in
  android-debug)
    _build_ui_mobile dev development
    cd "$FRONTEND/mobile"
    export CAPACITOR_SERVER_URL="http://10.0.2.2:5173"
    npx cap sync android
    cd "$FRONTEND/mobile/android"
    ./gradlew assembleDebug installDebug
    echo "Done. Debug APK installed."
    ;;
  android-prod)
    _build_ui_mobile prod production
    cd "$FRONTEND/mobile"
    export CAPACITOR_USE_BUNDLE=1
    unset CAPACITOR_DEV_SERVER
    unset CAPACITOR_SERVER_URL
    npx cap sync android
    cd "$FRONTEND/mobile/android"
    ./gradlew assembleRelease installRelease
    echo "Done. Release APK installed."
    ;;
  web-debug)
    _resolve
    cd "$FRONTEND/ui" && npm run dev
    ;;
  web-prod)
    _build_ui_web
    ;;
  *)
    echo "Unknown: $CMD. Use: android-debug | android-prod | web-debug | web-prod"
    exit 1
    ;;
esac
