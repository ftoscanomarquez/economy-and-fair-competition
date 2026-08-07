/**
 * Listado de archivos subidos (imágenes y documentos) para la pantalla de
 * gestión /admin/files (components/admin/files-manager.tsx). Cada entrada
 * indica si el archivo físico sigue existiendo en disco (`existsOnDisk`) —
 * un post puede seguir referenciando la URL de un documento ya eliminado
 * desde aquí, en cuyo caso el enlace debe mostrarse como "depurado" en vez
 * de un enlace roto silencioso (ver PurgedFileNotice).
 */
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { listUploadedFiles } from "@/lib/uploads";

export async function GET() {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const files = await listUploadedFiles();
  return apiOk({ files });
}
