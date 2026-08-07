import { z } from "zod";
import { ObjectId } from "mongodb";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { isLocale, defaultLocale } from "@/lib/i18n";
import { contentBlockSchema } from "@/lib/blocks/schema";
import { postCategorySchema, postTypeSchema } from "@/lib/posts-taxonomy";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:posts:id");

function parseId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const objectId = parseId(id);
  if (!objectId) return apiError("Identificador inválido.", 400);

  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale") ?? defaultLocale;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const db = await getDb();
  const doc = await db.collection("posts").findOne({ _id: objectId });
  if (!doc) return apiError("Publicación no encontrada.", 404);

  return apiOk({
    post: {
      id: String(doc._id),
      slug: doc.slug,
      templateId: doc.templateId ? String(doc.templateId) : null,
      postType: doc.postType,
      category: doc.category,
      tags: doc.tags ?? [],
      titleEs: doc.titleEs,
      titleEn: doc.titleEn,
      summaryEs: doc.summaryEs,
      summaryEn: doc.summaryEn,
      blocksEs: doc.blocksEs ?? [],
      blocksEn: doc.blocksEn ?? [],
      thumbnailUrl: doc.thumbnailUrl ?? null,
      title: locale === "en" ? doc.titleEn : doc.titleEs,
      summary: locale === "en" ? doc.summaryEn : doc.summaryEs,
      status: doc.status,
      pdfUrl: doc.pdfUrl,
      externalUrl: doc.externalUrl,
      publishedAt: doc.publishedAt,
    },
  });
}

const updateSchema = z.object({
  templateId: z.string().min(1).nullable().optional(),
  postType: postTypeSchema.optional(),
  category: postCategorySchema.nullable().optional(),
  tags: z.array(z.string()).optional(),
  titleEs: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  summaryEs: z.string().optional(),
  summaryEn: z.string().optional(),
  blocksEs: z.array(contentBlockSchema).optional(),
  blocksEn: z.array(contentBlockSchema).optional(),
  thumbnailUrl: z.string().nullable().optional(),
  pdfUrl: z.string().url().nullable().optional(),
  externalUrl: z.string().url().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
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
  const { templateId, ...restUpdate } = parsed.data;
  const update: Record<string, unknown> = { ...restUpdate };
  if (templateId !== undefined) {
    update.templateId = templateId ? new ObjectId(templateId) : null;
  }

  if (parsed.data.status === "published") {
    const current = await db.collection("posts").findOne({ _id: objectId });
    if (current && !current.publishedAt) {
      update.publishedAt = new Date();
    }
  }

  const result = await db.collection("posts").updateOne({ _id: objectId }, { $set: update });
  if (result.matchedCount === 0) return apiError("Publicación no encontrada.", 404);

  log.info({ id, email: session.email }, "Post actualizado");
  return apiOk({ updated: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const { id } = await params;
  const objectId = parseId(id);
  if (!objectId) return apiError("Identificador inválido.", 400);

  const db = await getDb();
  const result = await db.collection("posts").deleteOne({ _id: objectId });
  if (result.deletedCount === 0) return apiError("Publicación no encontrada.", 404);

  log.info({ id, email: session.email }, "Post eliminado");
  return apiOk({ deleted: true });
}
