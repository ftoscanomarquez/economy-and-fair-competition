/**
 * Verificación del tipo real de un archivo por sus magic bytes (firma
 * binaria), no por el header Content-Type que declara el cliente — ese
 * header es controlado por quien sube el archivo y puede falsificarse
 * trivialmente (ej. subir un .svg con script embebido declarando
 * Content-Type: image/png). Usado por /api/uploads y
 * /api/ai/extract-document antes de aceptar un archivo.
 */
import { fileTypeFromBuffer } from "file-type";

/**
 * Confirma que el buffer realmente corresponde a alguno de los MIME types
 * esperados, inspeccionando su firma binaria real.
 */
export async function verifyFileSignature(buffer: Buffer, expectedMimeTypes: string[]): Promise<boolean> {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected) return false;
  return expectedMimeTypes.includes(detected.mime);
}
