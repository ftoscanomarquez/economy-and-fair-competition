# MEJORAS.md — Backlog de mejoras futuras

> No implementado en el MVP por decisión explícita de alcance (ver `AGENTS.md` §1). Activar solo si el tráfico, el cliente o requisitos de cumplimiento lo justifican.

## Infraestructura

- **Vault** para gestión de secretos con fallback a `.env`/Vercel Environment Variables — activar si el equipo crece o se requiere rotación automática de credenciales. Hoy el resguardo es manual (`.env.prod`, gitignored).
- ~~Traefik + Let's Encrypt para SSL~~ — **resuelto 2026-08-07**: el despliegue final es Vercel, que emite y renueva el certificado TLS automáticamente. `CERTIFICADOS.md` queda como referencia solo para un eventual despliegue propio fuera de Vercel.
- **SonarQube** como complemento a Semgrep para métricas de calidad de código a largo plazo (deuda técnica, duplicación, cobertura histórica).
- **Elasticsearch + Kibana** si el volumen de logs supera lo manejable con el panel de logs de Vercel / lectura directa de `logs/app.log` en desarrollo.
- **Redis** para el store de rate limiting si se pasa de una sola instancia de la app a múltiples réplicas (Vercel ya corre cada request como función serverless independiente — revisar si el rate limiting en memoria sigue siendo efectivo bajo ese modelo antes de que el tráfico crezca).

## Producto

- ~~Migrar almacenamiento de `public/uploads` a RustFS/S3~~ — **resuelto 2026-08-08**: migrado a Vercel Blob (`lib/uploads.ts`), con fallback a disco local para desarrollo/despliegues propios.
- Página `/industrias` dedicada además del carrusel de Home, si el contenido por industria crece más allá de lo que cabe en un modal.
- Búsqueda full-text en Artículos y Notas si el catálogo de posts crece más allá de lo que un filtro por categoría cubre bien.
- Panel de analítica para el admin (visitas por página, artículos más leídos).

## Testing

- Ampliar cobertura de Playwright a pruebas de accesibilidad automatizadas (axe-core) más allá del audit manual de Fase 10.
- ~~CI/CD con ejecución automática de Vitest + Playwright + Semgrep en cada PR~~ — **resuelto 2026-08-06/07**: GitHub Actions (`ci.yml`, automático en push/PR a `main`; `load-test.yml` para k6, manual bajo demanda). Ver `INFRA.md`/`HISTORY.md`.

## Pendientes activos (no en MVP original, surgidos durante el desarrollo)

- Validar extracción con IA de archivos `.docx`/`.pptx` reales — el backend (`officeparser`) ya los soporta, pero solo se probó end-to-end con PDF y URL/HTML.
- Verificación de número de WhatsApp Business con código de un solo uso (mencionada como alternativa/complemento al JWT de sesión admin) — quedó fuera de esta pasada, JWT es el mecanismo principal implementado.
