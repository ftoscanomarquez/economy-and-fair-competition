/**
 * Servidor MCP: punto de entrada único para automatizar la gestión de
 * Artículos/Notas desde WhatsApp (ver AGENTS.md §10.5, SPECIFICATION-SUMMARY.md
 * §3.8). Protocolo: POST con { tool, params, callerPhone? } y header
 * Authorization: Bearer <MCP_WEBHOOK_SECRET>.
 *
 * Herramientas disponibles (dispatch en handleTool más abajo):
 *   - list_templates       (lectura, no requiere teléfono)
 *   - list_posts           (lectura, no requiere teléfono)
 *   - get_post_detail      (lectura, no requiere teléfono)
 *   - create_post_from_media  (mutación, requiere callerPhone autorizado)
 *   - update_post           (mutación, requiere callerPhone autorizado)
 *   - delete_post            (mutación, requiere callerPhone autorizado)
 *
 * El editor de PLANTILLAS no se expone aquí — list_templates solo permite
 * elegir un templateId existente, nunca crear/editar plantillas desde
 * WhatsApp (decisión de producto confirmada, AGENTS.md §10.5).
 *
 * Conexión con un proveedor real de WhatsApp (Meta Cloud API, Twilio, etc.):
 * diferida a pedido del usuario. Este endpoint se prueba hoy vía HTTP directo
 * (Postman/curl) — ver postman/ y QUICK-START.md.
 */
import { z } from "zod";
import { ObjectId } from "mongodb";
import { apiError, apiOk } from "@/lib/api-response";
import { getDb } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyMcpAuthorization, isAuthorizedAdminPhone } from "@/lib/mcp-auth";
import { extractFromPdf, extractFromUrl } from "@/lib/ai/extract";
import { contentBlockSchema, type ContentBlock } from "@/lib/blocks/schema";
import { postCategorySchema, postTypeSchema } from "@/lib/posts-taxonomy";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { getEnv } from "@/lib/env";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:mcp");

