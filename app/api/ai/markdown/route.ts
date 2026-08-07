import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { convertToMarkdown } from "@/lib/ai/markdown";
import { AiNotConfiguredError } from "@/lib/ai/client";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:ai:markdown");

const bodySchema = z.object({
  text: z.string().min(1).max(20000),
});

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`ai:markdown:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return apiError("Demasiadas solicitudes a la IA. Intente de nuevo en unos minutos.", 429);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiError("Texto inválido.", 400);

  try {
    const result = await convertToMarkdown(parsed.data.text);
    return apiOk(result);
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return apiError(error.message, 503);
    }
    log.error({ error }, "Fallo al convertir texto a Markdown vía IA");
    return apiError("No se pudo convertir el texto con IA. Intente de nuevo.", 502);
  }
}
