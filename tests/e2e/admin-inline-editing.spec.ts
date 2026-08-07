import { test, expect } from "@playwright/test";
import path from "node:path";

// Reutiliza la sesión admin generada por auth.setup.ts (evita repetir el
// flujo de magic link y agotar el rate limit de request-code).
test.use({ storageState: path.resolve(__dirname, ".auth/admin.json") });

test.describe("Edición en vivo de textos institucionales", () => {
  test("editar y restaurar el eyebrow del hero persiste en la base de datos", async ({ page }) => {
    await page.goto("/es");

    await page.getByRole("button", { name: "Editar contenido" }).click();
    await expect(page.getByRole("button", { name: "Salir de edición" })).toBeVisible();

    const eyebrow = page.locator('[role="textbox"][aria-label*="home.hero.eyebrow"]');
    const original = (await eyebrow.textContent())?.trim() ?? "";

    await eyebrow.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type("VALOR DE PRUEBA E2E");
    await eyebrow.blur();

    // El toast de Radix se auto-descarta a los 5000ms; se verifica con un
    // timeout menor a ese margen para no competir con su propio dismiss.
    await expect(page.getByText("Guardado", { exact: true })).toBeVisible({ timeout: 2000 });

    // Confirmar persistencia real: recargar sin modo edición y verificar el texto en el HTML servido.
    await page.reload();
    await expect(page.getByText("VALOR DE PRUEBA E2E")).toBeVisible();

    // Restaurar el valor original para no dejar datos de prueba en el sitio.
    await page.getByRole("button", { name: "Editar contenido" }).click();
    const eyebrowAgain = page.locator('[role="textbox"][aria-label*="home.hero.eyebrow"]');
    await eyebrowAgain.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(original);
    await eyebrowAgain.blur();
    // El toast de Radix se auto-descarta a los 5000ms; se verifica con un
    // timeout menor a ese margen para no competir con su propio dismiss.
    await expect(page.getByText("Guardado", { exact: true })).toBeVisible({ timeout: 2000 });
  });

  test("el selector de idioma del toolbar admin navega y traduce la página", async ({ page }) => {
    await page.goto("/es");

    await page.locator("div.bg-ink").getByRole("button", { name: "en", exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  });
});
