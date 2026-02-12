# Link Supabase project (if not linked) and push migrations.
# Run from repo root: .\scripts\supabase-push.ps1 [PROJECT_REF]
# If PROJECT_REF is omitted, it is derived from SUPABASE_URL in backend/.env.
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$ProjectRef = $args[0]
if (-not $ProjectRef -and (Test-Path backend\.env)) {
    $line = Get-Content backend\.env | Where-Object { $_ -match '^\s*SUPABASE_URL\s*=' } | Select-Object -First 1
    if ($line) {
        $url = ($line -split '=', 2)[1].Trim()
        if ($url -match 'https://([^.]+)\.supabase\.co') {
            $ProjectRef = $Matches[1]
        }
    }
}

if (-not $ProjectRef) {
    Write-Host "Usage: .\scripts\supabase-push.ps1 [PROJECT_REF]"
    Write-Host "  Or set SUPABASE_URL in backend/.env (project ref is derived from URL)"
    exit 1
}

Write-Host "Linking project ref: $ProjectRef"
supabase link --project-ref $ProjectRef
Write-Host "Pushing migrations..."
supabase db push
