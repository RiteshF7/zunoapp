# Set project config to dev or prod. Writes to config/env-mode; backend loads .env.development or .env.production.
# Run from repo root: .\scripts\use-env.ps1 dev   or   .\scripts\use-env.ps1 prod
param([Parameter(Mandatory=$true)][ValidateSet('dev','prod')][string]$Mode)

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$MODE = if ($Mode -eq 'dev') { 'development' } else { 'production' }

$ConfigDir = Join-Path $Root "config"
if (-not (Test-Path $ConfigDir)) { New-Item -ItemType Directory -Path $ConfigDir | Out-Null }
$ModeFile = Join-Path $ConfigDir "env-mode"
Set-Content -Path $ModeFile -Value $MODE

Write-Host "Project config set to: $MODE"
Write-Host "Backend will use backend/.env.$MODE. Restart backend if running."
