/**
 * Subida de imágenes a disco local (public/uploads), usada por los bloques
 * hero/twoColumn del editor de posts (Fase 7C) y por el drawer de gestión.
 * Decisión de almacenamiento: disco local en el MVP, no S3/RustFS — ver
 * AGENTS.md §1. Migrar a S3 en el futuro solo requiere reemplazar este
 * endpoint, el contrato { url } hacia el cliente no cambia.
 */
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { getEnv } from "@/lib/env";
import { saveImageBuffer } from "@/lib/uploads";
import { verifyFileSignature } from "@/lib/file-signature";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:uploads");

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const ALLOWED_MIME_TYPES_SET = new Set(ALLOWED_MIME_TYPES);

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const env = getEnv();
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const folder = formData?.get("folder");

  if (!file || !(file instanceof File)) {
    return apiError("Ningún archivo recibido.", 400);
  }

  if (!ALLOWED_MIME_TYPES_SET.has(file.type)) {
    return apiError("Tipo de archivo no permitido. Usa PNG, JPEG, WEBP o GIF.", 400);
  }

  const maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return apiError(`El archivo excede el máximo permitido (${env.MAX_UPLOAD_SIZE_MB} MB).`, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // El Content-Type declarado por el cliente es falsificable — se confirma
  // el tipo real por la firma binaria del archivo antes de guardarlo
  // (evita, por ejemplo, subir un .svg con script disfrazado de PNG).
  const signatureValid = await verifyFileSignature(buffer, ALLOWED_MIME_TYPES);
  if (!signatureValid) {
    return apiError("El contenido del archivo no coincide con un formato de imagen permitido.", 400);
  }

  const extension = file.type.split("/")[1] ?? "bin";
  const url = await saveImageBuffer(buffer, extension, {
    originalName: file.name,
    createdBy: session.email,
    folder: typeof folder === "string" ? folder : undefined,
  });

  log.info({ url, size: file.size, email: session.email }, "Imagen subida");

  return apiOk({ url }, 201);
}
