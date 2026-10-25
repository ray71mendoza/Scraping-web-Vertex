# 🚀 Guía de Despliegue 100% Gratuito: Cloudflare + PostgreSQL + Resend

Esta guía detalla el paso a paso exacto para dejar operativo **VERTEX Prospect** con dominio gratuito, base de datos en la nube sin costo y envío automático de correos comerciales con Resend.

---

## 📑 Resumen de Cuentas y Servicios Gratuitos Requeridos

| Servicio | Propósito | Plan Gratuito | Qué necesitas crear |
| :--- | :--- | :--- | :--- |
| **1. Cloudflare** | Hosting del Frontend + Dominio SSL gratis | **$0** (Cloudflare Pages) | Cuenta en [cloudflare.com](https://cloudflare.com) |
| **2. Neon.tech** o **Supabase** | Base de Datos PostgreSQL para Prisma | **$0** (0.5 GB de almacenamiento, ~50,000 registros) | Cuenta en [neon.tech](https://neon.tech) |
| **3. Upstash** | Redis en la nube para las colas BullMQ | **$0** (10,000 comandos/día) | Cuenta en [upstash.com](https://upstash.com) |
| **4. Resend** | Envío de correos comerciales automatizados | **$0** (3,000 correos/mes, 100 correos/día) | Cuenta en [resend.com](https://resend.com) |

---

## PASO 1: Crear la Base de Datos PostgreSQL Gratuita (Neon.tech)

1. Ve a **[neon.tech](https://neon.tech)** y regístrate con tu cuenta de GitHub o Google.
2. Haz clic en **"Create Project"**:
   - Nombre: `vertex-prospect`
   - Región: `US East (Ohio)` o `US East (N. Virginia)` (la más cercana a Colombia/Latam).
3. En la pantalla principal del Dashboard verás la sección **Connection Details**:
   - Selecciona **Prisma** o **PostgreSQL**.
   - Copia la URL de conexión que tiene esta estructura:
     ```text
     postgresql://usuario:contraseña@ep-dry-pond-123456.us-east-2.aws.neon.tech/vertex-prospect?sslmode=require
     ```
4. Abre tu archivo `.env` en la raíz del proyecto y pega la URL:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@ep-dry-pond-123456.us-east-2.aws.neon.tech/vertex-prospect?sslmode=require"
   ```
5. En tu terminal, empuja el esquema a la nueva base de datos en la nube:
   ```bash
   npm run db:push
   ```
   *¡Listo! Tus tablas `organizations`, `users`, `search_campaigns` y `leads` quedarán creadas en la nube.*

---

## PASO 2: Configurar el Envío de Correos con Resend

1. Ve a **[resend.com](https://resend.com)** y crea tu cuenta gratuita.
2. Ve a la sección **API Keys** en el menú izquierdo:
   - Haz clic en **Create API Key**.
   - Nombre: `VERTEX Production`.
   - Permiso: `Full Access`.
   - Copia la clave generada (empieza por `re_...`).
3. **Sobre el remitente (`EMAIL_FROM`)**:
   - **Modo Inicial / Prueba**: Puedes enviar desde el dominio de pruebas que Resend te da por defecto:
     ```env
     RESEND_API_KEY=re_tu_clave_aqui
     EMAIL_FROM=onboarding@resend.dev
     ```
   - **Modo Dominio Propio (Recomendado para Producción)**:
     - En Resend ve a **Domains** -> **Add Domain** (ej: `tuempresa.com`).
     - Agrega los 3 registros DNS (DKIM, SPF y MX) en tu panel de Cloudflare (se valida en 2 minutos).
     - Luego puedes usar: `EMAIL_FROM=contacto@tuempresa.com` o `prospectos@tuempresa.com`.

---

## PASO 3: Configurar Redis en la Nube (Upstash)

1. Ve a **[upstash.com](https://upstash.com)** y crea tu cuenta gratuita.
2. Crea una base de datos Redis:
   - Name: `vertex-redis`
   - Region: `us-east-1`
3. En la pestaña **Details**, busca la sección **Node (ioredis)** y copia la URL:
   ```text
   rediss://default:tu_token_aqui@us1-tu-host.upstash.io:6379
   ```
4. En tu `.env` actualiza:
   ```env
   REDIS_URL="rediss://default:tu_token_aqui@us1-tu-host.upstash.io:6379"
   ```

---

## PASO 4: Desplegar el Frontend en Cloudflare Pages

1. Asegúrate de haber subido los cambios a tu repositorio de GitHub:
   ```bash
   git add .
   git commit -m "feat: 50 prospectos, propuestas ia completas y whatsapp"
   git push origin main
   ```
2. Entra en tu cuenta de **[Cloudflare Dashboard](https://dash.cloudflare.com)**.
3. En el menú lateral izquierdo, haz clic en **Compute (Workers) -> Workers & Pages**.
4. Haz clic en **Create application** y selecciona la pestaña **Pages** -> **Connect to Git**.
5. Autoriza tu cuenta de GitHub y selecciona el repositorio `Scraping-web-Vertex`.
6. Configura los ajustes de despliegue:
   - **Project name**: `vertex-prospect`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Root directory**: `apps/web`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
7. Despliega la pestaña **Environment variables** y añade:
   - `NEXT_PUBLIC_API_URL`: La URL pública de tu backend (ver Paso 5).
8. Haz clic en **Save and Deploy**.
9. Cloudflare compilará el frontend y te entregará tu dominio gratuito con SSL:
   ```text
   https://vertex-prospect.pages.dev
   ```

---

## PASO 5: Desplegar el Backend y Scraper

El backend de VERTEX corre NestJS, BullMQ y el motor de scraping con Playwright. Dado que los navegadores headless (Chromium) requieren recursos de memoria RAM que los planes gratuitos de la nube suelen suspender, existen dos rutas excelentes:

### Opción A (Recomendada: Cloudflare Tunnel — 100% Gratis y Rendimiento Máximo)
Ejecutas el backend en tu propio equipo o servidor local con toda la memoria RAM para Playwright, pero expuesto al mundo a través de un túnel seguro de Cloudflare:
1. Descarga el ejecutable gratuito de Cloudflare `cloudflared`:
   - [Descargar Cloudflare Tunnel para Windows](https://github.com/cloudflare/cloudflared/releases)
2. Ejecuta en tu terminal:
   ```bash
   cloudflared tunnel --url http://localhost:4000
   ```
3. Cloudflare te generará inmediatamente una URL HTTPS pública protegida como:
   `https://tu-tunel-temporal.trycloudflare.com`
4. Esa URL la colocas en la variable `NEXT_PUBLIC_API_URL` de Cloudflare Pages.

### Opción B (Cloud Hosting Gratuito: Render / Koyeb)
Si prefieres que esté 100% en la nube sin tu PC encendida:
1. Crea una cuenta en [render.com](https://render.com).
2. Crea un **Web Service**, conecta tu repo, selecciona `apps/api` como directorio base y comando `npm run start:prod`.
3. Render te da una URL HTTPS gratuita `https://vertex-api.onrender.com`.

---

## 🎯 Verificación del Flujo Completo

Una vez configuradas las variables en `.env`:
1. Entras a tu plataforma en `https://vertex-prospect.pages.dev` (o `http://localhost:3005`).
2. Vas a **Nueva Prospección**.
3. Seleccionas un nicho (Hoteles, Restaurantes, Colegios, Clínicas, etc.) o escribes uno personalizado.
4. Ubicación: **Cartagena, Colombia** (o la ciudad que elijas).
5. Haces clic en **Iniciar Prospección**:
   - Se procesan los **50 prospectos**.
   - Cada prospecto recibe su propuesta de IA adaptada a su nicho (software a medida, ciberseguridad, video/redes, marketing o WhatsApp).
   - Desde la tabla o el modal puedes presionar el **botón de WhatsApp** para enviar el gancho al instante o el **botón de Correo** para enviar la propuesta formal con Resend.
