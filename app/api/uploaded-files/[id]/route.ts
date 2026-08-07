/**
 * Elimina un archivo subido (imagen o documento) desde /admin/files. Borra
 * el registro en Mongo y el archivo físico en disco si existe. No valida si
 * el archivo sigue referenciado por algún post/bloque — es intencional
 * (decisión de producto): el admin puede depurar archivos viejos aunque un
 * post antiguo aún los enlace; ese enlace se detecta como "documento
 * depurado" en el render público en vez de romperse silenciosamente.
 */
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { deleteUploadedFile } from "@/lib/uploads";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:uploaded-files:id");

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const { id } = await params;
  const deleted = await deleteUploadedFile(id).catch(() => false);
  if (!deleted) return apiError("Archivo no encontrado.", 404);

  log.info({ id, email: session.email }, "Archivo eliminado");
  return apiOk({ deleted: true });
}
