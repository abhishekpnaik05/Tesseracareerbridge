# Local development bootstrap for TesseraCareerBridge
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example"
}

if (-not (Test-Path "client/.env")) {
  Copy-Item "client/.env.example" "client/.env"
  Write-Host "Created client/.env from client/.env.example"
}

if (-not (Test-Path "database/.env")) {
  Copy-Item ".env" "database/.env"
  Write-Host "Created database/.env for Prisma"
}

pnpm install
docker compose up -d
pnpm db:generate

Write-Host ""
Write-Host "Setup complete. Next:"
Write-Host "  pnpm db:migrate"
Write-Host "  pnpm dev"
