/**
 * Autorización del servidor MCP privado (app/api/mcp/route.ts). Dos
 * mecanismos aceptados para el header `Authorization: Bearer <token>`:
 *   1. El secreto de webhook fijo (MCP_WEBHOOK_SECRET) — pensado para el
 *      integrador de WhatsApp (Meta Cloud API / Twilio), un solo valor
 *      compartido configurado una vez.
 *   2. Un JWT de sesión admin real (el mismo que emite /api/auth/verify-code
 *      y valida el resto del panel /admin) — pensado para que un admin
 *      autenticado pueda invocar el MCP directamente (ej. desde un script o
 *      un cliente MCP propio) sin depender del secreto estático compartido.
 * Cualquiera de los dos autentica el transporte; para mutaciones
 * (update_post/delete_post) además se exige que el número de teléfono del
 * remitente esté en la lista blanca MCP_ADMIN_PHONES — igual que
 * ADMIN_ALLOWED_EMAILS protege el login web, pero para el canal WhatsApp.
 */
import { getEnv, getMcpAdminPhones } from "./env";
import { verifySessionToken } from "./auth";

export function isValidWebhookSecret(providedSecret: string | null): boolean {
  const env = getEnv();
  if (!env.MCP_WEBHOOK_SECRET) return false;
  if (!providedSecret) return false;
  return providedSecret === env.MCP_WEBHOOK_SECRET;
}

/**
 * Acepta el secreto de webhook fijo O un JWT de sesión admin válido.
 * Devuelve el email del admin cuando la autenticación fue vía JWT (para
 * registrar en logs quién invocó el MCP), o null si fue vía secreto fijo.
 */
export async function verifyMcpAuthorization(
  providedToken: string | null
): Promise<{ authorized: boolean; adminEmail: string | null }> {
  if (!providedToken) return { authorized: false, adminEmail: null };

  if (isValidWebhookSecret(providedToken)) {
    return { authorized: true, adminEmail: null };
  }

  const session = await verifySessionToken(providedToken);
  if (session) {
    return { authorized: true, adminEmail: session.email };
  }

  return { authorized: false, adminEmail: null };
}

export function isAuthorizedAdminPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  return getMcpAdminPhones().includes(phone.trim());
}
