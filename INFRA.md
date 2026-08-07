# INFRA.md — Arquitectura física y lógica

## Estado de infraestructura del MVP

| Componente | Estado | Detalle |
|---|---|---|
| Base de datos | **Activo** | MongoDB Atlas, cluster `cluster-economy`, DB `economy-and-fair-competition-db` |
| Correo (dev) | **Activo** | Mailpit compartido (`magic-link-mailpit`), SMTP `localhost:1025`, UI `localhost:8025` |
| Correo (prod) | Pendiente de credenciales | Resend API |
| Almacenamiento de archivos | **Activo** | Disco local (`./public/uploads`), no RustFS en este MVP |
| Reverse proxy / SSL | No implementado | Ver `CERTIFICADOS.md` para activación futura con Traefik |
| Gestión de secretos | No implementado | `.env` local únicamente; Vault documentado como upgrade futuro |
| Observabilidad centralizada | No implementado | Pino JSON + archivo físico `logs/app.log`; ver `OBSERVABILIDAD.md` |
| Análisis estático de calidad | Parcial | Semgrep (SAST) sí implementado; SonarQube documentado, no activo |

## Requerimientos mínimos de hardware y software

**Navegadores validados:** Chrome 120+, Firefox 118+, Edge 120+, Safari 17+ (a validar en Fase 10).

**Servidor de producción (recomendado mínimo):**
- Linux Ubuntu Server 22.04 LTS o superior
- 2 vCPUs x86_64 @ 2.4 GHz mínimo
- 4 GB RAM DDR4 mínimo
- Almacenamiento SSD NVMe (mínimo 20 GB libres, más espacio proporcional a volumen de PDFs/imágenes subidos vía `/public/uploads`)
- Node.js 20.9+ LTS

## Capacidad — pruebas de carga (k6)

**Resultados medidos 2026-08-01**, contra un build de producción real (`npm run build && npm run start -p 3100`, no `next dev` — el modo dev dispara latencias varias veces mayores por compilación en caliente y no es representativo). Servidor Next.js como **instancia única** (sin réplicas, sin balanceador ni CDN delante), Mongo Atlas remoto real (no local).

**Hardware de referencia** (equipo de desarrollo usado para generar y para recibir la carga, ambos en la misma máquina — un despliegue real en un servidor dedicado sin compartir CPU con el generador de carga debería rendir mejor):
- CPU: Intel Core Ultra 5 125H (14 núcleos / 18 hilos lógicos)
- RAM: 16 GB
- Windows 11 Pro, Node.js 20.9+, k6 v2.1.0

| Escenario | Métrica objetivo | Resultado medido |
|---|---|---|
| **A — Pico instantáneo** (`SCENARIO=spike`, ramp 0→500 VUs en 10s, sostenido 20s, baja en 10s) | Máximo soportado sin error HTTP | **1197 requests, 0% de error HTTP** (`http_req_failed` 0%, 100% de los `checks` de negocio en verde). Latencia bajo el pico: avg 11.6s, p90 19.2s, p95 20.6s, max 22.2s — degradación esperada de una instancia Node única sin réplicas ante 500 VUs simultáneos (el event loop encola, no cae). |
| **B — Carga sostenida 15 min** (`SCENARIO=sustained`, ramp a 500 VUs en 1 min, sostenido 15 min, baja en 1 min — ~17 min totales) | Usuarios sostenidos sin degradación creciente ni aumento de tasa de error | **41,496 requests HTTP en 17 min (~40.5 req/s sostenido), 0% de error de negocio, 100% de los 41,496 checks en verde durante todo el periodo** (`errores_negocio` rate 0). Latencia: avg 10.9s, p90 21.3s, p95 22.0s, max 26.0s — estable a lo largo de los 15 minutos, sin tendencia de degradación creciente (la instancia no se degrada con el tiempo bajo carga constante, solo bajo el volumen instantáneo de VUs). |

**Lectura del resultado:** la instancia soporta objetivamente 500 usuarios concurrentes **sin caerse y sin errores de negocio**, tanto en pico instantáneo como sostenido 15 minutos — el límite real de esta configuración es la **latencia** (p95 ~20-22s bajo 500 VUs simultáneos), no la disponibilidad. Para un tráfico real de este tipo de sitio institucional (bajo volumen, picos ocasionales, no 500 usuarios simultáneos reales), esta latencia no aplicaría; se documenta aquí como el techo medido, no como una advertencia de que el sitio esté roto. Si el tráfico real esperado se acerca a estos números, la mejora inmediata es horizontal (réplicas + balanceador) antes que vertical (más CPU no resuelve el cuello de I/O de una sola instancia Node bajo miles de conexiones simultáneas).

Reportes HTML completos: `tests/reports/k6/public-load.html` (agregado del run combinado) — JSON crudo con métricas exactas en `tests/reports/k6/spike-summary.json` y `tests/reports/k6/sustained-summary.json`.

