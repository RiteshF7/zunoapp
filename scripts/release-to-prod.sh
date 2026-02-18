#!/usr/bin/env bash
# Release to production: commit on dev, merge dev → production, build UI (web-prod), commit static, push.
# Run from repo root: ./scripts/release-to-prod.sh [commit-message]
#
# Assumes you start on development branch. Steps:
#   1. Pull dev, commit any local changes on dev, push dev
#   2. Switch to production, pull, merge dev into production
#   3. Resolve prod env, build UI into backend/static/app (and landing if present)
#   4. Commit backend/static/ (built app) on production, push production
#   5. Switch back to development
#
# If no commit message is given, uses: "Release: sync development"
# Exits on first failure (set -e).
#
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEV_BRANCH="development"
PROD_BRANCH="production"
REMOTE="${REMOTE:-origin}"
COMMIT_MSG="${1:-Release: sync development}"

echo "=== Release to production ==="
echo "  Branch: $DEV_BRANCH -> $PROD_BRANCH"
echo "  Remote: $REMOTE"
echo ""

# 1. Ensure we're on development
if [[ "$(git branch --show-current)" != "$DEV_BRANCH" ]]; then
  echo "Switching to $DEV_BRANCH..."
  git checkout "$DEV_BRANCH"
fi

# 2. Pull latest development (avoid push rejections later)
echo "Pulling latest $DEV_BRANCH..."
git pull "$REMOTE" "$DEV_BRANCH" --no-rebase

# 3. Commit all changes on development (tracked + untracked) if any
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Committing all changes on $DEV_BRANCH (including untracked files)..."
  git add -A
  git commit -m "$COMMIT_MSG"
else
  echo "No local or untracked changes to commit on $DEV_BRANCH."
fi

# 4. Push development
echo "Pushing $DEV_BRANCH..."
git push "$REMOTE" "$DEV_BRANCH"

# 5. Switch to production and pull
echo "Switching to $PROD_BRANCH..."
git checkout "$PROD_BRANCH"
echo "Pulling latest $PROD_BRANCH..."
git pull "$REMOTE" "$PROD_BRANCH" --no-rebase

# 6. Merge development into production
echo "Merging $DEV_BRANCH into $PROD_BRANCH..."
git merge "$DEV_BRANCH" -m "Merge $DEV_BRANCH into $PROD_BRANCH"

# 7. Build UI for production (same as web-prod: resolve prod + build into backend/static)
echo "Resolving prod env..."
python "$ROOT/backend/scripts/resolve_env.py" --mode prod
echo "Building UI (production)..."
cd "$ROOT/ui" && npm run build && cd "$ROOT"
if [[ -d "$ROOT/landing-ui" ]]; then
  echo "Building landing UI..."
  cd "$ROOT/landing-ui" && npm run build && cd "$ROOT"
fi

# 8. Commit built static files on production (if any changes)
git add backend/static/
if [[ -n "$(git status --porcelain backend/static/)" ]]; then
  echo "Committing built UI on $PROD_BRANCH..."
  git commit -m "Build UI for production"
else
  echo "No changes in backend/static/ (build unchanged)."
fi

# 9. Push production
echo "Pushing $PROD_BRANCH..."
git push "$REMOTE" "$PROD_BRANCH"

# 10. Switch back to development
git checkout "$DEV_BRANCH"

echo ""
echo "Done. $DEV_BRANCH and $PROD_BRANCH are pushed to $REMOTE. You are on $DEV_BRANCH."
