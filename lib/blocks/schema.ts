/**
 * Fuente de verdad del sistema de plantillas/bloques (ver AGENTS.md §10 y
 * SPECIFICATION-SUMMARY.md §1 "¿dónde está...?").
 *
 * Usado por:
 * - Editor de plantillas admin (components/admin/template-*.tsx): arma la
 *   secuencia de TemplateBlock (sin contenido).
 * - Editor de posts admin (app/[locale]/admin/posts/*, Fase 7C): llena cada
 *   bloque con ContentBlock real, uno por idioma (post.blocksEs/blocksEn).
 * - Renderizado público (components/marketing/blocks/*, Fase 7D): lee
 *   ContentBlock[] y pinta cada tipo con su componente correspondiente.
 * - Servidor MCP (app/api/mcp/route.ts, Fase 7F): recibe/genera ContentBlock[]
 *   al crear un post desde WhatsApp (texto directo o extraído de PDF/URL).
 */
import { z } from "zod";

export const CHART_TYPES = ["bar", "line", "pie"] as const;
export const chartTypeSchema = z.enum(CHART_TYPES);
export type ChartType = z.infer<typeof chartTypeSchema>;

export const chartDataRowSchema = z.object({
  label: z.string().min(1),
  value: z.number(),
});
export type ChartDataRow = z.infer<typeof chartDataRowSchema>;

/**
 * Un bloque de plantilla no lleva contenido (solo su tipo); un bloque de
 * post lleva el tipo + el contenido real en ese idioma. Ambos comparten el
 * discriminante `type`.
 */
export const blockTypeSchema = z.enum(["hero", "richtext", "twoColumn", "chart"]);
export type BlockType = z.infer<typeof blockTypeSchema>;

// --- Bloques de PLANTILLA (esqueleto, sin contenido) -----------------------

export const templateBlockSchema = z.object({
  id: z.string().min(1),
  type: blockTypeSchema,
});
export type TemplateBlock = z.infer<typeof templateBlockSchema>;

// --- Bloques de CONTENIDO (post concreto, un idioma) ------------------------

export const heroBlockContentSchema = z.object({
  id: z.string().min(1),
  type: z.literal("hero"),
  title: z.string().default(""),
  imageUrl: z.string().nullable().default(null),
});

export const richTextBlockContentSchema = z.object({
  id: z.string().min(1),
  type: z.literal("richtext"),
  markdown: z.string().default(""),
});

export const twoColumnBlockContentSchema = z.object({
  id: z.string().min(1),
  type: z.literal("twoColumn"),
  markdown: z.string().default(""),
  imageUrl: z.string().nullable().default(null),
  imagePosition: z.enum(["left", "right"]).default("right"),
});

export const chartBlockContentSchema = z.object({
  id: z.string().min(1),
  type: z.literal("chart"),
  title: z.string().default(""),
  chartType: chartTypeSchema.default("bar"),
  data: z.array(chartDataRowSchema).default([]),
});

export const contentBlockSchema = z.discriminatedUnion("type", [
  heroBlockContentSchema,
  richTextBlockContentSchema,
  twoColumnBlockContentSchema,
  chartBlockContentSchema,
]);

export type HeroBlockContent = z.infer<typeof heroBlockContentSchema>;
export type RichTextBlockContent = z.infer<typeof richTextBlockContentSchema>;
export type TwoColumnBlockContent = z.infer<typeof twoColumnBlockContentSchema>;
export type ChartBlockContent = z.infer<typeof chartBlockContentSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;

export function emptyBlockContent(id: string, type: BlockType): ContentBlock {
  switch (type) {
    case "hero":
      return { id, type: "hero", title: "", imageUrl: null };
    case "richtext":
      return { id, type: "richtext", markdown: "" };
    case "twoColumn":
      return { id, type: "twoColumn", markdown: "", imageUrl: null, imagePosition: "right" };
    case "chart":
      return { id, type: "chart", title: "", chartType: "bar", data: [] };
  }
}

export const BLOCK_TYPE_LABELS: Record<BlockType, { es: string; en: string }> = {
  hero: { es: "Encabezado con imagen", en: "Hero with image" },
  richtext: { es: "Texto enriquecido (Markdown)", en: "Rich text (Markdown)" },
  twoColumn: { es: "Dos columnas (texto + imagen)", en: "Two columns (text + image)" },
  chart: { es: "Tabla con gráfica", en: "Table with chart" },
};
