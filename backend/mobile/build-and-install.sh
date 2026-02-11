#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Zuno Android — build & install debug APK
# Usage:  ./build-and-install.sh          (build UI + sync + APK + install)
#         ./build-and-install.sh --skip-ui (skip UI build, just sync + APK + install)
# ─────────────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
UI_DIR="$SCRIPT_DIR/../ui"
MOBILE_DIR="$SCRIPT_DIR"
ANDROID_DIR="$SCRIPT_DIR/android"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"

# Force Android Studio's bundled JDK 21 (required by Capacitor 8 / AGP)
export JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"

echo "══════════════════════════════════════════════"
echo "  Zuno Android — Build & Install"
echo "══════════════════════════════════════════════"

# ── 1. Build UI (unless --skip-ui) ────────────────────────────────────
if [[ "$1" != "--skip-ui" ]]; then
  echo ""
  echo "▸ Building UI with Vite..."
  cd "$UI_DIR"
  npx vite build
  echo "  ✓ UI built"

  echo ""
  echo "▸ Copying build output to mobile/www..."
  rm -rf "$MOBILE_DIR/www/assets"
  cp -r "$SCRIPT_DIR/../static/assets" "$MOBILE_DIR/www/assets"

  # Copy index.html from static build and fix asset paths for mobile
  cp "$SCRIPT_DIR/../static/index.html" "$MOBILE_DIR/www/index.html"
  sed -i 's|src="/static/assets/|src="./assets/|g' "$MOBILE_DIR/www/index.html"
  sed -i 's|href="/static/assets/|href="./assets/|g' "$MOBILE_DIR/www/index.html"
  echo "  ✓ Assets + index.html copied"
else
  echo ""
  echo "▸ Skipping UI build (--skip-ui)"
fi

# ── 2. Capacitor sync ─────────────────────────────────────────────────
echo ""
echo "▸ Running Capacitor sync..."
cd "$MOBILE_DIR"
npx cap sync android
echo "  ✓ Capacitor synced"

# ── 3. Gradle build ───────────────────────────────────────────────────
echo ""
echo "▸ Building debug APK..."
cd "$ANDROID_DIR"
./gradlew assembleDebug --quiet
echo "  ✓ APK built: $APK_PATH"

# ── 4. Install on connected device/emulator ───────────────────────────
echo ""
echo "▸ Installing APK..."
adb install -r "$APK_PATH"
echo "  ✓ Installed"

# ── 5. Launch the app ─────────────────────────────────────────────────
echo ""
echo "▸ Launching Zuno..."
adb shell am start -n com.zuno.app/.MainActivity
echo "  ✓ Launched"

echo ""
echo "══════════════════════════════════════════════"
echo "  Done! Zuno is running on the device."
echo "══════════════════════════════════════════════"
