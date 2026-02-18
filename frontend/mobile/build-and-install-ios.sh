#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Zuno iOS — build UI, sync to ios, open Xcode
# Usage:  ./build-and-install-ios.sh          (build UI + sync + open Xcode)
#         ./build-and-install-ios.sh --skip-ui (skip UI build, just sync + open Xcode)
# Run on macOS. Build/run the app from Xcode (Simulator or device).
# ─────────────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
UI_DIR="$SCRIPT_DIR/../ui"
UI_DIST="$UI_DIR/dist"
MOBILE_DIR="$SCRIPT_DIR"

echo "══════════════════════════════════════════════"
echo "  Zuno iOS — Build & Open Xcode"
echo "══════════════════════════════════════════════"

# ── 1. Build UI (unless --skip-ui) ────────────────────────────────────
if [[ "$1" != "--skip-ui" ]]; then
  echo ""
  echo "▸ Building UI with Vite..."
  cd "$UI_DIR"
  npx vite build
  echo "  ✓ UI built"

  echo ""
  echo "▸ Copying app SPA to mobile/www..."
  cd "$UI_DIR" && npm run build:mobile && cd "$SCRIPT_DIR"
  rm -rf "$MOBILE_DIR/www"
  mkdir -p "$MOBILE_DIR/www"
  cp -r "$UI_DIST/"* "$MOBILE_DIR/www/"
  echo "  ✓ App SPA copied to mobile/www"
else
  echo ""
  echo "▸ Skipping UI build (--skip-ui)"
fi

# ── 2. Capacitor sync iOS ─────────────────────────────────────────────
echo ""
echo "▸ Running Capacitor sync ios..."
cd "$MOBILE_DIR"
npx cap sync ios
echo "  ✓ Capacitor synced"

# ── 3. Open Xcode ─────────────────────────────────────────────────────
echo ""
echo "▸ Opening Xcode..."
npx cap open ios
echo "  ✓ Xcode opened — build and run from Xcode (Simulator or device)"

echo ""
echo "══════════════════════════════════════════════"
echo "  Done. Run the app from Xcode."
echo "══════════════════════════════════════════════"
