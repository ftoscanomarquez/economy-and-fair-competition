import type { ContentBlock } from "../../lib/blocks/schema";
import type { PostCategory, PostType } from "../../lib/posts-taxonomy";

/**
 * Posts de ejemplo para entorno de desarrollo. Contenido de prueba realista
 * (temas plausibles de comercio exterior/aduanas/PI), NO se presenta como
 * hecho real: son artículos de muestra para validar el flujo de Artículos y
 * Notas antes de que la firma publique contenido genuino.
 */

export type PostSeed = {
  slug: string;
  postType: PostType;
  category: PostCategory;
  tags: string[];
  titleEs: string;
  titleEn: string;
  summaryEs: string;
  summaryEn: string;
  blocksEs: ContentBlock[];
  blocksEn: ContentBlock[];
  status: "published";
  publishedAt: Date;
  externalUrl?: string;
  pdfUrl?: string;
};

function sampleBlocks(bodyEs: string, bodyEn: string): { blocksEs: ContentBlock[]; blocksEn: ContentBlock[] } {
  return {
    blocksEs: [{ id: "body", type: "richtext", markdown: bodyEs }],
    blocksEn: [{ id: "body", type: "richtext", markdown: bodyEn }],
  };
}

const sampleEs =
  "Contenido de muestra (entorno de desarrollo). Este artículo ilustra el formato editorial de Artículos y Notas: resumen ejecutivo, cuerpo estructurado en Markdown y llamada a la acción hacia contacto directo con la firma.";
const sampleEn =
  "Sample content (development environment). This article illustrates the editorial format of Articles & Notes: executive summary, Markdown-structured body, and a call to action toward direct contact with the firm.";

export const postSeeds: PostSeed[] = [
  {
    slug: "actualizacion-reglas-origen-t-mec",
    postType: "articulo",
    category: "comercio-exterior",
    tags: ["T-MEC", "reglas de origen"],
    titleEs: "Actualización en reglas de origen bajo el T-MEC: qué deben revisar las empresas exportadoras",
    titleEn: "USMCA rules-of-origin update: what exporting companies should review",
    summaryEs: "Un resumen ejecutivo de los criterios de origen regional que con mayor frecuencia generan observaciones en auditorías aduaneras recientes.",
    summaryEn: "An executive summary of the regional origin criteria most frequently flagged in recent customs audits.",
    ...sampleBlocks(sampleEs, sampleEn),
    status: "published",
    publishedAt: new Date("2026-06-02"),
  },
  {
    slug: "practicas-desleales-discriminacion-precios",
    postType: "articulo",
    category: "defensa-comercial",
    tags: ["antidumping", "prácticas desleales"],
    titleEs: "Prácticas desleales de comercio internacional: discriminación de precios en investigaciones recientes",
    titleEn: "Unfair international trade practices: price discrimination in recent investigations",
    summaryEs: "Panorama de criterios técnicos aplicados en procedimientos antidumping ante la Secretaría de Economía.",
    summaryEn: "Overview of technical criteria applied in antidumping proceedings before the Ministry of Economy.",
    ...sampleBlocks(sampleEs, sampleEn),
    status: "published",
    publishedAt: new Date("2026-05-14"),
  },
  {
    slug: "programas-immex-prosec-actualizacion",
    postType: "nota",
    category: "cumplimiento-aduanero",
    tags: ["IMMEX", "PROSEC"],
    titleEs: "IMMEX y PROSEC: puntos de atención en la administración de programas de fomento",
    titleEn: "IMMEX and PROSEC: key considerations in managing trade promotion programs",
    summaryEs: "Consideraciones prácticas para mantener el cumplimiento normativo de programas de fomento a las exportaciones.",
    summaryEn: "Practical considerations for maintaining regulatory compliance of export promotion programs.",
    ...sampleBlocks(sampleEs, sampleEn),
    status: "published",
    publishedAt: new Date("2026-04-28"),
  },
  {
    slug: "propiedad-industrial-comercio-internacional",
    postType: "articulo",
    category: "propiedad-intelectual",
    tags: ["marcas", "propiedad industrial"],
    titleEs: "Propiedad industrial en operaciones de comercio internacional: protección estratégica de marcas",
    titleEn: "Industrial property in international trade operations: strategic trademark protection",
    summaryEs: "Cómo integrar la protección de activos de propiedad industrial a la estrategia de expansión internacional.",
    summaryEn: "How to integrate industrial property protection into an international expansion strategy.",
    ...sampleBlocks(sampleEs, sampleEn),
    status: "published",
    publishedAt: new Date("2026-04-10"),
  },
  {
    slug: "auditorias-aduaneras-preventivas-guia",
    postType: "nota",
    category: "cumplimiento-aduanero",
    tags: ["auditorías", "prevención"],
    titleEs: "Auditorías aduaneras preventivas: una guía para anticipar contingencias",
    titleEn: "Preventive customs audits: a guide to anticipating contingencies",
    summaryEs: "Elementos clave que una auditoría preventiva debe cubrir antes de una revisión formal de la autoridad.",
    summaryEn: "Key elements a preventive audit should cover before a formal authority review.",
    ...sampleBlocks(sampleEs, sampleEn),
    status: "published",
    publishedAt: new Date("2026-03-22"),
  },
  {
    slug: "controversias-omc-perspectiva-institucional",
    postType: "articulo",
    category: "litigio-internacional",
    tags: ["OMC", "controversias"],
    titleEs: "Mecanismos de solución de controversias de la OMC: una perspectiva institucional",
    titleEn: "WTO dispute settlement mechanisms: an institutional perspective",
    summaryEs: "Lecciones de la participación institucional de la firma en paneles internacionales de resolución de disputas.",
    summaryEn: "Lessons from the firm's institutional participation in international dispute resolution panels.",
    ...sampleBlocks(sampleEs, sampleEn),
    status: "published",
    publishedAt: new Date("2026-03-05"),
  },
];
