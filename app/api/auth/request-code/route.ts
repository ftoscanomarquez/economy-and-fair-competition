import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isEmailAllowed, issueMagicLinkCode } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:auth:request-code");

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`auth:request-code:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return apiError("Demasiados intentos. Intente de nuevo en unos minutos.", 429);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiError("Correo electrónico inválido.", 400);
  }

  const { email } = parsed.data;

  // Respuesta idéntica exista o no el correo, para no filtrar qué cuentas son admin.
  if (!isEmailAllowed(email)) {
    log.warn({ email }, "Solicitud de código para correo no autorizado");
    return apiOk({ sent: true });
  }

  const code = await issueMagicLinkCode(email);

  await sendEmail({
    to: email,
    subject: "Tu código de acceso — Economy and Fair Competition",
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <p>Tu código de acceso de un solo uso es:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.1em;">${code}</p>
        <p>Este código expira en 10 minutos. Si no solicitaste este acceso, ignora este correo.</p>
      </div>
    `,
  });

  return apiOk({ sent: true });
}
