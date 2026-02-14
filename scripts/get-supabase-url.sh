#!/usr/bin/env bash
# Get linked Supabase project URL via CLI and optionally update root .env
# Run from repo root: ./scripts/get-supabase-url.sh [-u|--update] [--mode dev|prod]
# Use -u or --update to write SUPABASE_URL_DEV or SUPABASE_URL_PROD to root .env
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
UPDATE=false
MODE="dev"
for arg in "$@"; do
  [[ "$arg" == "-u" || "$arg" == "--update" ]] && UPDATE=true
  [[ "$arg" == "dev" ]] && MODE="dev"
  [[ "$arg" == "prod" ]] && MODE="prod"
done

json=$(npx supabase projects list -o json 2>&1)
# Extract ref of linked project
if command -v jq &>/dev/null; then
    ref=$(echo "$json" | jq -r '.[] | select(.linked==true) | .ref' | head -1)
else
    ref=$(echo "$json" | grep -oE '"ref"\s*:\s*"[a-z]{20}"' | head -1 | grep -oE '[a-z]{20}')
fi
if [[ -z "$ref" ]]; then
    echo "Could not find linked Supabase project. Run: npx supabase projects list" >&2
    exit 1
fi

url="https://${ref}.supabase.co"
echo "Supabase URL: $url"

if $UPDATE; then
    env_path="$ROOT/.env"
    if [[ ! -f "$env_path" ]]; then
        echo "root/.env not found. Create it first from .env.example" >&2
        exit 1
    fi
    VAR="SUPABASE_URL_DEV"
    [[ "$MODE" == "prod" ]] && VAR="SUPABASE_URL_PROD"
    if grep -q "^${VAR}=" "$env_path"; then
        sed -i.bak "s|^${VAR}=.*|${VAR}=$url|" "$env_path"
    else
        echo "${VAR}=$url" >> "$env_path"
    fi
    echo "Updated root .env with ${VAR}=$url"
fi
