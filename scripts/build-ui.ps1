# Build UI (Vite). Uses ui/.env for VITE_* at build time. Output: backend/static/
# Run from repo root: .\scripts\build-ui.ps1
$Root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $Root ui)
npm run build
