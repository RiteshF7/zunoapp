# Get linked Supabase project URL via CLI and optionally update backend/.env
# Run from repo root: .\scripts\get-supabase-url.ps1
# Use -Update to write SUPABASE_URL to backend/.env
param([switch]$Update)

$Root = Split-Path -Parent $PSScriptRoot
$json = npx supabase projects list -o json 2>&1 | Out-String
$projects = $json | ConvertFrom-Json
$linked = $projects | Where-Object { $_.linked -eq $true } | Select-Object -First 1
$ref = if ($linked) { $linked.ref } else { $null }

if (-not $ref) {
    Write-Error "Could not find linked Supabase project. Run: npx supabase projects list"
    exit 1
}

$url = "https://${ref}.supabase.co"
Write-Host "Supabase URL: $url"

if ($Update) {
    $envPath = Join-Path $Root "backend\.env"
    if (-not (Test-Path $envPath)) {
        Write-Host "backend/.env not found. Create it first from backend/.env.example"
        exit 1
    }
    $content = Get-Content $envPath -Raw
    if ($content -match 'SUPABASE_URL=.*') {
        $content = $content -replace 'SUPABASE_URL=.*', "SUPABASE_URL=$url"
    } else {
        $content = "SUPABASE_URL=$url`n" + $content
    }
    Set-Content $envPath $content -NoNewline
    Write-Host "Updated backend/.env with SUPABASE_URL=$url"
}
