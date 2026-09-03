# VERTEX Prospect — B2B Lead Enrichment & AI Scoring Platform

**VERTEX Prospect** es una plataforma B2B SaaS de prospección inteligente, lead enrichment, scoring de madurez digital y generación de propuestas comerciales automatizadas mediante IA.

---

## 🏗️ Arquitectura del Sistema

```
[Usuario define Búsqueda: Nicho + Ciudad + Radio]
                        │
                        ▼
           [Google Places API (New)]
    (Text Search / Nearby Search con FieldMask)
                        │
       (Place ID, Nombre, Dirección, Teléfono, Web)
                        │
                        ▼
          [BullMQ: Discovery Queue]
                        │
    ┌───────────────────┴───────────────────┐
    ▼                                       ▼
[¿Tiene Sitio Web?]                     [No tiene Sitio Web]
    │                                       │
    ├─► [Playwright / Cheerio Worker]       └─► Flag: `web_missing = true`
    │   • Scraping de metadatos (Meta tags)     Score base reducido
    │   • Detección de SSL, CMS, PWA, SEO       Oportunidad inmediata
    │   • Extracción de emails (regex/mailto)   │
    │   • Enlaces a Redes (IG, FB, TikTok, WA)  │
    │                                           │
    └───────────────────┬───────────────────────┘
                        ▼
          [BullMQ: Enrichment Queue]
                        │
              [Motor de Lead Scoring]
      (Cálculo algorítmico de brecha digital 0-100)
                        │
                        ▼
               [Motor de IA Generativa]
   (Diagnóstico FODA, identificación de dolores de negocio
        y borrador de propuesta personalizada)
                        │
                        ▼
     [PostgreSQL + MongoDB / JSONB Atómico]
                        │
                        ▼
     [Dashboard VERTEX: Vista Kanban / Listado CRM]
```

---

## 📦 Estructura del Monorepo (Turborepo)

```
├── apps/
│   ├── api/                   # Backend NestJS (Domain-Driven Design, Swagger, Guards)
│   └── web/                   # Frontend Next.js 14+ (App Router, Tailwind, Shadcn/UI)
├── packages/
│   ├── database/              # Prisma Schema & Client para PostgreSQL
│   ├── queue/                 # BullMQ Queues & Workers (Discovery & Enrichment)
│   ├── scraper/               # Motor de Scraping (Playwright + Cheerio + Extractors)
│   └── shared/                # Types, Constantes de Scoring y Validadores compartidos
├── docker/                    # Dockerfiles multi-stage para api, web y worker
├── docker-compose.yml         # Orquestación de Postgres, Redis, Api, Web y Worker
└── turbo.json                 # Configuración de pipelines y compilación
```

---

## ⚡ Inicio Rápido (Desarrollo Local)

### 1. Prerrequisitos
- Node.js >= 20.0.0
- Docker & Docker Compose
- Claves API (opcionales para modo desarrollo con mocks):
  - Google Places API Key
  - OpenAI API Key

### 2. Configuración de Variables de Entorno
```bash
cp .env.example .env
```

### 3. Levantar Base de Datos y Redis con Docker
```bash
docker compose up -d postgres redis
```

### 4. Generar Cliente y Migrar Base de Datos
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Iniciar la Aplicación en Modo Desarrollo
```bash
npm run dev
```

- **Frontend (Next.js)**: `http://localhost:3000`
- **Backend API (NestJS)**: `http://localhost:4000`
- **Swagger Docs**: `http://localhost:4000/api/docs`

---

## 🐳 Despliegue con Docker Multi-Contenedor

Para levantar el stack completo (Postgres, Redis, API, Frontend y Workers) en un servidor VPS / AWS:

```bash
docker compose up -d --build
```

---

## 🎯 Motor de Scoring Determinista (0 a 100)

- **Presencia Web (40 pts máx)**:
  - Tiene sitio web: +15
  - Certificado SSL válido (HTTPS): +5
  - Dominio propio: +10
  - Responsivo / PWA: +5
  - Metatags OpenGraph: +5
- **Redes y Canales (30 pts máx)**:
  - Instagram / Facebook activo: +15
  - Botón directo WhatsApp: +15
- **Reputación Google (30 pts máx)**:
  - Más de 20 reseñas: +15
  - Calificación > 4.0 estrellas: +10
  - Perfil verificado completo: +5

**Regla de Oro:**
$$\text{opportunity\_score} = 100 - \text{digital\_score}$$
*A menor madurez digital del prospecto, mayor es la oportunidad comercial para VERTEX.*
