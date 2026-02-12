#!/usr/bin/env bash
# Run all production-prep steps via CLI (from repo root).
# 1. Setup .env from examples if missing
# 2. Fetch JWKS from Supabase (backend/.env SUPABASE_URL)
# 3. Link Supabase and push migrations
# 4. Build UI (uses ui/.env for VITE_*)
# Prereqs: Fill backend/.env and ui/.env with your values first (or run setup-env then edit).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 1. Setup .env (copy from examples if missing) ==="
"$ROOT/scripts/setup-env.sh"

echo ""
echo "=== 2. Fetch JWKS (from backend/.env SUPABASE_URL) ==="
python backend/scripts/fetch_jwks.py

echo ""
echo "=== 3. Supabase: link and push migrations ==="
if [ -f backend/.env ]; then
  SUPABASE_URL=$(grep -E '^\s*SUPABASE_URL\s*=' backend/.env | sed 's/^[^=]*=\s*//' | tr -d '"'"'"' | head -1)
  if [ -n "$SUPABASE_URL" ]; then
    PROJECT_REF=$(echo "$SUPABASE_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co.*|\1|p')
    if [ -n "$PROJECT_REF" ]; then
      supabase link --project-ref "$PROJECT_REF" 2>/dev/null || true
      supabase db push
    else
      echo "Could not derive project ref from SUPABASE_URL. Run: ./scripts/supabase-push.sh <PROJECT_REF>"
    fi
  else
    echo "SUPABASE_URL not set in backend/.env. Run: ./scripts/supabase-push.sh <PROJECT_REF>"
  fi
else
  echo "backend/.env missing. Run: ./scripts/supabase-push.sh <PROJECT_REF>"
fi

echo ""
echo "=== 4. Build UI ==="
cd "$ROOT/ui" && npm run build

echo ""
echo "=== Done. Manual steps (Dashboard): ==="
echo "  - Supabase → Auth → URL Configuration: add production redirect URL and com.zuno.app://callback"
echo "  - Supabase → Edge Functions: set env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AI keys)"
echo "  - Optional: set admin: UPDATE public.profiles SET role = 'admin' WHERE id = '<uuid>';"
