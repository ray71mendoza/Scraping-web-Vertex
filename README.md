<div align="center">

<!-- HEADER BANNER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,20,30,40&height=190&section=header&text=VERTEX%20Prospect&fontSize=38&subtext=B2B%20Lead%20Enrichment%20%26%20AI%20Opportunity%20Scoring%20Platform&subtextSize=16&subtextY=105&fontAlignY=42" width="100%" alt="VERTEX Prospect Header" />

<!-- SHIELDS BADGES -->
[![Build Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge&logo=statuspage&logoColor=white&color=059669)](https://github.com/ray71mendoza/Scraping-web-Vertex)
[![Version](https://img.shields.io/badge/Version-0.1.0-blue?style=for-the-badge&logo=semver&logoColor=white&color=2563EB)](https://github.com/ray71mendoza/Scraping-web-Vertex)
[![Monorepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)
[![NestJS](https://img.shields.io/badge/NestJS-Backend%20API-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend%20App-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)

<p align="center">
  <b>VERTEX Prospect</b> es una plataforma SaaS B2B de inteligencia comercial que automatiza la prospección geolocalizada, el enriquecimiento de metadatos web mediante scraping asíncrono, la evaluación algorítmica de la brecha digital (Lead Scoring) y la generación personalizada de diagnósticos y propuestas de venta impulsadas por Inteligencia Artificial.
</p>

---

### 🛠️ Stack Tecnológico

<a href="https://skillicons.dev">
  <img src="https://skillicons.dev/icons?i=ts,nestjs,nextjs,react,tailwind,postgres,prisma,redis,docker,nodejs,express,playwright" alt="Tech Stack Icons" />
</a>

</div>

---

## 🚀 Características y Módulos

| Módulo / Funcionalidad | Descripción Detallada | Estado |
| :--- | :--- | :---: |
| 📍 **Discovery Geolocalizado** | Extracción masiva y filtrado de negocios mediante **Google Places API (New)** con cálculo de radio geográfico y field masking. | ✅ |
| 🕷️ **Scraping & Lead Enrichment** | Motor híbrido con **Playwright & Cheerio** para extracción de metatags OG, detección de SSL, CMS (WordPress, Shopify, etc.), PWA, emails y redes sociales. | ✅ |
| ⚙️ **Cola de Tareas Asíncrona** | Orquestación escalable de microservicios y workers mediante **BullMQ** y **Redis**, evitando bloqueos y permitiendo reintentos exponenciales. | ✅ |
| 📊 **Digital Maturity Scoring** | Algoritmo determinista (0–100) que calcula la madurez tecnológica y la brecha digital: `Opportunity = 100 - Digital Score`. | ✅ |
| 🧠 **Motor de IA Generativa** | Integración con **OpenAI (GPT-4o)** para auditorías FODA automáticas, detección de dolores de negocio y generación de propuestas B2B. | ✅ |
| 📋 **Pipeline CRM & Kanban** | Dashboard reactivo con vistas de tabla interactiva, filtros avanzados por nicho y scoring, exportación CSV y tablero Kanban de prospección. | ✅ |
| 🔐 **Seguridad & Multi-Tenancy** | Autenticación JWT, RBAC por Organización, validación DTO estricta con Class-Validator e interceptores de transformación global. | ✅ |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PROCESO DE PROSPECCIÓN VERTEX                         │
└─────────────────────────────────────────────────────────────────────────────────┘

 [Usuario define Campaña: Nicho + Ciudad + Radio]
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
     │   • Detección de SSL, CMS, PWA, SEO       Oportunidad comercial inmediata
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
             [PostgreSQL + Prisma ORM]
                         │
                         ▼
      [Dashboard VERTEX: Vista Kanban / Listado CRM]
```

---

## 📂 Estructura del Monorepo

```text
Scraping-web-Vertex/
├── apps/
│   ├── api/                     # Backend NestJS (DDD, Swagger, Guards, Auth, AI)
│   └── web/                     # Frontend Next.js 15 (App Router, Tailwind, TanStack Query)
├── packages/
│   ├── database/                # Cliente y Esquema Prisma ORM para PostgreSQL
│   ├── queue/                   # BullMQ Queues, Types y Workers en Background
│   ├── scraper/                 # Motor de Scraping (Playwright, Cheerio, Extractors)
│   └── shared/                  # Tipos TS, Constantes de Scoring y Validadores
├── docker/                      # Dockerfiles multi-stage (API, Web, Workers)
├── scripts/                     # Scripts de automatización (PowerShell / Bash)
├── docker-compose.yml           # Orquestación de Postgres, Redis, API, Web y Workers
├── turbo.json                   # Pipeline de compilación y caching Turborepo
└── package.json                 # Configuración de workspaces NPM
```

---

## ⚡ Puesta en Marcha

### 1. Prerrequisitos
- **Node.js**: `>= 20.0.0`
- **NPM**: `>= 10.0.0`
- **Docker & Docker Compose** (para PostgreSQL y Redis)

### 2. Clonar el Repositorio
```bash
git clone https://github.com/ray71mendoza/Scraping-web-Vertex.git
cd Scraping-web-Vertex
```

### 3. Configurar Variables de Entorno
Copia el archivo de ejemplo y completa tus credenciales:
```bash
cp .env.example .env
```

### 4. Levantar Servicios con Docker
Inicia las instancias locales de PostgreSQL y Redis:
```bash
docker compose up -d postgres redis
```

### 5. Instalar Dependencias y Preparar Base de Datos
```bash
# Instalar paquetes del monorepo
npm install

# Generar cliente de Prisma y sincronizar esquema
npm run db:generate
npm run db:push

# Poblar con datos de prueba iniciales (opcional)
npm run db:seed
```

### 6. Ejecutar en Modo Desarrollo
Inicia todos los servicios del monorepo en paralelo mediante Turborepo:
```bash
npm run dev
```

| Servicio | URL Local | Descripción |
| :--- | :--- | :--- |
| **Frontend Web** | `http://localhost:3005` | Dashboard interactivo Next.js |
| **Backend API** | `http://localhost:4000` | Servidor REST NestJS |
| **Documentación Swagger** | `http://localhost:4000/api/docs` | Playground interactivo OpenAPI |

---

## 🐳 Despliegue con Docker (Stack Completo)

Para levantar la infraestructura completa en producción (Base de datos, Redis, API, Frontend y Workers):

```bash
# Construir y levantar todos los contenedores en segundo plano
docker compose up -d --build

# Ver logs en tiempo real
docker compose logs -f
```

---

## 🔌 Principales Endpoints de la API

La API expone una arquitectura modular documentada bajo Swagger OpenAPI:

```text
POST   /api/auth/register            # Registro de nuevos usuarios y organizaciones
POST   /api/auth/login               # Inicio de sesión y generación de token JWT
GET    /api/auth/me                  # Perfil del usuario autenticado
GET    /api/campaigns                # Listado de campañas de prospección
POST   /api/campaigns                # Creación y lanzamiento de búsqueda geolocalizada
GET    /api/leads                    # Listado y filtrado avanzado de leads
GET    /api/leads/:id                # Detalle completo con enriquecimiento y scoring
PATCH  /api/leads/:id/status         # Actualización de estado en pipeline Kanban
POST   /api/ai/proposal/:leadId      # Generación de propuesta comercial personalizada con GPT
POST   /api/ai/diagnose/:leadId      # Diagnóstico FODA y brecha digital automatizado
POST   /api/outreach/email           # Envío de secuencia de contacto por correo
```

---

## ⚖️ Licencia y Créditos

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más información.

<div align="center">

Desarrollado con ❤️ por el equipo de **[VERTEX Technologies](https://github.com/ray71mendoza)**

</div>
