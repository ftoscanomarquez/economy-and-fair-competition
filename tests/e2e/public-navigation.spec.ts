import { test, expect } from "@playwright/test";

// La negociación de "/" → "/es" o "/en" depende del header Accept-Language
// real del navegador (next-intl, ver proxy.ts) — se fija explícitamente
// "es-MX" aquí para que la prueba no dependa del idioma configurado en la
// máquina que ejecuta la suite.
test.use({ locale: "es-MX", extraHTTPHeaders: { "Accept-Language": "es-MX,es;q=0.9" } });

test.describe("Navegación pública ES/EN", () => {
  test("la raíz redirige a /es cuando el navegador prefiere español", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/es$/);
  });

  test("el nav y el contenido cambian de idioma al navegar a /en", async ({ page }) => {
    await page.goto("/es");
    await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Inicio" })).toBeVisible();

    await page.goto("/en");
    const mainNav = page.getByRole("navigation", { name: "Principal" });
    await expect(mainNav.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(mainNav.getByRole("link", { name: "About Us" })).toBeVisible();
  });

  test("el selector de idioma del header navega correctamente", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("link", { name: /Switch to English/i }).click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test("las páginas institucionales principales responden 200", async ({ page }) => {
    for (const path of ["/es", "/es/quienes-somos", "/es/servicios", "/es/articulos-y-notas", "/es/contacto"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    }
  });

  test("no hay claves de contenido sin resolver ([[...]]) en la Home", async ({ page }) => {
    await page.goto("/es");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\[\[[a-z0-9.]+\]\]/);
  });
});
