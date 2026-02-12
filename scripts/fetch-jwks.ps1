# Fetch JWKS from Supabase (URL from backend/.env) and write backend/jwks.json.
# Run from repo root: .\scripts\fetch-jwks.ps1
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
python backend/scripts/fetch_jwks.py
