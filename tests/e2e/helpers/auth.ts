import type { Page } from "@playwright/test";
import { getLatestMagicLinkCode } from "./mailpit";

const ADMIN_EMAIL = "admin@economyandfaircompetition.com";

/**
 * Ejecuta el flujo completo de login admin (magic link vía Mailpit) y deja
 * la página en /es/admin, con la cookie de sesión ya establecida.
 */
export async function loginAsAdmin(page: Page) {
  await page.goto("/es/admin/login");
  await page.fill("#email", ADMIN_EMAIL);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500); // margen para que el correo llegue a Mailpit
  const code = await getLatestMagicLinkCode();
  await page.fill("#code", code);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin$/);
}
