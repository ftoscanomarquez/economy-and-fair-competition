/**
 * Migración única: sube las imágenes ya existentes en public/uploads/<seccion>/
 * a Vercel Blob y actualiza cada referencia en Mongo (content_items.imageUrl,
 * site_texts["home.hero.image"], posts.thumbnailUrl/bloques hero-twoColumn)
 * para que apunten a la nueva URL absoluta de Blob en vez de la ruta relativa
 * /uploads/<seccion>/archivo.ext.
 *
 * Necesario porque el filesystem de Vercel no persiste entre deploys — las
 * imágenes sembradas en disco local nunca llegaron al deploy real, dejando
 * el sitio en producción sin imágenes (ver HISTORY.md). Requiere
 * BLOB_READ_WRITE_TOKEN en el entorno (ya en .env.local tras
 * `vercel blob create-store`).
 *
 * Idempotente respecto a Mongo (solo actualiza URLs que sigan siendo rutas
 * relativas /uploads/...; una URL que ya sea de Blob se deja intacta), pero
 * SÍ vuelve a subir el archivo a Blob en cada corrida si se ejecuta de
 * nuevo — pensado para correrse una sola vez.
 */
import path from "node:path";
import { promises as fs } from "node:fs";
import { put } from "@vercel/blob";
import { getDb, getMongoClient } from "../lib/db";
import { childLogger } from "../lib/logger";
import { getEnv } from "../lib/env";
import type { ContentBlock } from "../lib/blocks/schema";

const log = childLogger("migrate-uploads-to-blob");

function isRootUploadUrl(url: string | null | undefined): url is string {
  return !!url && url.startsWith("/uploads/");
}

const uploadedCache = new Map<string, string>();

async function uploadFileToBlob(env: ReturnType<typeof getEnv>, relativeUrl: string): Promise<string | null> {
  const cached = uploadedCache.get(relativeUrl);
  if (cached) return cached;

  const diskPath = path.resolve(process.cwd(), env.UPLOADS_DIR, relativeUrl.slice("/uploads/".length));
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(diskPath);
  } catch {
    log.warn({ relativeUrl, diskPath }, "Archivo no encontrado en disco local, se omite");
    return null;
  }

  const pathname = relativeUrl.slice(1); // quita la barra inicial
  const blob = await put(pathname, buffer, { access: "public", addRandomSuffix: false });
  uploadedCache.set(relativeUrl, blob.url);
  return blob.url;
}

async function run() {
  const env = getEnv();
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN no está definido en el entorno.");
  }

  const db = await getDb();
  let uploaded = 0;
  let updated = 0;

  // 1. content_items
  const contentItems = await db.collection("content_items").find({}).toArray();
  for (const doc of contentItems) {
    if (!isRootUploadUrl(doc.imageUrl)) continue;
    const blobUrl = await uploadFileToBlob(env, doc.imageUrl);
    if (!blobUrl) continue;
    uploaded += 1;
    await db.collection("content_items").updateOne({ _id: doc._id }, { $set: { imageUrl: blobUrl } });
    updated += 1;
  }

  // 2. site_texts["home.hero.image"]
  const heroDoc = await db.collection("site_texts").findOne({ key: "home.hero.image" });
  if (heroDoc) {
    const update: Record<string, string> = {};
    if (isRootUploadUrl(heroDoc.es)) {
      const blobUrl = await uploadFileToBlob(env, heroDoc.es);
      if (blobUrl) {
        uploaded += 1;
        update.es = blobUrl;
      }
    }
    if (isRootUploadUrl(heroDoc.en)) {
      const blobUrl = await uploadFileToBlob(env, heroDoc.en);
      if (blobUrl) {
        uploaded += 1;
        update.en = blobUrl;
      }
    }
    if (Object.keys(update).length > 0) {
      await db.collection("site_texts").updateOne({ key: "home.hero.image" }, { $set: update });
      updated += 1;
    }
  }

  // 3. posts: thumbnailUrl + imageUrl dentro de bloques hero/twoColumn
  const posts = await db.collection("posts").find({}).toArray();
  for (const doc of posts) {
    const setOps: Record<string, unknown> = {};

    if (isRootUploadUrl(doc.thumbnailUrl)) {
      const blobUrl = await uploadFileToBlob(env, doc.thumbnailUrl);
      if (blobUrl) {
        uploaded += 1;
        setOps.thumbnailUrl = blobUrl;
      }
    }

    for (const field of ["blocksEs", "blocksEn"] as const) {
      const blocks = (doc[field] ?? null) as ContentBlock[] | null;
      if (!blocks) continue;
      let changed = false;
      const nextBlocks = await Promise.all(
        blocks.map(async (block) => {
          if ((block.type === "hero" || block.type === "twoColumn") && isRootUploadUrl(block.imageUrl)) {
            const blobUrl = await uploadFileToBlob(env, block.imageUrl);
            if (blobUrl) {
              uploaded += 1;
              changed = true;
              return { ...block, imageUrl: blobUrl };
            }
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

  log.info({ uploaded, updated }, "Migración de uploads a Vercel Blob completada");
}

run()
  .then(async () => {
    const client = await getMongoClient();
    await client.close();
    process.exit(0);
  })
  .catch((error) => {
    log.error({ error }, "Fallo en migración de uploads a Vercel Blob");
    process.exit(1);
  });
