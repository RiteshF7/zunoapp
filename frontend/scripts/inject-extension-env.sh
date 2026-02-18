#!/usr/bin/env bash
# Inject API base and app URL from ui/.env into chrome-extension JS files.
# Run from frontend/: ./scripts/inject-extension-env.sh
# Run before packaging the extension or when ui/.env changes.
set -e
FRONTEND="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$FRONTEND/ui/.env"
EXT_DIR="$FRONTEND/chrome-extension"

[[ -f "$ENV_FILE" ]] || { echo "ui/.env not found. Copy ui/.env.example to ui/.env first." >&2; exit 1; }

# Read vars (simple grep, no dotsourcing)
API_BASE=$(grep -E '^\s*VITE_API_BASE\s*=' "$ENV_FILE" 2>/dev/null | sed 's/^[^=]*=\s*//' | tr -d "\"'" | head -1)
APP_URL=$(grep -E '^\s*VITE_APP_URL\s*=' "$ENV_FILE" 2>/dev/null | sed 's/^[^=]*=\s*//' | tr -d "\"'" | head -1)

[[ -z "$API_BASE" ]] && API_BASE="http://localhost:8000"
[[ -z "$APP_URL" ]] && APP_URL="http://localhost:5173/app/"

APP_URL="${APP_URL%/}"
APP_URL="${APP_URL}/"

for f in background.js popup.js; do
  path="$EXT_DIR/$f"
  [[ -f "$path" ]] || continue
  # Replace DEFAULT_ZUNO_APP and DEFAULT_API_BASE lines
  if [[ "$(uname)" = Darwin ]]; then
    sed -i '' "s|const DEFAULT_ZUNO_APP = .*|const DEFAULT_ZUNO_APP = '$APP_URL';|" "$path"
    sed -i '' "s|const DEFAULT_API_BASE = .*|const DEFAULT_API_BASE = '$API_BASE';|" "$path"
  else
    sed -i "s|const DEFAULT_ZUNO_APP = .*|const DEFAULT_ZUNO_APP = '$APP_URL';|" "$path"
    sed -i "s|const DEFAULT_API_BASE = .*|const DEFAULT_API_BASE = '$API_BASE';|" "$path"
  fi
done

echo "Injected API_BASE=$API_BASE, APP_URL=$APP_URL into chrome-extension."
