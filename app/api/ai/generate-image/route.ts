/**
 * Genera una imagen con IA (pollinations.ai) a partir de un prompt de texto y
 * la deja guardada en public/uploads, devolviendo el mismo contrato { url }
 * que /api/uploads. Usado por el botón "Generar imagen con IA" en los bloques
 * hero/twoColumn del editor de posts (components/admin/image-upload-field.tsx).
 *
 * Resiliente por diseño (ver lib/ai/image-generation.ts): si pollinations.ai
 * no responde, este endpoint devuelve 503 sin afectar el resto del post — el
 * admin puede reintentar generar la imagen en cualquier momento posterior,
 * no hay reintento automático ni cola en segundo plano.
 */
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateImageFromPrompt, ImageGenerationUnavailableError } from "@/lib/ai/image-generation";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:ai:generate-image");

const bodySchema = z.object({
  prompt: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`ai:generate-image:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return apiError("Demasiadas solicitudes de generación de imagen. Intente de nuevo en unos minutos.", 429);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiError("Prompt inválido.", 400);

  try {
    const result = await generateImageFromPrompt(parsed.data.prompt, session.email);
    return apiOk(result, 201);
  } catch (error) {
    if (error instanceof ImageGenerationUnavailableError) {
      return apiError(error.message, 503);
    }
    log.error({ error }, "Fallo inesperado al generar imagen con IA");
    return apiError("No se pudo generar la imagen. Intente de nuevo.", 502);
  }
}