const baseRequestSchema = z.object({
  tool: z.enum([
    "list_templates",
    "list_posts",
    "get_post_detail",
    "create_post_from_media",
    "update_post",
    "delete_post",
  ]),
  params: z.record(z.string(), z.unknown()).default({}),
  callerPhone: z.string().optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function listTemplates() {
  const db = await getDb();
  const docs = await db.collection("templates").find({}).sort({ name: 1 }).toArray();
  return {
    templates: docs.map((doc) => ({
      id: String(doc._id),
      name: doc.name,
      blockTypes: (doc.blocks as { type: string }[]).map((b) => b.type),
    })),
  };
}

const listPostsParamsSchema = z.object({
  locale: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

async function listPosts(rawParams: unknown) {
  const params = listPostsParamsSchema.parse(rawParams ?? {});
  const locale = params.locale && isLocale(params.locale) ? params.locale : defaultLocale;
  const db = await getDb();
  const filter = params.status ? { status: params.status } : {};
  const docs = await db.collection("posts").find(filter).sort({ createdAt: -1 }).limit(50).toArray();

  return {
    posts: docs.map((doc) => ({
      id: String(doc._id),
      slug: doc.slug,
      title: locale === "en" ? doc.titleEn : doc.titleEs,
      postType: doc.postType,
      status: doc.status,
    })),
  };
}

const getPostDetailParamsSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
});

async function getPostDetail(rawParams: unknown) {
  const params = getPostDetailParamsSchema.parse(rawParams ?? {});
  if (!params.id && !params.slug) {
    throw new McpToolError("Debe proporcionar 'id' o 'slug'.", 400);
  }

  const db = await getDb();
  const filter = params.id ? { _id: new ObjectId(params.id) } : { slug: params.slug };
  const doc = await db.collection("posts").findOne(filter);
  if (!doc) throw new McpToolError("Publicación no encontrada.", 404);

  return {
    post: {
      id: String(doc._id),
      slug: doc.slug,
      postType: doc.postType,
      category: doc.category,
      status: doc.status,
      titleEs: doc.titleEs,
      titleEn: doc.titleEn,
    },
  };
}

const createPostParamsSchema = z.object({
  templateId: z.string().min(1),
  postType: postTypeSchema,
  category: postCategorySchema.nullable().optional(),
  tags: z.array(z.string()).optional(),
  titleEs: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  // Fuente de contenido: exactamente una de las tres.
  markdown: z.string().optional(),
  pdfBase64: z.string().optional(),
  externalUrl: z.string().url().optional(),
});

class McpToolError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function createPostFromMedia(rawParams: unknown, callerPhone: string | undefined) {
  if (!isAuthorizedAdminPhone(callerPhone)) {
    throw new McpToolError("Teléfono no autorizado para crear publicaciones.", 403);
  }

  const params = createPostParamsSchema.parse(rawParams ?? {});
  const sourcesProvided = [params.markdown, params.pdfBase64, params.externalUrl].filter(Boolean).length;
  if (sourcesProvided !== 1) {
    throw new McpToolError("Debe proporcionar exactamente una fuente: markdown, pdfBase64 o externalUrl.", 400);
  }

  const db = await getDb();
  const template = await db.collection("templates").findOne({ _id: new ObjectId(params.templateId) });
  if (!template) throw new McpToolError("Plantilla no encontrada.", 404);

  let titleEs = params.titleEs;
  let titleEn = params.titleEn;
  let blocksEs: ContentBlock[];
  let blocksEn: ContentBlock[];
  let pdfUrl: string | null = null;
  let externalUrl: string | null = null;

  if (params.markdown) {
    // Texto directo: se coloca en el primer bloque richtext de la plantilla; el resto queda vacío
    // (el admin puede completarlo después desde /admin/posts).
    const firstRichtext = (template.blocks as { id: string; type: string }[]).find((b) => b.type === "richtext");
    const blockId = firstRichtext?.id ?? "block-1";
    blocksEs = [{ id: blockId, type: "richtext", markdown: params.markdown }];
    blocksEn = [{ id: blockId, type: "richtext", markdown: params.markdown }];
    titleEs = titleEs ?? "Publicación desde WhatsApp";
    titleEn = titleEn ?? "Post from WhatsApp";
  } else if (params.pdfBase64) {
    // Cortar antes de decodificar/parsear si el base64 ya excede el límite
    // de tamaño de documento — evita gastar CPU/memoria adicional en un
    // payload que de todas formas se va a rechazar.
    const approxBytes = (params.pdfBase64.length * 3) / 4;
    const maxBytes = getEnv().MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
    if (approxBytes > maxBytes) {
      throw new McpToolError(`El PDF excede el máximo permitido (${getEnv().MAX_DOCUMENT_SIZE_MB} MB).`, 400);
    }

    const buffer = Buffer.from(params.pdfBase64, "base64");
    const extracted = await extractFromPdf(buffer, `mcp:whatsapp:${callerPhone}`);
    blocksEs = [{ id: "extracted", type: "richtext", markdown: extracted.markdown }];
    blocksEn = [{ id: "extracted", type: "richtext", markdown: extracted.markdown }];
    titleEs = titleEs ?? extracted.title;
    titleEn = titleEn ?? extracted.title;
    // El PDF se persiste en public/documents/ (extractFromPdf → extractFromDocument
    // con persistOriginal) y su URL de descarga queda referenciada al final del
    // markdown generado, visible también en /admin/files.
  } else {
    const extracted = await extractFromUrl(params.externalUrl!);
    blocksEs = [{ id: "extracted", type: "richtext", markdown: extracted.markdown }];
    blocksEn = [{ id: "extracted", type: "richtext", markdown: extracted.markdown }];
    titleEs = titleEs ?? extracted.title;
    titleEn = titleEn ?? extracted.title;
    externalUrl = params.externalUrl!;
  }

  // El remitente de WhatsApp no elige el slug (se deriva del título), así que
  // una colisión no es un error de negocio que deba rechazarse (409): se
  // desambigua automáticamente agregando un sufijo numérico, igual que la
  // mayoría de los CMS con slugs autogenerados.
  const baseSlug = slugify(titleEs!) || `post-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;
  while (await db.collection("posts").findOne({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  const now = new Date();

  const doc = {
    slug,
    templateId: new ObjectId(params.templateId),
    postType: params.postType,
    category: params.category ?? null,
    tags: params.tags ?? [],
    titleEs,
    titleEn,
    summaryEs: null,
    summaryEn: null,
    blocksEs,
    blocksEn,
    thumbnailUrl: null,
    pdfUrl,
    externalUrl,
    // Los posts creados vía MCP entran como borrador — requieren revisión
    // humana en /admin/posts antes de publicarse, nunca se publican solos.
    status: "draft" as const,
    publishedAt: null,
    createdAt: now,
    source: `mcp:whatsapp:${callerPhone}`,
  };

  const result = await db.collection("posts").insertOne(doc);
  log.info({ id: result.insertedId, callerPhone, slug }, "Post creado vía MCP (borrador, pendiente de revisión)");

  return { id: String(result.insertedId), slug, status: "draft" };
}

const updatePostParamsSchema = z.object({
  id: z.string().min(1),
  titleEs: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  status: z.enum(["draft", "published"]).optional(),
  blocksEs: z.array(contentBlockSchema).optional(),
  blocksEn: z.array(contentBlockSchema).optional(),
});

async function updatePost(rawParams: unknown, callerPhone: string | undefined) {
  if (!isAuthorizedAdminPhone(callerPhone)) {
    throw new McpToolError("Teléfono no autorizado para modificar publicaciones.", 403);
  }

  const params = updatePostParamsSchema.parse(rawParams ?? {});
  const { id, ...update } = params;

  const db = await getDb();
  const result = await db.collection("posts").updateOne({ _id: new ObjectId(id) }, { $set: update });
  if (result.matchedCount === 0) throw new McpToolError("Publicación no encontrada.", 404);

  log.info({ id, callerPhone }, "Post actualizado vía MCP");
  return { updated: true };
}

const deletePostParamsSchema = z.object({ id: z.string().min(1) });

async function deletePost(rawParams: unknown, callerPhone: string | undefined) {
  if (!isAuthorizedAdminPhone(callerPhone)) {
    throw new McpToolError("Teléfono no autorizado para eliminar publicaciones.", 403);
  }

  const params = deletePostParamsSchema.parse(rawParams ?? {});
  const db = await getDb();
  const result = await db.collection("posts").deleteOne({ _id: new ObjectId(params.id) });
  if (result.deletedCount === 0) throw new McpToolError("Publicación no encontrada.", 404);

  log.info({ id: params.id, callerPhone }, "Post eliminado vía MCP");
  return { deleted: true };
}

async function handleTool(tool: string, params: unknown, callerPhone: string | undefined) {
  switch (tool) {
    case "list_templates":
      return listTemplates();
    case "list_posts":
      return listPosts(params);
    case "get_post_detail":
      return getPostDetail(params);
    case "create_post_from_media":
      return createPostFromMedia(params, callerPhone);
    case "update_post":
      return updatePost(params, callerPhone);
    case "delete_post":
      return deletePost(params, callerPhone);
    default:
      throw new McpToolError(`Herramienta desconocida: ${tool}`, 400);
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`mcp:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return apiError("Demasiadas solicitudes al servidor MCP.", 429);
  }

  const authHeader = request.headers.get("authorization");
  const providedToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const { authorized, adminEmail } = await verifyMcpAuthorization(providedToken);
  if (!authorized) {
    return apiError("Autorización MCP inválida o ausente (secreto de webhook o sesión admin).", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = baseRequestSchema.safeParse(json);
  if (!parsed.success) {
    return apiError("Solicitud MCP inválida: debe incluir { tool, params }.", 400);
  }

  try {
    const result = await handleTool(parsed.data.tool, parsed.data.params, parsed.data.callerPhone);
    if (adminEmail) {
      log.info({ tool: parsed.data.tool, adminEmail }, "Herramienta MCP invocada vía JWT de sesión admin");
    }
    return apiOk({ tool: parsed.data.tool, result });
  } catch (error) {
    if (error instanceof McpToolError) {
      return apiError(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return apiError(`Parámetros inválidos: ${error.issues.map((i) => i.path.join(".")).join(", ")}`, 400);
    }
    log.error({ error, tool: parsed.data.tool }, "Error inesperado en herramienta MCP");
    return apiError("Error interno al procesar la solicitud MCP.", 500);
  }
}
