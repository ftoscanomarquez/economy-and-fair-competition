/**
 * Siembra la colección content_items (Especialización/Servicios/Industrias)
 * con el contenido real de arranque (content/seeds/content-items.ts), en vez
 * de dejar la colección vacía o depender de la migración legacy desde
 * site_texts (scripts/migrate-content-items.ts, que solo tenía placeholders
 * genéricos). Upsert por section+order: correrlo de nuevo sobre datos ya
 * sembrados actualiza el contenido a la última versión exportada, sin
 * duplicar documentos.
 */
import { getDb, getMongoClient } from "../lib/db";
import { childLogger } from "../lib/logger";
import { contentItemSeeds } from "../content/seeds/content-items";

const log = childLogger("seed-content-items");

async function run() {
  const db = await getDb();
  const coll = db.collection("content_items");

  let inserted = 0;
  let updated = 0;

  for (const seed of contentItemSeeds) {
    const now = new Date();
    const result = await coll.updateOne(
      { section: seed.section, order: seed.order },
      {
        $set: {
          titleEs: seed.titleEs,
          titleEn: seed.titleEn,
          summaryEs: seed.summaryEs,
          summaryEn: seed.summaryEn,
          detailEs: seed.detailEs,
          detailEn: seed.detailEn,
          imageUrl: seed.imageUrl,
          updatedAt: now,
        },
        $setOnInsert: { section: seed.section, order: seed.order, createdAt: now },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) inserted += 1;
    else if (result.modifiedCount > 0) updated += 1;
  }

  log.info({ inserted, updated, total: contentItemSeeds.length }, "Seed de content_items completada");
}

run()
  .then(async () => {
    const client = await getMongoClient();
    await client.close();
    process.exit(0);
  })
  .catch((error) => {
    log.error({ error }, "Fallo en seed de content_items");
    process.exit(1);
  });
