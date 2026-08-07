# DEPLOYMENT.md

> Se completa en Fase 11 con pasos reales de despliegue a producción. Esqueleto inicial creado en Fase 0.

## Pendiente de definir con el usuario

- [ ] Plataforma de hosting de producción (Vercel, VPS propio + Traefik, otro).
- [ ] Dominio real de producción.
- [ ] Credenciales de Resend para producción.
- [ ] Estrategia de backups de MongoDB Atlas (Atlas ya ofrece backups automáticos según el tier del cluster — confirmar tier).
- [ ] Estrategia de despliegue del servidor MCP/WhatsApp (Fase 7).

## Variables de entorno de producción

Ver `.env.example` como plantilla. En producción, como mínimo deben diferir de desarrollo:

- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://economyandfaircompetition.com`
- `RESEND_API_KEY=<clave real>`
- `JWT_SECRET=<secreto distinto al de desarrollo, generado independientemente>`

## Checklist previo a cada despliegue

- [ ] `npm run typecheck` sin errores.
- [ ] `npm run lint` sin errores.
- [ ] `npm run build` exitoso.
- [ ] `npm run test` (Vitest) en verde.
- [ ] `npm run test:e2e` (Playwright) en verde contra un entorno de staging.
- [ ] Reporte Semgrep sin hallazgos High/Critical sin resolver.
- [ ] Variables de entorno de producción confirmadas y sin secretos de desarrollo filtrados.
