# Fetch JWKS from dev Supabase and write backend/jwks.json. Uses backend/.env.development.
# Run from repo root: .\scripts\fetch-jwks-dev.ps1
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$EnvFile = Join-Path $Root "backend\.env.development"
if (-not (Test-Path $EnvFile)) {
    Write-Host "Missing backend/.env.development. Create from backend/.env.development.example and set SUPABASE_URL."
    exit 1
}
python backend/scripts/fetch_jwks.py $EnvFile
Write-Host "JWKS for dev project written to backend/jwks.json."
