import { test as setup } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";
import path from "node:path";

/**
 * Playwright "setup project": inicia sesión admin UNA sola vez y guarda la
 * cookie en disco. El resto de los specs que necesitan sesión admin cargan
 * este storageState en vez de repetir el flujo de magic link — evita agotar
 * el rate limit de /api/auth/request-code (5/min por IP) al correr la suite
 * completa, y hace la suite más rápida.
 */
const authFile = path.resolve(__dirname, ".auth/admin.json");

setup("autenticar como admin", async ({ page }) => {
  await loginAsAdmin(page);
  await page.context().storageState({ path: authFile });
});
