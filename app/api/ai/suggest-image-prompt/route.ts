/**
 * Sugiere un prompt de generación de imagen más detallado (vía Claude) a
 * partir del texto ya escrito en un bloque hero/twoColumn. Paso intermedio
 * opcional antes de POST /api/ai/generate-image — el admin ve la sugerencia
 * en un campo editable y decide si la usa, la ajusta o la descarta.
 * Ver components/admin/image-upload-field.tsx (botón "Sugerir prompt con IA").
 */
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { suggestImagePrompt } from "@/lib/ai/image-generation";
import { AiNotConfiguredError } from "@/lib/ai/client";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:ai:suggest-image-prompt");

const bodySchema = z.object({
  sourceText: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`ai:suggest-image-prompt:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return apiError("Demasiadas solicitudes a la IA. Intente de nuevo en unos minutos.", 429);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiError("Texto inválido.", 400);

  try {
    const prompt = await suggestImagePrompt(parsed.data.sourceText);
    return apiOk({ prompt });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return apiError(error.message, 503);
    }
    log.error({ error }, "Fallo al sugerir prompt de imagen vía IA");
    return apiError("No se pudo generar una sugerencia. Intente de nuevo.", 502);
  }
}
