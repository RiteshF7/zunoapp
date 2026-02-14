#!/usr/bin/env bash
# Repair migration history and push to dev Supabase.
# Use when remote DB already has tables but migrations weren't tracked.
# Run from repo root: ./scripts/supabase-repair-and-push-dev.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

"$ROOT/scripts/resolve-env.sh"
PROJECT_REF=$(python backend/scripts/get_env_var.py backend/.env.development PROJECT_REF 2>/dev/null) || true
[ -n "$PROJECT_REF" ] || { echo "Missing SUPABASE_URL in backend/.env.development."; exit 1; }

echo "=== Dev Supabase: project ref $PROJECT_REF ==="
npx supabase link --project-ref "$PROJECT_REF"

echo ""
echo "=== Marking existing migrations as applied ==="
for v in 20260207000000 20260207000001 20260207000002 20260210000000 20260210100000 \
         20260211000000 20260211100000 20260211120000 20260212000000 20260212100000 \
         20260212110000 20260213000000; do
  npx supabase migration repair "$v" --status applied
done

echo ""
echo "=== Pushing remaining migrations ==="
npx supabase db push

echo ""
echo "Done. Dev Supabase migrations synced."
