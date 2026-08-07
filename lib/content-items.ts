/**
 * Items administrables de las 3 grillas con modal de la landing pública:
 * Áreas de Especialización, Servicios e Industrias. A diferencia del resto
 * del contenido institucional (site_texts, claves fijas), estas 3 secciones
 * necesitan que el admin pueda agregar y eliminar items libremente — por
 * eso viven en su propia colección Mongo (`content_items`) con un documento
 * por item, en vez de claves numeradas fijas.
 *
 * El eyebrow/título/subtítulo de cada sección (ej. "expertise.eyebrow") NO
 * vive aquí — sigue en site_texts vía EditableText, porque es un texto único
 * por sección, no un item de la lista.
 *
 * Usado por:
 *  - components/marketing/{expertise-areas,services-grid,industries-carousel}.tsx
 *    (lectura pública, vía listContentItems en el Server Component padre).
 *  - app/admin/content/[section]/* (CRUD completo desde el panel admin).
 */
import { ObjectId } from "mongodb";
import { getDb } from "./db";
import type { Locale } from "./i18n";

export { CONTENT_SECTIONS, SECTION_LABELS, SECTION_UPLOAD_FOLDER, type ContentSection } from "./content-items-shared";
import type { ContentSection } from "./content-items-shared";

export type ContentItemDoc = {
  _id?: ObjectId;
  section: ContentSection;
  order: number;
  titleEs: string;
  titleEn: string;
  summaryEs: string;
  summaryEn: string;
  detailEs: string;
  detailEn: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentItemSummary = {
  id: string;
  section: ContentSection;
  order: number;
  title: string;
  summary: string;
  detail: string;
  imageUrl: string | null;
};

/** Ambos idiomas a la vez — usado por el panel admin para editar cada campo por separado (a diferencia de ContentItemSummary, resuelta a un solo locale para la lectura pública). */
export type ContentItemBilingual = {
  id: string;
  section: ContentSection;
  order: number;
  titleEs: string;
  titleEn: string;
  summaryEs: string;
  summaryEn: string;
  detailEs: string;
  detailEn: string;
  imageUrl: string | null;
};

function toSummary(doc: ContentItemDoc, locale: Locale): ContentItemSummary {
  return {
    id: String(doc._id),
    section: doc.section,
    order: doc.order,
    title: locale === "en" ? doc.titleEn : doc.titleEs,
    summary: locale === "en" ? doc.summaryEn : doc.summaryEs,
    detail: locale === "en" ? doc.detailEn : doc.detailEs,
    imageUrl: doc.imageUrl,
  };
}

function toBilingual(doc: ContentItemDoc): ContentItemBilingual {
  return {
    id: String(doc._id),
    section: doc.section,
    order: doc.order,
    titleEs: doc.titleEs,
    titleEn: doc.titleEn,
    summaryEs: doc.summaryEs,
    summaryEn: doc.summaryEn,
    detailEs: doc.detailEs,
    detailEn: doc.detailEn,
    imageUrl: doc.imageUrl,
  };
}

export async function listContentItems(section: ContentSection, locale: Locale): Promise<ContentItemSummary[]> {
  const db = await getDb();
  const docs = await db
    .collection<ContentItemDoc>("content_items")
    .find({ section })
    .sort({ order: 1 })
    .toArray();
  return docs.map((doc) => toSummary(doc, locale));
}

export async function listContentItemsBilingual(section: ContentSection): Promise<ContentItemBilingual[]> {
  const db = await getDb();
  const docs = await db
    .collection<ContentItemDoc>("content_items")
    .find({ section })
    .sort({ order: 1 })
    .toArray();
  return docs.map(toBilingual);
}

export type ContentItemInput = {
  titleEs: string;
  titleEn: string;
  summaryEs: string;
  summaryEn: string;
  detailEs: string;
  detailEn: string;
  imageUrl: string | null;
};

export async function createContentItem(section: ContentSection, input: ContentItemInput): Promise<string> {
  const db = await getDb();
  const coll = db.collection<ContentItemDoc>("content_items");

  const last = await coll.find({ section }).sort({ order: -1 }).limit(1).toArray();
  const nextOrder = (last[0]?.order ?? -1) + 1;

  const now = new Date();
  const result = await coll.insertOne({
    section,
    order: nextOrder,
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return String(result.insertedId);
}

export async function updateContentItem(id: string, input: Partial<ContentItemInput>): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .collection<ContentItemDoc>("content_items")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...input, updatedAt: new Date() } });
  return result.matchedCount > 0;
}

export async function deleteContentItem(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection("content_items").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

/** Reordena todos los items de una sección según el arreglo de ids dado (nuevo índice = posición en el arreglo). */
export async function reorderContentItems(section: ContentSection, orderedIds: string[]): Promise<void> {
  const db = await getDb();
  const coll = db.collection<ContentItemDoc>("content_items");
  await Promise.all(
    orderedIds.map((id, index) =>
      coll.updateOne({ _id: new ObjectId(id), section }, { $set: { order: index, updatedAt: new Date() } })
    )
  );
}
