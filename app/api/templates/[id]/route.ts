import { z } from "zod";
import { ObjectId } from "mongodb";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { templateBlockSchema } from "@/lib/blocks/schema";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:templates:id");

function parseId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const objectId = parseId(id);
  if (!objectId) return apiError("Identificador inválido.", 400);

  const db = await getDb();
  const doc = await db.collection("templates").findOne({ _id: objectId });
  if (!doc) return apiError("Plantilla no encontrada.", 404);

  return apiOk({
    template: {
      id: String(doc._id),
      name: doc.name,
      blocks: doc.blocks,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    },
  });
}

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  blocks: z.array(templateBlockSchema).min(1).optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const { id } = await params;
  const objectId = parseId(id);
  if (!objectId) return apiError("Identificador inválido.", 400);

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return apiError("Datos de actualización inválidos.", 400);

  const db = await getDb();
  const result = await db
    .collection("templates")
    .updateOne({ _id: objectId }, { $set: { ...parsed.data, updatedAt: new Date() } });

  if (result.matchedCount === 0) return apiError("Plantilla no encontrada.", 404);

  log.info({ id, email: session.email }, "Plantilla actualizada");
  return apiOk({ updated: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const { id } = await params;
  const objectId = parseId(id);
  if (!objectId) return apiError("Identificador inválido.", 400);

  const db = await getDb();

  const inUse = await db.collection("posts").countDocuments({ templateId: objectId });
  if (inUse > 0) {
    return apiError(
      `No se puede eliminar: ${inUse} publicación(es) usan esta plantilla.`,
      409
    );
  }

  const result = await db.collection("templates").deleteOne({ _id: objectId });
  if (result.deletedCount === 0) return apiError("Plantilla no encontrada.", 404);

  log.info({ id, email: session.email }, "Plantilla eliminada");
  return apiOk({ deleted: true });
}
