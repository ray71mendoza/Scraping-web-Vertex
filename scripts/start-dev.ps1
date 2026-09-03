Write-Host "🚀 Iniciando entorno completo VERTEX Prospect..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Creando archivo .env a partir de .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
}

# 1. Start Docker services (Postgres & Redis)
Write-Host "`n1. Verificando contenedores Docker (Postgres & Redis)..." -ForegroundColor Yellow
docker compose up -d postgres redis

# 2. Start Turbo dev server
Write-Host "`n2. Iniciando Web (Puerto 3005) y API (Puerto 4000)..." -ForegroundColor Green
npm run dev
