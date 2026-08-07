/**
 * Constantes/tipos de content_items sin dependencias de servidor (sin
 * mongodb/lib/db), para poder importarse tanto desde código server-only
 * (lib/content-items.ts, que las re-exporta) como desde componentes
 * "use client" (ej. components/marketing/detail-dialog.tsx) sin arrastrar
 * el driver de Mongo al bundle del navegador.
 */
export const CONTENT_SECTIONS = ["expertise", "services", "industries"] as const;
export type ContentSection = (typeof CONTENT_SECTIONS)[number];

export const SECTION_LABELS: Record<ContentSection, { es: string; en: string }> = {
  expertise: { es: "Áreas de Especialización", en: "Areas of Expertise" },
  services: { es: "Servicios", en: "Services" },
  industries: { es: "Industrias", en: "Industries" },
};

/** Subcarpeta de public/uploads (ver lib/uploads.ts IMAGE_FOLDERS) donde se guardan las imágenes de cada sección. */
export const SECTION_UPLOAD_FOLDER: Record<ContentSection, string> = {
  expertise: "especializacion",
  services: "servicios",
  industries: "industrias",
};
