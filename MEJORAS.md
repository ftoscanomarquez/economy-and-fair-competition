# MEJORAS.md — Backlog de mejoras futuras

> No implementado en el MVP por decisión explícita de alcance (ver `AGENTS.md` §1). Activar solo si el tráfico, el cliente o requisitos de cumplimiento lo justifican.

## Infraestructura

- **Vault** para gestión de secretos con fallback a `.env` — activar si el equipo crece o se requiere rotación automática de credenciales.
- **Traefik + Let's Encrypt** para SSL automatizado — activar al definir el despliegue final de producción (ver `CERTIFICADOS.md`, guía ya completa).
- **SonarQube** como complemento a Semgrep para métricas de calidad de código a largo plazo (deuda técnica, duplicación, cobertura histórica).
- **Elasticsearch + Kibana** si el volumen de logs supera lo manejable con grep/lectura directa de `logs/app.log`.
- **Redis** para el store de rate limiting si se pasa de una sola instancia de la app a múltiples réplicas.

## Producto

- Migrar almacenamiento de `public/uploads` (disco local) a RustFS/S3 si el volumen de PDFs/imágenes crece significativamente o se requiere CDN.
- Página `/industrias` dedicada además del carrusel de Home, si el contenido por industria crece más allá de lo que cabe en un modal.
- Búsqueda full-text en Artículos y Notas si el catálogo de posts crece más allá de lo que un filtro por categoría cubre bien.
- Panel de analítica para el admin (visitas por página, artículos más leídos).

## Testing

- Ampliar cobertura de Playwright a pruebas de accesibilidad automatizadas (axe-core) más allá del audit manual de Fase 10.
- CI/CD con ejecución automática de Vitest + Playwright + Semgrep en cada PR (no definido aún si el usuario usará GitHub Actions u otro).
