Write-Host "🌱 Inicializando base de datos VERTEX Prospect..." -ForegroundColor Cyan

# 1. Generate Prisma Client
Write-Host "`n1. Generando Prisma Client..." -ForegroundColor Yellow
npx prisma generate --schema=packages/database/prisma/schema.prisma

# 2. Push Schema to PostgreSQL
Write-Host "`n2. Aplicando esquema a PostgreSQL..." -ForegroundColor Yellow
npx prisma db push --schema=packages/database/prisma/schema.prisma

# 3. Seed Demo Data
Write-Host "`n3. Sembrando datos de prueba iniciales..." -ForegroundColor Yellow
npx tsx packages/database/src/seed.ts

Write-Host "`n✅ Base de datos inicializada y lista para usar." -ForegroundColor Green
