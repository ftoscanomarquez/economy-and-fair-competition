import { getDb } from "./db";
import type { Locale } from "./i18n";
import { childLogger } from "./logger";

export { t } from "./content-client";

const log = childLogger("content");

export type SiteTextDoc = {
  key: string;
  es: string;
  en: string;
  updatedAt: Date;
  updatedBy: string | null;
};

/**
 * Devuelve todos los site_texts como { key: string } resuelto al locale
 * pedido. Server Components leen directamente de aquí (regla de
 * arquitectura: Server Components consumen datos, Client Components llaman
 * a /api/*).
 */
export async function getSiteTexts(locale: Locale): Promise<Record<string, string>> {
  const db = await getDb();
  const docs = await db.collection<SiteTextDoc>("site_texts").find({}).toArray();

  if (docs.length === 0) {
    log.warn("site_texts está vacío — ¿se ejecutó npm run seed:config?");
  }

  const map: Record<string, string> = {};
  for (const doc of docs) {
    map[doc.key] = locale === "en" ? doc.en : doc.es;
  }
  return map;
}
