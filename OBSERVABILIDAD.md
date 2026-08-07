# OBSERVABILIDAD.md

## Decisión

Este proyecto usa **Pino** con salida **JSON estructurada** como mecanismo de observabilidad, en vez de Elasticsearch + Kibana (documentados en `docker-compose.yml` bajo el profile `observability` como upgrade futuro, no activo en este MVP).

## Configuración

- Logger central: `lib/logger.ts`.
- Formato: JSON estructurado (`pino.stdTimeFunctions.isoTime`, base con `service` y `env`).
- Archivo físico: `logs/app.log` (ruta configurable vía `LOG_FILE_PATH`), escritura asíncrona vía `pino.destination`.
- En desarrollo, además del archivo, se emite salida legible en consola vía `pino-pretty` (multistream).
- En producción, solo el archivo JSON (sin pretty-print, para no pagar el costo de formateo y facilitar ingestión futura por un colector de logs).
- Nivel configurable vía `PINO_LOG_LEVEL` (`info` por defecto).

## Uso en código

```ts
import { childLogger } from "@/lib/logger";

const log = childLogger("nombre-del-modulo");
log.info({ campo: valor }, "Mensaje descriptivo");
log.warn({ ... }, "...");
log.error({ error }, "...");
```

Cada módulo relevante (`db`, `auth`, `mailer`, `circuit-breaker`, y las rutas API a medida que se construyan) usa un `childLogger` con su propio `scope`, de forma que los logs sean filtrables por componente incluso sin un agregador centralizado.

## Qué se registra

- Conexión/reconexión a MongoDB.
- Emisión y verificación de códigos de magic link (sin registrar el código en texto plano).
- Envíos de correo (éxito/fallo, proveedor usado).
- Transiciones de estado del circuit breaker (`CLOSED`→`OPEN`→`HALF_OPEN`→`CLOSED`).
- Eventos de rate limiting (cuando se deniega una petición).
- Errores no controlados en Route Handlers (vía el esquema estándar `{ error: string }`).

## Qué NO se registra

- Contraseñas, códigos de magic link en claro, tokens JWT completos, contenido de mensajes de contacto sensibles más allá de metadatos de auditoría.

## Upgrade futuro (no implementado)

Si el volumen de tráfico o los requisitos del cliente lo justifican, `docker-compose.yml` incluye un profile `observability` con Elasticsearch + Kibana listo para activarse (`docker compose --profile observability up -d`), momento en el cual `lib/logger.ts` se extendería con un transport adicional de Pino hacia Elasticsearch (ej. `pino-elasticsearch`) sin cambiar la interfaz de logging usada en el resto del código.
