# Economy and Fair Competition

Sitio web corporativo institucional de **Economy and Fair Competition**, firma internacional especializada en Comercio Exterior, Derecho Aduanero y Propiedad Intelectual e Industrial.

## Documentación del proyecto

| Archivo | Contenido |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | Gobernanza, decisiones de infraestructura y planificación completa por fases |
| [`HISTORY.md`](./HISTORY.md) | Bitácora de progreso — **leer primero para saber en qué fase estamos** |
| [`QUICK-START.md`](./QUICK-START.md) | Comandos CLI y estructura del proyecto |
| [`SPECIFICATION-SUMMARY.md`](./SPECIFICATION-SUMMARY.md) | Contratos de API y tecnologías justificadas |
| [`INFRA.md`](./INFRA.md) | Arquitectura física/lógica, capacidad, resiliencia |
| [`OBSERVABILIDAD.md`](./OBSERVABILIDAD.md) | Logging con Pino |
| [`CERTIFICADOS.md`](./CERTIFICADOS.md) | Guía de SSL/TLS (Traefik, mkcert, Let's Encrypt) |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Despliegue a producción |
| [`DIAGRAMAS.md`](./DIAGRAMAS.md) | Diagramas de arquitectura |
| [`RETROSPECTIVA.md`](./RETROSPECTIVA.md) | Registro de problemas y soluciones por fase |
| [`MEJORAS.md`](./MEJORAS.md) | Backlog de mejoras futuras no implementadas en el MVP |
| [`PRODUCT.md`](./PRODUCT.md) | Contexto de producto (skill impeccable) — se genera en Fase 1 |
| [`DESIGN.md`](./DESIGN.md) | Sistema de diseño confirmado (skill impeccable) — se genera en Fase 1 |

## Quick start

```bash
npm install
cp .env.example .env   # completar con credenciales reales
npm run dev
```

Ver [`QUICK-START.md`](./QUICK-START.md) para el resto de comandos (tests, seeds, seguridad).

## Credenciales de infraestructura de desarrollo

| Servicio | URL / Acceso | Usuario | Contraseña |
|---|---|---|---|
| Mailpit (correo de desarrollo) | http://localhost:8025 | — | — |
| Admin del sitio (dev) | `/admin` → Magic Link | Email en `ADMIN_ALLOWED_EMAILS` (`.env`) | Código de 6 dígitos enviado a Mailpit |
| MongoDB Atlas | Cluster `cluster-economy` | Ver `.env` (`MONGODB_URI`) — no versionado | Ver `.env` |

> Ninguna credencial real se documenta en este README ni en ningún archivo versionado. Todas viven en `.env` (gitignored). `.env.example` documenta las claves esperadas sin valores reales.

## Stack

Next.js 16 (App Router) + TypeScript · Tailwind CSS (tokens OKLCH) · Radix UI + Framer Motion · MongoDB Atlas · Pino · Resend/Mailpit · next-intl (ES/EN) · Vitest + Playwright + k6 · Semgrep

Ver [`AGENTS.md`](./AGENTS.md) para el detalle completo de decisiones de arquitectura.
