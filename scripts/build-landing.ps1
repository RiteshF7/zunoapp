# Build landing page only. Output: backend/static/ (index.html, flow/, assets/)
# Run from repo root: .\scripts\build-landing.ps1
$Root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $Root landing-ui)
npm run build
