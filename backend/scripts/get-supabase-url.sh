#!/usr/bin/env bash
# Get linked Supabase project URL. Run from backend/: ./scripts/get-supabase-url.sh [-u|--update] [--mode dev|prod]
set -e
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"
UPDATE=false
MODE="dev"
for arg in "$@"; do
  [[ "$arg" == "-u" || "$arg" == "--update" ]] && UPDATE=true
  [[ "$arg" == "dev" ]] && MODE="dev"
  [[ "$arg" == "prod" ]] && MODE="prod"
done

json=$(npx supabase projects list -o json 2>&1)
if command -v jq &>/dev/null; then
  ref=$(echo "$json" | jq -r '.[] | select(.linked==true) | .ref' | head -1)
else
  ref=$(echo "$json" | grep -oE '"ref"\s*:\s*"[a-z]{20}"' | head -1 | grep -oE '[a-z]{20}')
fi
[[ -z "$ref" ]] && { echo "Could not find linked Supabase project. Run: npx supabase projects list" >&2; exit 1; }
url="https://${ref}.supabase.co"
echo "Supabase URL: $url"

if $UPDATE; then
  env_path="$BACKEND/.env"
  [ -f "$env_path" ] || env_path="$BACKEND/../.env"
  [ -f "$env_path" ] || { echo ".env not found." >&2; exit 1; }
  VAR="SUPABASE_URL_DEV"
  [[ "$MODE" == "prod" ]] && VAR="SUPABASE_URL_PROD"
  if grep -q "^${VAR}=" "$env_path"; then
    sed -i.bak "s|^${VAR}=.*|${VAR}=$url|" "$env_path" 2>/dev/null || sed -i "s|^${VAR}=.*|${VAR}=$url|" "$env_path"
  else
    echo "${VAR}=$url" >> "$env_path"
  fi
  echo "Updated .env with ${VAR}=$url"
fi
