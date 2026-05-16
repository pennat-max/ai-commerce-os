# AI Commerce OS — local setup helper
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Created .env.local — add your Supabase URL and anon key, then re-run." -ForegroundColor Yellow
}

npm install
npm run build

Write-Host ""
Write-Host "=== Next steps (Supabase Dashboard) ===" -ForegroundColor Cyan
Write-Host "1. Create project at https://supabase.com"
Write-Host "2. SQL Editor: run supabase/schema.sql, rls.sql, auth.sql, seed.sql"
Write-Host "3. Authentication > Users: create admin@example.com, owner@example.com, staff@example.com"
Write-Host "4. SQL Editor: run supabase/seed-auth.sql"
Write-Host "5. Project Settings > API: copy URL + anon key into .env.local"
Write-Host "6. Optional: set NEXT_PUBLIC_DATA_SOURCE=supabase in .env.local"
Write-Host ""
Write-Host "Start app: npm run dev" -ForegroundColor Green
