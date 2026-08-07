import { getEnv } from "./env";

type Bucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleBuckets(now: number, windowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.windowStart > windowMs) {
      buckets.delete(key);
    }
  }
  lastCleanup = now;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Rate limiting por ventana deslizante en memoria (adecuado para instancia única).
 * Si el tráfico crece a múltiples instancias, migrar el store a Redis conservando esta interfaz.
 */
export function checkRateLimit(
  key: string,
  options?: { windowMs?: number; maxRequests?: number }
): RateLimitResult {
  const env = getEnv();
  const windowMs = options?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = options?.maxRequests ?? env.RATE_LIMIT_MAX_REQUESTS;
  const now = Date.now();

  cleanupStaleBuckets(now, windowMs);

  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.windowStart + windowMs };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.windowStart + windowMs,
  };
}

/**
 * IMPORTANTE (revisión de seguridad, Fase 9): `X-Forwarded-For` es un header
 * que el propio cliente puede enviar y falsificar libremente. Este valor
 * solo es confiable para rate limiting cuando el servidor está detrás de un
 * proxy inverso (Traefik, nginx, el balanceador del proveedor cloud, etc.)
 * configurado para DESCARTAR cualquier X-Forwarded-For entrante del cliente
 * y sobrescribirlo con la IP real de la conexión TCP — ver INFRA.md /
 * CERTIFICADOS.md para la configuración de Traefik de referencia. Sin ese
 * proxy delante, un atacante puede rotar este header en cada request para
 * evadir por completo los límites de /api/auth/request-code,
 * /api/auth/verify-code, /api/contact y /api/mcp.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}
