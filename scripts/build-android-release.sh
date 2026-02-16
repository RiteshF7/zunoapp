#!/usr/bin/env bash
# Android release build: prod API/base from root .env (ZUNO_MODE=production).
# Run from repo root: ./scripts/build-android-release.sh
# Requires: resolve-env, ui build (--mode production), copy to mobile/www, cap sync, gradle assembleRelease.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Resolving env (prod) and building UI for production (base=. for Capacitor WebView)..."
python "$ROOT/backend/scripts/resolve_env.py" --mode prod
# Build with base . so script/css paths are relative; WebView loads from file/capacitor:// and /app/assets/ would 404
cd "$ROOT/ui"
npx vite build --mode production --base ./ --outDir "$ROOT/backend/static/app-mobile"
cd "$ROOT"

echo "Copying app to mobile/www and syncing Android..."
rm -rf "$ROOT/mobile/www"
mkdir -p "$ROOT/mobile/www"
cp -r "$ROOT/backend/static/app-mobile/"* "$ROOT/mobile/www/"

cd "$ROOT/mobile"
npx cap sync android
cd "$ROOT/mobile/android"
./gradlew assembleRelease

echo "Done. Release AAB/APK: mobile/android/app/build/outputs/"
