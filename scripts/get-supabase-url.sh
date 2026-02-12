#!/usr/bin/env bash
# Get linked Supabase project URL via CLI and optionally update backend/.env
# Run from repo root: ./scripts/get-supabase-url.sh
# Use -u or --update to write SUPABASE_URL to backend/.env
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UPDATE=false
[[ "$1" == "-u" || "$1" == "--update" ]] && UPDATE=true

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
    env_path="$ROOT/backend/.env"
    if [[ ! -f "$env_path" ]]; then
        echo "backend/.env not found. Create it first from backend/.env.example" >&2
        exit 1
    fi
    if grep -q '^SUPABASE_URL=' "$env_path"; then
        sed -i.bak "s|^SUPABASE_URL=.*|SUPABASE_URL=$url|" "$env_path"
    else
        echo "SUPABASE_URL=$url" | cat - "$env_path" > "$env_path.tmp" && mv "$env_path.tmp" "$env_path"
    fi
    echo "Updated backend/.env with SUPABASE_URL=$url"
fi
