import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isEmailAllowed, verifyMagicLinkCode, createSessionToken } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:auth:verify-code");

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6).regex(/^\d{6}$/),
});

const REASON_MESSAGES: Record<string, string> = {
  not_found: "No se encontró un código pendiente para este correo.",
  expired: "El código ha expirado. Solicita uno nuevo.",
  too_many_attempts: "Demasiados intentos fallidos. Solicita un nuevo código.",
  invalid_code: "El código ingresado no es correcto.",
  already_used: "Este código ya fue utilizado. Solicita uno nuevo.",
};

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`auth:verify-code:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return apiError("Demasiados intentos. Intente de nuevo en unos minutos.", 429);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiError("Datos de verificación inválidos.", 400);
  }

  const { email, code } = parsed.data;

  if (!isEmailAllowed(email)) {
    return apiError("El código ingresado no es correcto.", 401);
  }

  const result = await verifyMagicLinkCode(email, code);
  if (!result.ok) {
    return apiError(REASON_MESSAGES[result.reason] ?? "No se pudo verificar el código.", 401);
  }

  const token = await createSessionToken({ email, role: "admin" });
  const env = getEnv();

  const response = apiOk({ email });
  response.cookies.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  log.info({ email }, "Sesión admin iniciada");
  return response;
}
