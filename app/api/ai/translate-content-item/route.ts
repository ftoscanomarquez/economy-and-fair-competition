import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { translateContentItemFields } from "@/lib/ai/translate";
import { AiNotConfiguredError } from "@/lib/ai/client";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:ai:translate-content-item");

const bodySchema = z.object({
  title: z.string().max(500),
  summary: z.string().max(2000),
  detail: z.string().max(20000),
  direction: z.enum(["es-to-en", "en-to-es"]),
});

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`ai:translate-content-item:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return apiError("Demasiadas solicitudes a la IA. Intente de nuevo en unos minutos.", 429);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiError("Datos de traducción inválidos.", 400);

  const { direction, ...fields } = parsed.data;

  try {
    const result = await translateContentItemFields(fields, direction);
    return apiOk(result);
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return apiError(error.message, 503);
    }
    log.error({ error }, "Fallo al traducir campos de content item vía IA");
    return apiError("No se pudo traducir el contenido con IA. Intente de nuevo.", 502);
  }
}
