#!/usr/bin/env bash
# Android debug build: dev API/base from root .env (ZUNO_MODE=development).
# Run from repo root: ./scripts/build-android-debug.sh
# Requires: resolve-env, ui build (--mode development), copy to mobile/www, cap sync, gradle assembleDebug.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Resolving env (dev) and building UI for development (base=. for Capacitor WebView)..."
"$ROOT/scripts/resolve-env.sh"
cd "$ROOT/ui"
npx vite build --mode development --base ./ --outDir "$ROOT/backend/static/app-mobile"
cd "$ROOT"

echo "Copying app to mobile/www and syncing Android..."
rm -rf "$ROOT/mobile/www"
mkdir -p "$ROOT/mobile/www"
cp -r "$ROOT/backend/static/app-mobile/"* "$ROOT/mobile/www/"

cd "$ROOT/mobile"
npx cap sync android
cd "$ROOT/mobile/android"
./gradlew assembleDebug

echo "Done. Debug APK: mobile/android/app/build/outputs/apk/debug/"
