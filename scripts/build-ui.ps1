# Build UI and landing. Uses ui/.env for VITE_* at build time.
# Output: backend/static/app (main app), backend/static/ (landing)
# Run from repo root: .\scripts\build-ui.ps1
# Build order: ui first, then landing (landing overwrites index.html at root)
$Root = Split-Path -Parent $PSScriptRoot

# 1. Build main app → backend/static/app/
Set-Location (Join-Path $Root ui)
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 2. Build landing → backend/static/ (index.html, flow/, assets/)
Set-Location (Join-Path $Root landing-ui)
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
