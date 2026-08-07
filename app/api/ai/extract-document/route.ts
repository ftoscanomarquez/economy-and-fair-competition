/**
 * Extrae y resume (vía Claude) el contenido de un documento subido
 * (PDF/DOCX/PPTX, multipart/form-data campo "file") o de una URL (JSON
 * { url }, HTML o un archivo servido directo). Usado por el botón "Extraer
 * de PDF/URL" del editor de bloques de texto enriquecido en el admin
 * (components/admin/markdown-block-editor.tsx) — el resultado se muestra
 * como sugerencia editable (título, resumen y Markdown), el admin decide
 * explícitamente si la aplica al bloque; nunca se sobreescribe solo.
 *
 * Comparte lib/ai/extract.ts con el servidor MCP (create_post_from_media),
 * que solo expone PDF/URL — aquí además se aceptan DOCX y PPTX subidos
 * directamente por el admin.
 */
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { extractFromDocument, extractFromUrl, type DocumentFileType } from "@/lib/ai/extract";
import { AiNotConfiguredError } from "@/lib/ai/client";
import { getEnv } from "@/lib/env";
import { verifyFileSignature } from "@/lib/file-signature";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:ai:extract-document");

const MIME_TO_FILE_TYPE: Record<string, DocumentFileType> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

const urlBodySchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`ai:extract-document:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return apiError("Demasiadas solicitudes a la IA. Intente de nuevo en unos minutos.", 429);
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData().catch(() => null);
      const file = formData?.get("file");
      if (!file || !(file instanceof File)) {
        return apiError("Ningún archivo recibido.", 400);
      }

      const fileType = MIME_TO_FILE_TYPE[file.type];
      if (!fileType) {
        return apiError("Formato no soportado. Usa PDF, Word (.docx) o PowerPoint (.pptx).", 400);
      }

      const maxBytes = getEnv().MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
      if (file.size > maxBytes) {
        return apiError(`El archivo excede el máximo permitido (${getEnv().MAX_DOCUMENT_SIZE_MB} MB).`, 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // El Content-Type declarado por el cliente es falsificable — se
      // confirma el tipo real por la firma binaria del archivo.
      const signatureValid = await verifyFileSignature(buffer, Object.keys(MIME_TO_FILE_TYPE));
      if (!signatureValid) {
        return apiError("El contenido del archivo no coincide con PDF, Word o PowerPoint.", 400);
      }

      const result = await extractFromDocument(buffer, fileType, {
        persistOriginal: true,
        originalName: file.name,
        createdBy: session.email,
      });
      return apiOk(result);
    }

    const json = await request.json().catch(() => null);
    const parsed = urlBodySchema.safeParse(json);
    if (!parsed.success) return apiError("Debe enviar un archivo (multipart) o { url }.", 400);

    const result = await extractFromUrl(parsed.data.url);
    return apiOk(result);
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return apiError(error.message, 503);
    }
    const message = error instanceof Error ? error.message : "Error desconocido";
    log.error({ error }, "Fallo al extraer contenido del documento/URL");
    return apiError(`No se pudo extraer el contenido: ${message}`, 502);
  }
}
