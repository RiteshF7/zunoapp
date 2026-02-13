# Link Supabase project and push migrations.
# Run from repo root: .\scripts\supabase-push.ps1 [PROJECT_REF]
# If PROJECT_REF omitted, derived from SUPABASE_URL in backend/.env.
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$ProjectRef = $args[0]
if (-not $ProjectRef -and (Test-Path backend\.env)) {
    $ProjectRef = (python backend/scripts/get_env_var.py backend/.env PROJECT_REF 2>$null).Trim()
}
if (-not $ProjectRef) {
    Write-Host "Usage: .\scripts\supabase-push.ps1 [PROJECT_REF]"
    Write-Host "  Or set SUPABASE_URL in backend/.env"
    exit 1
}
Write-Host "Linking project ref: $ProjectRef"
supabase link --project-ref $ProjectRef
Write-Host "Pushing migrations..."
supabase db push
