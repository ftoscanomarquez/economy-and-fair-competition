/**
 * Migración única: convierte las 24 claves fijas de expertise/services/
 * industries que vivían en site_texts (ej. "expertise.a.title",
 * "services.3.body") en documentos de la nueva colección content_items,
 * que sí permite agregar/eliminar items libremente desde el admin. Se
 * ejecuta una sola vez; correrla de nuevo sobre una colección ya migrada no
 * duplica (usa upsert por section+order).
 */
import { getDb, getMongoClient } from "../lib/db";
import { childLogger } from "../lib/logger";
import type { ContentSection } from "../lib/content-items";

const log = childLogger("migrate-content-items");

async function getText(db: Awaited<ReturnType<typeof getDb>>, key: string): Promise<{ es: string; en: string }> {
  const doc = await db.collection("site_texts").findOne({ key });
  return { es: doc?.es ?? "", en: doc?.en ?? "" };
}

async function run() {
  const db = await getDb();

  const expertiseKeys = ["a", "b", "c", "d"];
  const industriesKeys = [
    "automotive",
    "energy",
    "mining",
    "textile",
    "electronics",
    "pharma",
    "manufacturing",
    "food",
    "logistics",
    "maritime",
  ];
  const serviceIndexes = Array.from({ length: 10 }, (_, i) => i + 1);

  let migrated = 0;

  async function upsertItem(
    section: ContentSection,
    order: number,
    titleEs: string,
    titleEn: string,
    summaryEs: string,
    summaryEn: string,
    detailEs: string,
    detailEn: string,
    imageEs: string,
    imageEn: string
  ) {
    const now = new Date();
    await db.collection("content_items").updateOne(
      { section, order },
      {
        $set: {
          titleEs,
          titleEn,
          summaryEs,
          summaryEn,
          detailEs,
          detailEn,
          imageUrl: imageEs || imageEn || "/uploads/home/home-hero-default.png",
          updatedAt: now,
        },
        $setOnInsert: { section, order, createdAt: now },
      },
      { upsert: true }
    );
    migrated += 1;
  }

  for (let i = 0; i < expertiseKeys.length; i++) {
    const key = expertiseKeys[i];
    const title = await getText(db, `expertise.${key}.title`);
    const summary = await getText(db, `expertise.${key}.summary`);
    const detail = await getText(db, `expertise.${key}.detail`);
    const image = await getText(db, `expertise.${key}.image`);
    await upsertItem("expertise", i, title.es, title.en, summary.es, summary.en, detail.es, detail.en, image.es, image.en);
  }

  for (const n of serviceIndexes) {
    const title = await getText(db, `services.${n}.title`);
    const body = await getText(db, `services.${n}.body`);
    const detail = await getText(db, `services.${n}.detail`);
    const image = await getText(db, `services.${n}.image`);
    await upsertItem("services", n - 1, title.es, title.en, body.es, body.en, detail.es, detail.en, image.es, image.en);
  }

  for (let i = 0; i < industriesKeys.length; i++) {
    const key = industriesKeys[i];
    const name = await getText(db, `industries.${key}.name`);
    const detail = await getText(db, `industries.${key}.detail`);
    const image = await getText(db, `industries.${key}.image`);
    // industries no tenía "summary" independiente — se usa el detail truncado como resumen de tarjeta.
    const summaryEs = detail.es.length > 140 ? `${detail.es.slice(0, 137)}...` : detail.es;
    const summaryEn = detail.en.length > 140 ? `${detail.en.slice(0, 137)}...` : detail.en;
    await upsertItem("industries", i, name.es, name.en, summaryEs, summaryEn, detail.es, detail.en, image.es, image.en);
  }

  log.info({ migrated }, "Migración de content_items completada");
}

run()
  .then(async () => {
    const client = await getMongoClient();
    await client.close();
    process.exit(0);
  })
  .catch((error) => {
    log.error({ error }, "Fallo en migración de content_items");
    process.exit(1);
  });
