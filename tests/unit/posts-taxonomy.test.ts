import { describe, it, expect } from "vitest";
import {
  POST_CATEGORIES,
  postCategorySchema,
  CATEGORY_LABELS,
  postTypeSchema,
  POST_TYPE_LABELS,
} from "@/lib/posts-taxonomy";

describe("postCategorySchema", () => {
  it("acepta cada categoría de la lista fija", () => {
    for (const category of POST_CATEGORIES) {
      expect(postCategorySchema.safeParse(category).success).toBe(true);
    }
  });

  it("rechaza una categoría de texto libre no perteneciente al enum", () => {
    expect(postCategorySchema.safeParse("categoria-inventada").success).toBe(false);
  });

  it("tiene etiquetas ES/EN para cada categoría", () => {
    for (const category of POST_CATEGORIES) {
      expect(CATEGORY_LABELS[category].es).toBeTruthy();
      expect(CATEGORY_LABELS[category].en).toBeTruthy();
    }
  });
});

describe("postTypeSchema", () => {
  it("acepta 'articulo' y 'nota'", () => {
    expect(postTypeSchema.safeParse("articulo").success).toBe(true);
    expect(postTypeSchema.safeParse("nota").success).toBe(true);
  });

  it("rechaza cualquier otro valor", () => {
    expect(postTypeSchema.safeParse("noticia").success).toBe(false);
  });

  it("tiene etiquetas ES/EN para ambos tipos", () => {
    expect(POST_TYPE_LABELS.articulo.es).toBe("Artículo");
    expect(POST_TYPE_LABELS.nota.es).toBe("Nota");
  });
});
