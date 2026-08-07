import { getDb, getMongoClient } from "../lib/db";
import { childLogger } from "../lib/logger";
import { siteTextSeeds } from "../content/seeds/site-texts";

const log = childLogger("seed-config");

async function run() {
  const db = await getDb();
  const coll = db.collection("site_texts");

  let inserted = 0;
  let updated = 0;

  for (const seed of siteTextSeeds) {
    const result = await coll.updateOne(
      { key: seed.key },
      {
        $set: { es: seed.es, en: seed.en, updatedAt: new Date() },
        $setOnInsert: { key: seed.key, updatedBy: "seed:config" },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) inserted += 1;
    else if (result.modifiedCount > 0) updated += 1;
  }

  log.info({ inserted, updated, total: siteTextSeeds.length }, "Seed de configuración (site_texts) completada");
}

run()
  .then(async () => {
    const client = await getMongoClient();
    await client.close();
    process.exit(0);
  })
  .catch((error) => {
    log.error({ error }, "Fallo en seed de configuración");
    process.exit(1);
  });
