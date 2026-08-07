import { test, expect } from "@playwright/test";
import path from "node:path";

// Reutiliza la sesión admin generada por auth.setup.ts.
test.use({ storageState: path.resolve(__dirname, ".auth/admin.json") });

const TEMPLATE_NAME = `Plantilla E2E ${Date.now()}`;
const POST_SLUG = `prueba-e2e-${Date.now()}`;

test.describe.serial("Plantillas y publicaciones con bloques", () => {
  test("crear una plantilla con bloques hero + richtext + chart", async ({ page }) => {
    await page.goto("/es/admin/templates/new");

    await page.fill("#template-name", TEMPLATE_NAME);
    await page.getByRole("button", { name: "Encabezado con imagen" }).click();
    await page.getByRole("button", { name: "Texto enriquecido (Markdown)" }).click();
    await page.getByRole("button", { name: "Tabla con gráfica" }).click();

    await page.getByRole("button", { name: "Crear plantilla" }).click();
    await expect(page).toHaveURL(/\/admin\/templates$/);
    await expect(page.getByText(TEMPLATE_NAME)).toBeVisible();
  });

  test("crear y publicar un post usando la plantilla, con gráfica de barras", async ({ page }) => {
    await page.goto("/es/admin/posts/new");

    await page.selectOption("#template", { label: TEMPLATE_NAME });
    await page.fill("#slug", POST_SLUG);
    await page.fill("#titleEs", "Prueba E2E de plantilla con gráfica");
    await page.fill("#titleEn", "E2E template test with chart");

    await page.getByPlaceholder("Título grande al inicio del artículo").fill("Título de impacto E2E");
    await page
      .getByPlaceholder(/Escribe o pega el texto del bloque/i)
      .fill("## Sección\n\nContenido de **prueba** E2E.");

    const addRow = page.getByRole("button", { name: /Agregar fila/i });
    await addRow.click();
    await addRow.click();
    const labels = page.getByPlaceholder("Etiqueta (ej. 2023)");
    const values = page.getByPlaceholder("Valor");
    await labels.nth(0).fill("2024");
    await values.nth(0).fill("100");
    await labels.nth(1).fill("2025");
    await values.nth(1).fill("150");

    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page).toHaveURL(/\/admin\/posts$/);
  });

  test("la página pública de detalle renderiza el título, el markdown y la gráfica", async ({ page }) => {
    await page.goto(`/es/articulos-y-notas/${POST_SLUG}`);

    await expect(page.getByRole("heading", { name: "Prueba E2E de plantilla con gráfica" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Título de impacto E2E" })).toBeVisible();
    await expect(page.getByText("Sección")).toBeVisible();
    // recharts renderiza un <svg> dentro del contenedor de la gráfica
    await expect(page.locator(".recharts-wrapper svg")).toBeVisible();
  });

  test("el post aparece en el listado público; limpieza vía el drawer de gestión", async ({ page }) => {
    await page.goto("/es/articulos-y-notas");
    await expect(page.getByText("Prueba E2E de plantilla con gráfica")).toBeVisible();

    // El botón de eliminar posts vive en el drawer de gestión (barra admin > "Gestión"),
    // no en /admin/posts (que solo lista y enlaza a editar). editMode es estado de
    // React en memoria (no persiste entre navegaciones), así que hay que activarlo
    // explícitamente tras el goto en vez de asumir que quedó activo de un test previo.
    await page.goto("/es");
    await page.getByRole("button", { name: "Editar contenido" }).click();
    await page.getByRole("button", { name: "Gestión" }).click();

    page.once("dialog", (dialog) => dialog.accept());
    const postRow = page.locator("li").filter({ hasText: "Prueba E2E de plantilla con gráfica" });
    await postRow.getByRole("button", { name: /Eliminar/i }).click();
    await page.waitForTimeout(500);

    // La plantilla queda libre para borrarse una vez el post que la usaba ya no existe.
    await page.goto("/es/admin/templates");
    const templateRow = page.locator("a").filter({ hasText: TEMPLATE_NAME });
    await templateRow.click();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Eliminar plantilla" }).click();
    await expect(page).toHaveURL(/\/admin\/templates$/);
    await expect(page.getByText(TEMPLATE_NAME)).toHaveCount(0);
  });
});
