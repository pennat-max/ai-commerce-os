# AI Commerce OS — Supabase CLI setup (cloud)
# Usage:
#   .\scripts\supabase-setup.ps1 -AccessToken "sbp_xxx" -ProjectRef "abcdefghijklmnop"
# Or set env: SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF

param(
  [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN,
  [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
  [switch]$SkipSeed
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Invoke-Supabase {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$CommandArgs)
  & npx --yes supabase @CommandArgs
  if ($LASTEXITCODE -ne 0) { throw "supabase $($CommandArgs -join ' ') failed (exit $LASTEXITCODE)" }
}

Write-Host "=== AI Commerce OS · Supabase Setup ===" -ForegroundColor Cyan

if (-not $AccessToken) {
  Write-Host ""
  Write-Host "ต้องมี Access Token ก่อน (ทำครั้งเดียว):" -ForegroundColor Yellow
  Write-Host "  1. เปิด https://supabase.com/dashboard/account/tokens"
  Write-Host "  2. สร้าง token แล้วรัน:"
  Write-Host '     .\scripts\supabase-setup.ps1 -AccessToken "sbp_..." -ProjectRef "your-project-ref"'
  Write-Host ""
  Write-Host "หา Project Ref: Dashboard > Project Settings > General > Reference ID"
  exit 1
}

if (-not $ProjectRef) {
  Write-Host "กำลัง login และแสดงรายการโปรเจกต์..." -ForegroundColor Gray
  Invoke-Supabase login --token $AccessToken
  Invoke-Supabase projects list
  Write-Host ""
  Write-Host "ระบุ -ProjectRef จากรายการด้านบน แล้วรันสคริปต์อีกครั้ง" -ForegroundColor Yellow
  exit 1
}

Write-Host "Login..." -ForegroundColor Gray
Invoke-Supabase login --token $AccessToken

Write-Host "Link project $ProjectRef ..." -ForegroundColor Gray
Invoke-Supabase link --project-ref $ProjectRef --yes

Write-Host "Push migrations + seed..." -ForegroundColor Gray
$pushArgs = @("db", "push", "--include-seed", "--yes")
if ($SkipSeed) { $pushArgs = @("db", "push", "--yes") }
Invoke-Supabase @pushArgs

Write-Host "Fetch API keys..." -ForegroundColor Gray
$projectUrl = "https://$ProjectRef.supabase.co"
$anonKey = $null

try {
  $raw = npx --yes supabase projects api-keys --project-ref $ProjectRef -o json 2>&1 | Out-String
  $keysJson = $raw | ConvertFrom-Json
  if ($keysJson -is [array]) {
    $anonKey = ($keysJson | Where-Object { $_.name -eq "anon" }).api_key
    if (-not $anonKey) { $anonKey = $keysJson[0].api_key }
  }
} catch {
  Write-Host "Could not parse API keys automatically." -ForegroundColor Yellow
}

$envPath = Join-Path $root ".env.local"
$lines = @(
  "NEXT_PUBLIC_SUPABASE_URL=$projectUrl",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey",
  "NEXT_PUBLIC_APP_URL=http://localhost:3000",
  "NEXT_PUBLIC_DATA_SOURCE=supabase",
  "SUPABASE_PROJECT_REF=$ProjectRef"
)
if (-not $anonKey) {
  $lines[1] = "NEXT_PUBLIC_SUPABASE_ANON_KEY="
  Write-Host "ใส่ anon key เองใน .env.local จาก Dashboard > Settings > API" -ForegroundColor Yellow
}
Set-Content -Path $envPath -Value ($lines -join "`n") -Encoding utf8

Write-Host ""
Write-Host "Done. Wrote .env.local" -ForegroundColor Green
Write-Host "URL: $projectUrl"
Write-Host ""
Write-Host "ขั้นตอนถัดไป (Dashboard > Authentication > Users):" -ForegroundColor Cyan
Write-Host "  สร้าง admin@example.com, owner@example.com, staff@example.com"
Write-Host "  จากนั้นรัน supabase/seed-auth.sql ใน SQL Editor"
Write-Host ""
Write-Host "Start app: npm run dev" -ForegroundColor Green
