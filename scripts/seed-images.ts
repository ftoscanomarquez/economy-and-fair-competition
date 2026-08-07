/**
 * Copia las imágenes de arranque versionadas en content/seed-images/<seccion>/
 * hacia public/uploads/<seccion>/ (la carpeta runtime real que sirve Next.js
 * y donde /api/uploads guarda subidas nuevas). Necesario porque:
 *   - public/uploads/ está en .gitignore (es zona de trabajo del admin en
 *     producción, no debe versionarse ahí directamente).
 *   - En Vercel el filesystem no persiste entre despliegues, así que las
 *     imágenes de arranque deben poder reconstruirse siempre desde el repo.
 * Idempotente: si el archivo destino ya existe, se omite sin sobreescribir
 * (una imagen ya reemplazada por el admin en runtime no se pisa al re-correr
 * el seed).
 */
import path from "node:path";
import { promises as fs } from "node:fs";
import { childLogger } from "../lib/logger";
import { getEnv } from "../lib/env";

const log = childLogger("seed-images");

const SEED_IMAGES_DIR = path.resolve(process.cwd(), "content/seed-images");

async function run() {
  const env = getEnv();
  const uploadsDir = path.resolve(process.cwd(), env.UPLOADS_DIR);

  const folders = await fs.readdir(SEED_IMAGES_DIR, { withFileTypes: true });
  let copied = 0;
  let skipped = 0;

  for (const folder of folders) {
    if (!folder.isDirectory()) continue;

    const srcDir = path.join(SEED_IMAGES_DIR, folder.name);
    const destDir = path.join(uploadsDir, folder.name);
    await fs.mkdir(destDir, { recursive: true });

    const files = await fs.readdir(srcDir);
    for (const file of files) {
      const src = path.join(srcDir, file);
      const dest = path.join(destDir, file);

      try {
        await fs.access(dest);
        skipped += 1;
      } catch {
        await fs.copyFile(src, dest);
        copied += 1;
      }
    }
  }

  log.info({ copied, skipped }, "Seed de imágenes de arranque completado");
}

run().catch((error) => {
  log.error({ error }, "Fallo en seed de imágenes");
  process.exit(1);
});
