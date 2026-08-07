import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { updateContentItem, deleteContentItem } from "@/lib/content-items";

const updateSchema = z.object({
  titleEs: z.string().optional(),
  titleEn: z.string().optional(),
  summaryEs: z.string().optional(),
  summaryEn: z.string().optional(),
  detailEs: z.string().optional(),
  detailEn: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return apiError("Datos de actualización inválidos.", 400);

  const updated = await updateContentItem(id, parsed.data).catch(() => false);
  if (!updated) return apiError("Item no encontrado.", 404);

  return apiOk({ updated: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const { id } = await params;
  const deleted = await deleteContentItem(id).catch(() => false);
  if (!deleted) return apiError("Item no encontrado.", 404);

  return apiOk({ deleted: true });
}
