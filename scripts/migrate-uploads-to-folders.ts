/**
 * Migración única: reorganiza public/uploads/*.ext (plano) en subcarpetas
 * por origen — public/uploads/{home,especializacion,servicios,industrias,
 * articulos-y-notas,generado-ia,otros}/*.ext — y actualiza cada referencia
 * a esas URLs en Mongo (content_items.imageUrl, site_texts["home.hero.image"],
 * posts.thumbnailUrl, posts.blocksEs/blocksEn[].imageUrl) para que apunten a
 * la nueva ruta. Idempotente: si un archivo ya no está en la raíz (porque ya
 * se migró), se omite sin error.
 */
import path from "node:path";
import { promises as fs } from "node:fs";
import { getDb, getMongoClient } from "../lib/db";
import { childLogger } from "../lib/logger";
import { getEnv } from "../lib/env";
import { SECTION_UPLOAD_FOLDER, type ContentSection } from "../lib/content-items";
import type { ContentBlock } from "../lib/blocks/schema";

const log = childLogger("migrate-uploads-to-folders");

async function moveFile(env: ReturnType<typeof getEnv>, filename: string, folder: string): Promise<boolean> {
  const rootDir = path.resolve(process.cwd(), env.UPLOADS_DIR);
  const src = path.join(rootDir, filename);
  const destDir = path.join(rootDir, folder);
  const dest = path.join(destDir, filename);

  try {
    await fs.access(src);
  } catch {
    return false; // ya migrado o nunca existió en disco
  }

  await fs.mkdir(destDir, { recursive: true });
  await fs.rename(src, dest);
  return true;
}

function newUrl(url: string, folder: string): string {
  const filename = url.split("/").pop()!;
  return `/uploads/${folder}/${filename}`;
}

/** Solo mueve URLs /uploads/archivo.ext de nivel raíz — ya migradas (/uploads/<folder>/archivo.ext) se dejan intactas. */
function isRootUploadUrl(url: string | null | undefined): url is string {
  if (!url || !url.startsWith("/uploads/")) return false;
  return !url.slice("/uploads/".length).includes("/");
}

async function run() {
  const env = getEnv();
  const db = await getDb();
  let moved = 0;
  let updated = 0;

  // 1. content_items (Especialización / Servicios / Industrias)
  const contentItems = await db.collection("content_items").find({}).toArray();
  for (const doc of contentItems) {
    if (!isRootUploadUrl(doc.imageUrl)) continue;
    const folder = SECTION_UPLOAD_FOLDER[doc.section as ContentSection] ?? "otros";
    const didMove = await moveFile(env, doc.imageUrl.split("/").pop()!, folder);
    if (didMove) moved += 1;
    const url = newUrl(doc.imageUrl, folder);
    await db.collection("content_items").updateOne({ _id: doc._id }, { $set: { imageUrl: url } });
    updated += 1;
  }

  // 2. site_texts["home.hero.image"] (imagen del hero de Home)
  const heroDoc = await db.collection("site_texts").findOne({ key: "home.hero.image" });
  if (heroDoc && (isRootUploadUrl(heroDoc.es) || isRootUploadUrl(heroDoc.en))) {
    const update: Record<string, string> = {};
    if (isRootUploadUrl(heroDoc.es)) {
      if (await moveFile(env, heroDoc.es.split("/").pop()!, "home")) moved += 1;
      update.es = newUrl(heroDoc.es, "home");
    }
    if (isRootUploadUrl(heroDoc.en)) {
      if (await moveFile(env, heroDoc.en.split("/").pop()!, "home")) moved += 1;
      update.en = newUrl(heroDoc.en, "home");
    }
    await db.collection("site_texts").updateOne({ key: "home.hero.image" }, { $set: update });
    updated += 1;
  }

  // 3. posts: thumbnailUrl + imageUrl dentro de bloques hero/twoColumn (blocksEs/blocksEn)
  const posts = await db.collection("posts").find({}).toArray();
  for (const doc of posts) {
    const setOps: Record<string, unknown> = {};

    if (isRootUploadUrl(doc.thumbnailUrl)) {
      if (await moveFile(env, doc.thumbnailUrl.split("/").pop()!, "articulos-y-notas")) moved += 1;
      setOps.thumbnailUrl = newUrl(doc.thumbnailUrl, "articulos-y-notas");
    }

    for (const field of ["blocksEs", "blocksEn"] as const) {
      const blocks = (doc[field] ?? null) as ContentBlock[] | null;
      if (!blocks) continue;
      let changed = false;
      const nextBlocks = await Promise.all(
        blocks.map(async (block) => {
          if ((block.type === "hero" || block.type === "twoColumn") && isRootUploadUrl(block.imageUrl)) {
            if (await moveFile(env, block.imageUrl.split("/").pop()!, "articulos-y-notas")) moved += 1;
            changed = true;
            return { ...block, imageUrl: newUrl(block.imageUrl, "articulos-y-notas") };
          }
          return block;
        })
      );
      if (changed) setOps[field] = nextBlocks;
    }

    if (Object.keys(setOps).length > 0) {
      await db.collection("posts").updateOne({ _id: doc._id }, { $set: setOps });
      updated += 1;
    }
  }

  log.info({ moved, updated }, "Migración de uploads a subcarpetas por sección completada");
}

run()
  .then(async () => {
    const client = await getMongoClient();
    await client.close();
    process.exit(0);
  })
  .catch((error) => {
    log.error({ error }, "Fallo en migración de uploads a subcarpetas");
    process.exit(1);
  });
