import { getDb, getMongoClient } from "../lib/db";
import { childLogger } from "../lib/logger";
import { postSeeds } from "../content/seeds/posts";

const log = childLogger("seed-data");

async function run() {
  const db = await getDb();
  const coll = db.collection("posts");

  let inserted = 0;
  let migrated = 0;

  for (const seed of postSeeds) {
    const existing = await coll.findOne({ slug: seed.slug });

    const doc = {
      ...seed,
      templateId: null,
      thumbnailUrl: null,
      pdfUrl: seed.pdfUrl ?? null,
      externalUrl: seed.externalUrl ?? null,
      source: "seed:data",
    };

    if (existing) {
      // Migra documentos del esquema anterior (bodyEs/bodyEn, category texto libre,
      // sin postType/tags) al nuevo esquema de plantillas/bloques.
      await coll.updateOne(
        { _id: existing._id },
        {
          $set: doc,
          $unset: { bodyEs: "", bodyEn: "" },
        }
      );
      migrated += 1;
      continue;
    }

    await coll.insertOne({ ...doc, createdAt: new Date() });
    inserted += 1;
  }

  log.info({ inserted, migrated, total: postSeeds.length }, "Seed de datos (posts) completada");
}

run()
  .then(async () => {
    const client = await getMongoClient();
    await client.close();
    process.exit(0);
  })
  .catch((error) => {
    log.error({ error }, "Fallo en seed de datos");
    process.exit(1);
  });
