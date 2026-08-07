import { z } from "zod";
import { ObjectId } from "mongodb";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { isLocale, defaultLocale } from "@/lib/i18n";
import { contentBlockSchema } from "@/lib/blocks/schema";
import { postCategorySchema, postTypeSchema } from "@/lib/posts-taxonomy";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:posts");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale") ?? defaultLocale;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const includeDrafts = searchParams.get("includeDrafts") === "true";

  const session = includeDrafts ? await getServerSession() : null;
  if (includeDrafts && !session) {
    return apiError("No autenticado.", 401);
  }

  const db = await getDb();
  const filter = includeDrafts ? {} : { status: "published" };
  const docs = await db
    .collection("posts")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  const posts = docs.map((doc) => ({
    id: String(doc._id),
    slug: doc.slug,
    title: locale === "en" ? doc.titleEn : doc.titleEs,
    postType: doc.postType,
    category: doc.category,
    tags: doc.tags ?? [],
    status: doc.status,
    thumbnailUrl: doc.thumbnailUrl ?? null,
    publishedAt: doc.publishedAt,
  }));

  return apiOk({ posts });
}

/**
 * Contrato compartido entre el editor admin (Fase 7C) y el servidor MCP
 * (Fase 7F, create_post_from_media): ambos crean posts con este esquema, la
 * única diferencia es cómo se generan blocksEs/blocksEn (manual en el admin,
 * vía IA a partir de PDF/URL en MCP).
 */
const createSchema = z.object({
  slug: z.string().min(1),
  templateId: z.string().min(1).nullable().optional(),
  postType: postTypeSchema,
  category: postCategorySchema.nullable().optional(),
  tags: z.array(z.string()).default([]),
  titleEs: z.string().min(1),
  titleEn: z.string().min(1),
  summaryEs: z.string().optional(),
  summaryEn: z.string().optional(),
  blocksEs: z.array(contentBlockSchema).default([]),
  blocksEn: z.array(contentBlockSchema).default([]),
  thumbnailUrl: z.string().nullable().optional(),
  pdfUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return apiError("No autenticado.", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return apiError("Datos de publicación inválidos.", 400);
  }

  const db = await getDb();
  const existing = await db.collection("posts").findOne({ slug: parsed.data.slug });
  if (existing) {
    return apiError("Ya existe una publicación con ese slug.", 409);
  }

  const now = new Date();
  const { templateId, ...rest } = parsed.data;
  const doc = {
    ...rest,
    templateId: templateId ? new ObjectId(templateId) : null,
    category: parsed.data.category ?? null,
    summaryEs: parsed.data.summaryEs ?? null,
    summaryEn: parsed.data.summaryEn ?? null,
    thumbnailUrl: parsed.data.thumbnailUrl ?? null,
    pdfUrl: parsed.data.pdfUrl ?? null,
    externalUrl: parsed.data.externalUrl ?? null,
    publishedAt: parsed.data.status === "published" ? now : null,
    createdAt: now,
    source: `admin:${session.email}`,
  };

  const result = await db.collection("posts").insertOne(doc);
  log.info({ id: result.insertedId, email: session.email }, "Post creado");

  return apiOk({ id: String(result.insertedId) }, 201);
}
