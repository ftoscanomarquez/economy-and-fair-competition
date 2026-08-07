/**
 * Helper compartido para leer el código de 6 dígitos del magic link desde
 * la API de Mailpit (contenedor compartido magic-link-mailpit, credenciales
 * admin/magiclink123 — ver QUICK-START.md).
 */
const MAILPIT_AUTH = Buffer.from("admin:magiclink123").toString("base64");
const MAILPIT_URL = "http://localhost:8025";

export async function getLatestMagicLinkCode(): Promise<string> {
  const res = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=1`, {
    headers: { Authorization: `Basic ${MAILPIT_AUTH}` },
  });
  const data = await res.json();
  const messageId = data.messages[0]?.ID;
  if (!messageId) throw new Error("No se encontró ningún mensaje en Mailpit.");

  const msgRes = await fetch(`${MAILPIT_URL}/api/v1/message/${messageId}`, {
    headers: { Authorization: `Basic ${MAILPIT_AUTH}` },
  });
  const msg = await msgRes.json();
  const match = msg.Text.match(/\b(\d{6})\b/);
  if (!match) throw new Error("No se encontró un código de 6 dígitos en el último correo de Mailpit.");
  return match[1];
}