Scripts: `tests/load/public-load.js` (flujo público) y `tests/load/mcp-load.js` (endpoint MCP, concurrencia deliberadamente baja — ver comentario del script sobre el rate limit de 30 req/min/IP). Ejecutar con `npm run test:load:spike` / `npm run test:load:sustained` / `npm run test:load:mcp`.

## Colección Postman / Newman

**Ejecutado 2026-08-01** vía `npx newman run postman/Economy-and-Fair-Competition.postman_collection.json -e postman/Economy-and-Fair-Competition.postman_environment.json` contra el servidor de desarrollo (`next dev`, necesario para que el flujo de magic link use Mailpit en vez de Resend — ver `lib/mailer.ts`, el mailer cambia de proveedor según `NODE_ENV`).

- Environment `Economy and Fair Competition - Local`, UUID `755ba005-b877-4dcb-9215-57c9f7a4d36a` (`postman/Economy-and-Fair-Competition.postman_environment.json`), listo para importar en Postman sin error de UUID duplicado.
- **Resultado: 29 requests, 75/75 assertions en verde, 0 fallos.** Cubre las 8 carpetas de la colección: auth (magic link), site-texts, contacto, plantillas, publicaciones (con caso 409 de slug duplicado), IA (Markdown + subida de imagen), servidor MCP (las 3 herramientas de lectura, `create/update/delete_post`, y rechazo 401 sin `Authorization`), y limpieza final.
- **Hallazgo de compatibilidad documentado**: en este entorno (Windows, Node 20.9+), Newman resuelve `http://localhost:PORT` de forma intermitente a una dirección inválida (`Invalid IP address: undefined`) en todas las requests de una corrida — no ocurre con `curl` ni en el navegador. Workaround: usar `http://127.0.0.1:PORT` como `baseUrl` en el environment en vez de `localhost` (ya aplicado en el environment del repo). Si se reintroduce `localhost`, confirmar que Newman siga resolviendo correctamente antes de asumir que un fallo masivo de conexión es un bug del servidor.
- El paso "Leer código en Mailpit (manual)" requiere copiar el código de 6 dígitos desde `http://localhost:8025` (Mailpit, `admin`/`magiclink123`) a la variable `magicLinkCode` del environment antes de cada corrida completa — es un paso manual deliberado (ver comentario dentro del propio request de la colección: automatizarlo con `pm.sendRequest` anidado resultó frágil). Cada código de un solo uso solo sirve para una verificación; si se dispara `request-code` más de una vez antes de leer Mailpit, el código leído puede no corresponder al último registro generado en Mongo (`auth_codes`, ordenado por `createdAt`) — pedir el código y verificarlo en la misma pasada, sin llamadas intermedias a `request-code`.
- Reporte HTML: `tests/reports/postman/index.html` (requiere `newman-reporter-html`, instalado como dependencia de desarrollo bajo demanda).

## Mapeo de resiliencia

| Patrón | Ubicación en código | Cómo auditar |
|---|---|---|
| **Rate limiting** | `lib/rate-limit.ts` — ventana deslizante en memoria, aplicado en los Route Handlers de `/api/contact`, `/api/auth/*`, `/api/mcp/*` | Respuesta HTTP 429 con `Retry-After`; no hay persistencia de eventos individuales en este MVP (in-memory). Si se migra a multi-instancia, mover el store a Redis conservando la interfaz de `checkRateLimit()`. |
| **Circuit breaker** | `lib/circuit-breaker.ts` — estados `CLOSED` / `OPEN` / `HALF_OPEN`, aplicado alrededor de llamadas a Resend (`lib/mailer.ts`) y, en Fase 7, al proveedor de WhatsApp/MCP | Estado persistido en la colección Mongo `circuit_breaker_state` (un documento por `serviceName`). Consultar directamente en Atlas o vía un futuro endpoint de salud administrativo. |

Ambos patrones viven en la capa de aplicación de Next.js (Route Handlers), no en un proxy externo — no hay Traefik activo en este MVP.

**Advertencia de seguridad (revisión OWASP, Fase 9)**: `getClientIp()` (`lib/rate-limit.ts`) identifica al cliente por el header `X-Forwarded-For`, que el propio cliente puede enviar y falsificar libremente. Este mecanismo solo es confiable para rate limiting **si el sitio está desplegado detrás de un proxy inverso** (Traefik, nginx, el balanceador del proveedor cloud) configurado para **descartar cualquier `X-Forwarded-For` entrante del cliente y sobrescribirlo con la IP real de la conexión TCP** antes de reenviar la petición a Next.js. Sin ese proxy delante, un atacante puede rotar el header en cada request y evadir por completo los límites de `/api/auth/request-code` (spam de magic links), `/api/auth/verify-code` (fuerza bruta del código de 6 dígitos), `/api/contact` y `/api/mcp`. Al activar Traefik en producción (ver `CERTIFICADOS.md`), confirmar esta configuración antes de considerar el rate limiting efectivo.

## Diagrama general de componentes

Ver `DIAGRAMAS.md` (Fase 11) para el diagrama Mermaid completo de interacción de componentes, máquina de estados del circuit breaker y del magic link, y modelo de persistencia.
