# Fetch JWKS from **dev** Supabase and write backend/jwks.json. Uses backend/.env.development.
# Run from repo root: .\scripts\fetch-jwks-dev.ps1
# Use when working in dev so backend validates JWTs from the dev Supabase project.
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$EnvFile = Join-Path $Root "backend\.env.development"
if (-not (Test-Path $EnvFile)) {
    Write-Host "Missing backend/.env.development. Create from backend/.env.development.example and set SUPABASE_URL."
    exit 1
}

$line = Get-Content $EnvFile | Where-Object { $_ -match '^\s*SUPABASE_URL\s*=' } | Select-Object -First 1
if (-not $line) {
    Write-Host "SUPABASE_URL not set in backend/.env.development"
    exit 1
}
$url = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")

python backend/scripts/fetch_jwks.py $url
Write-Host "JWKS for dev project written to backend/jwks.json."
