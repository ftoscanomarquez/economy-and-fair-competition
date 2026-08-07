import { z } from "zod";

/**
 * Taxonomía fija de categorías (no texto libre) — compartida entre
 * Artículos y Notas, formalizada a partir de las categorías ya usadas en
 * content/seeds/posts.ts.
 */
export const POST_CATEGORIES = [
  "comercio-exterior",
  "defensa-comercial",
  "cumplimiento-aduanero",
  "propiedad-intelectual",
  "litigio-internacional",
] as const;

export const postCategorySchema = z.enum(POST_CATEGORIES);
export type PostCategory = z.infer<typeof postCategorySchema>;

export const CATEGORY_LABELS: Record<PostCategory, { es: string; en: string }> = {
  "comercio-exterior": { es: "Comercio Exterior", en: "Foreign Trade" },
  "defensa-comercial": { es: "Defensa Comercial", en: "Trade Defense" },
  "cumplimiento-aduanero": { es: "Cumplimiento Aduanero", en: "Customs Compliance" },
  "propiedad-intelectual": { es: "Propiedad Intelectual", en: "Intellectual Property" },
  "litigio-internacional": { es: "Litigio Internacional", en: "International Litigation" },
};

export const postTypeSchema = z.enum(["articulo", "nota"]);
export type PostType = z.infer<typeof postTypeSchema>;

export const POST_TYPE_LABELS: Record<PostType, { es: string; en: string }> = {
  articulo: { es: "Artículo", en: "Article" },
  nota: { es: "Nota", en: "Note" },
};
