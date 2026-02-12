# Copy .env.example -> .env for backend and ui if .env does not exist.
# Run from repo root: .\scripts\setup-env.ps1
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path backend\.env)) {
    Copy-Item backend\.env.example backend\.env
    Write-Host "Created backend/.env from .env.example"
} else {
    Write-Host "backend/.env already exists"
}

if (-not (Test-Path ui\.env)) {
    Copy-Item ui\.env.example ui\.env
    Write-Host "Created ui/.env from .env.example"
} else {
    Write-Host "ui/.env already exists"
}

Write-Host "Edit backend/.env and ui/.env with your Supabase URL, keys, and (for prod) ENVIRONMENT and CORS_ORIGINS."
