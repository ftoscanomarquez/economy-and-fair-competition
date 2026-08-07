import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Autenticación admin (magic link)", () => {
  test("acceso sin sesión a /admin redirige a /admin/login", async ({ page }) => {
    await page.goto("/es/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("login completo con código de Mailpit deja una sesión activa", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/es\/admin$/);
    await expect(page.getByText(/Bienvenido/)).toBeVisible();
  });

  test("código incorrecto muestra un error y no otorga sesión", async ({ page }) => {
    await page.goto("/es/admin/login");
    await page.fill("#email", "admin@economyandfaircompetition.com");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.fill("#code", "000000");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Código incorrecto", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("logout limpia la sesión y vuelve a exigir login", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/es");
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page.waitForTimeout(500);

    await page.goto("/es/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
