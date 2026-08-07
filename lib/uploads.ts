/**
 * Guardado y gestión de archivos binarios subidos a disco local:
 *   - public/uploads/<seccion>/  → imágenes, agrupadas por sección de origen
 *     (ver IMAGE_FOLDERS) para que el contenido de arranque (seeds) pueda
 *     versionar por carpeta qué imagen pertenece a qué parte del sitio.
 *   - public/documents/          → documentos fuente (PDF/DOCX/PPTX) subidos
 *     para extracción con IA (lib/ai/extract.ts) — se conservan para que el
 *     Markdown generado pueda enlazar el documento original como descarga.
 *
 * Todo archivo guardado por cualquiera de las dos rutas queda además
 * registrado en la colección Mongo `uploaded_files`, que alimenta la
 * pantalla de gestión de archivos del admin (/admin/files —
 * components/admin/files-manager.tsx): listar, ver tamaño/fecha, y eliminar
 * archivos viejos. Si un archivo se elimina desde ahí, su URL puede seguir
 * referenciada en un post antiguo — ver `isFileMissing()` / el componente
 * `PurgedFileNotice`, que detectan esa referencia rota y muestran un aviso
 * ("documento depurado") en vez de un enlace roto silencioso.
 */
import path from "node:path";
import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import { getEnv } from "./env";
import { getDb } from "./db";

export type UploadKind = "image" | "document";

/**
 * Subcarpetas de public/uploads por origen de la imagen. Whitelist cerrada
 * (no un string libre) para que un valor inesperado del cliente no pueda
 * escribir fuera de public/uploads (path traversal) — cualquier `folder`
 * que no esté aquí cae en "otros".
 */
export const IMAGE_FOLDERS = [
  "home",
  "especializacion",
  "servicios",
  "industrias",
  "articulos-y-notas",
  "generado-ia",
  "otros",
] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

function resolveImageFolder(folder?: string): ImageFolder {
  return (IMAGE_FOLDERS as readonly string[]).includes(folder ?? "") ? (folder as ImageFolder) : "otros";
}

type UploadedFileDoc = {
  _id?: unknown;
  url: string;
  kind: UploadKind;
  originalName: string | null;
  sizeBytes: number;
  createdAt: Date;
  createdBy: string | null;
};

async function saveBuffer(
  buffer: Buffer,
  extension: string,
  baseDir: string,
  publicPrefix: string,
  kind: UploadKind,
  originalName: string | null,
  createdBy: string | null
): Promise<string> {
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const dir = path.resolve(process.cwd(), baseDir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  const url = `${publicPrefix}/${filename}`;

  const db = await getDb();
  await db.collection<UploadedFileDoc>("uploaded_files").insertOne({
    url,
    kind,
    originalName,
    sizeBytes: buffer.length,
    createdAt: new Date(),
    createdBy,
  });

  return url;
}

export async function saveImageBuffer(
  buffer: Buffer,
  extension: string,
  options?: { originalName?: string; createdBy?: string; folder?: string }
): Promise<string> {
  const env = getEnv();
  const folder = resolveImageFolder(options?.folder);
  return saveBuffer(
    buffer,
    extension,
    path.join(env.UPLOADS_DIR, folder),
    `/uploads/${folder}`,
    "image",
    options?.originalName ?? null,
    options?.createdBy ?? null
  );
}

export async function saveDocumentBuffer(
  buffer: Buffer,
  extension: string,
  options?: { originalName?: string; createdBy?: string }
): Promise<string> {
  const env = getEnv();
  return saveBuffer(
    buffer,
    extension,
    env.DOCUMENTS_DIR,
    "/documents",
    "document",
    options?.originalName ?? null,
    options?.createdBy ?? null
  );
}

export type UploadedFileSummary = {
  id: string;
  url: string;
  kind: UploadKind;
  originalName: string | null;
  sizeBytes: number;
  createdAt: Date;
  createdBy: string | null;
  existsOnDisk: boolean;
};

/** Lista todos los archivos registrados, más recientes primero, confirmando si cada uno sigue existiendo físicamente en disco. */
export async function listUploadedFiles(): Promise<UploadedFileSummary[]> {
  const db = await getDb();
  const docs = await db
    .collection<UploadedFileDoc>("uploaded_files")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return Promise.all(
    docs.map(async (doc) => ({
      id: String(doc._id),
      url: doc.url,
      kind: doc.kind,
      originalName: doc.originalName,
      sizeBytes: doc.sizeBytes,
      createdAt: doc.createdAt,
      createdBy: doc.createdBy,
      existsOnDisk: await fileExistsForUrl(doc.url),
    }))
  );
}

function resolveDiskPathForUrl(url: string): string {
  const env = getEnv();
  if (url.startsWith("/uploads/")) {
    return path.resolve(process.cwd(), env.UPLOADS_DIR, url.slice("/uploads/".length));
  }
  return path.resolve(process.cwd(), env.DOCUMENTS_DIR, url.slice("/documents/".length));
}

async function fileExistsForUrl(url: string): Promise<boolean> {
  try {
    await fs.access(resolveDiskPathForUrl(url));
    return true;
  } catch {
    return false;
  }
}

/**
 * Confirma si una URL de archivo (guardada como referencia en, por ejemplo,
 * un bloque de post o el pie de un Markdown extraído) sigue existiendo en
 * disco. Usado para mostrar el aviso "documento depurado" en vez de un
 * enlace roto cuando el admin ya eliminó el archivo desde /admin/files.
 */
export async function isFileMissing(url: string | null | undefined): Promise<boolean> {
  if (!url || (!url.startsWith("/uploads/") && !url.startsWith("/documents/"))) return false;
  return !(await fileExistsForUrl(url));
}

/** Elimina un archivo por id: borra el registro en Mongo y, si existe, el archivo físico en disco. */
export async function deleteUploadedFile(id: string): Promise<boolean> {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  const doc = await db.collection<UploadedFileDoc>("uploaded_files").findOne({ _id: new ObjectId(id) });
  if (!doc) return false;

  try {
    await fs.unlink(resolveDiskPathForUrl(doc.url));
  } catch {
    // El archivo físico ya no existía (borrado manual, o ya purgado antes) — igual se limpia el registro.
  }

  await db.collection("uploaded_files").deleteOne({ _id: new ObjectId(id) });
  return true;
}
