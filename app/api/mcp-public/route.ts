/**
 * Servidor MCP PÚBLICO (protocolo real: JSON-RPC 2.0 sobre Streamable HTTP,
 * vía @modelcontextprotocol/sdk) — sin autenticación, solo herramientas de
 * LECTURA sobre contenido ya publicado: Artículos/Notas y áreas de práctica
 * (Servicios). Pensado para que cualquier cliente MCP real (Claude Desktop,
 * otros agentes) consulte el sitio dándole esta URL manualmente.
 *
 * Distinto y separado de app/api/mcp/route.ts (el MCP PRIVADO para
 * automatizar la creación/edición/borrado de posts desde WhatsApp, protocolo
 * propio, protegido por secreto de webhook + JWT — ver ese archivo).
 *
 * Servidor stateless: se crea una instancia nueva de McpServer + transporte
 * por cada request (sessionIdGenerator: undefined), sin estado compartido
 * entre invocaciones — encaja con el modelo serverless de Next.js.
 */
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { getDb } from "@/lib/db";
import { getSiteTexts } from "@/lib/content";
import { isLocale, defaultLocale } from "@/lib/i18n";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:mcp-public");

const SERVICE_COUNT = 10;

function buildServer(): McpServer {
  const server = new McpServer({
    name: "economy-and-fair-competition-public",
    version: "1.0.0",
  });

  server.registerTool(
    "list_posts",
    {
      title: "Listar Artículos y Notas publicados",
      description:
        "Devuelve las publicaciones (Artículos y Notas) ya publicadas del sitio de Economy and Fair Competition, ordenadas de la más reciente a la más antigua.",
      inputSchema: {
        locale: z.enum(["es", "en"]).optional().describe("Idioma del título (por defecto es)"),
        postType: z.enum(["articulo", "nota"]).optional().describe("Filtrar solo por Artículos o solo por Notas"),
        limit: z.number().int().min(1).max(50).optional().describe("Máximo de resultados (por defecto 20)"),
      },
    },
    async ({ locale: rawLocale, postType, limit }) => {
      const locale = isLocale(rawLocale ?? "") ? rawLocale! : defaultLocale;
      const db = await getDb();
      const filter: Record<string, unknown> = { status: "published" };
      if (postType) filter.postType = postType;

      const docs = await db
        .collection("posts")
        .find(filter)
        .sort({ publishedAt: -1 })
        .limit(limit ?? 20)
        .toArray();

      const posts = docs.map((doc) => ({
        id: String(doc._id),
        slug: doc.slug,
        title: locale === "en" ? doc.titleEn : doc.titleEs,
        summary: (locale === "en" ? doc.summaryEn : doc.summaryEs) ?? null,
        postType: doc.postType,
        category: doc.category,
        tags: doc.tags ?? [],
        publishedAt: doc.publishedAt,
      }));

      return { content: [{ type: "text", text: JSON.stringify({ posts }, null, 2) }] };
    }
  );

  server.registerTool(
    "get_post_detail",
    {
      title: "Obtener el detalle de un Artículo o Nota",
      description:
        "Devuelve el título, resumen y contenido en Markdown de un Artículo/Nota publicado, buscado por slug (recomendado) o por id.",
      inputSchema: {
        slug: z.string().optional().describe("Slug de la publicación (parte final de la URL pública)"),
        id: z.string().optional().describe("Identificador de Mongo de la publicación"),
        locale: z.enum(["es", "en"]).optional().describe("Idioma del contenido (por defecto es)"),
      },
    },
    async ({ slug, id, locale: rawLocale }) => {
      if (!slug && !id) {
        return {
          content: [{ type: "text", text: "Debe proporcionar 'slug' o 'id'." }],
          isError: true,
        };
      }

      const locale = isLocale(rawLocale ?? "") ? rawLocale! : defaultLocale;
      const db = await getDb();
      const { ObjectId } = await import("mongodb");
      const filter = slug ? { slug, status: "published" } : { _id: new ObjectId(id!), status: "published" };
      const doc = await db.collection("posts").findOne(filter);

      if (!doc) {
        return { content: [{ type: "text", text: "Publicación no encontrada o no publicada." }], isError: true };
      }

      const blocks = locale === "en" ? doc.blocksEn : doc.blocksEs;
      const markdown = (blocks ?? [])
        .filter((b: { type: string }) => b.type === "richtext" || b.type === "twoColumn")
        .map((b: { markdown?: string }) => b.markdown ?? "")
        .filter(Boolean)
        .join("\n\n");

      const detail = {
        id: String(doc._id),
        slug: doc.slug,
        title: locale === "en" ? doc.titleEn : doc.titleEs,
        summary: (locale === "en" ? doc.summaryEn : doc.summaryEs) ?? null,
        postType: doc.postType,
        category: doc.category,
        tags: doc.tags ?? [],
        publishedAt: doc.publishedAt,
        markdown,
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/articulos-y-notas/${doc.slug}`,
      };

      return { content: [{ type: "text", text: JSON.stringify(detail, null, 2) }] };
    }
  );

  server.registerTool(
    "list_services",
    {
      title: "Listar las áreas de práctica / servicios de la firma",
      description:
        "Devuelve las áreas de práctica (servicios legales) que ofrece Economy and Fair Competition: título y descripción de cada una.",
      inputSchema: {
        locale: z.enum(["es", "en"]).optional().describe("Idioma del contenido (por defecto es)"),
      },
    },
    async ({ locale: rawLocale }) => {
      const locale = isLocale(rawLocale ?? "") ? rawLocale! : defaultLocale;
      const texts = await getSiteTexts(locale);

      const services = Array.from({ length: SERVICE_COUNT }, (_, i) => i + 1)
        .map((n) => ({
          title: texts[`services.${n}.title`],
          body: texts[`services.${n}.body`],
        }))
        .filter((s) => s.title);

      return { content: [{ type: "text", text: JSON.stringify({ services }, null, 2) }] };
    }
  );

  return server;
}

async function handle(request: Request): Promise<Response> {
  const server = buildServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // modo stateless: cada request es independiente
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    return await transport.handleRequest(request);
  } catch (error) {
    log.error({ error }, "Error inesperado en el servidor MCP público");
    return new Response(JSON.stringify({ error: "Error interno del servidor MCP." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const POST = handle;
export const GET = handle;
export const DELETE = handle;
