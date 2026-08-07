import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { templateBlockSchema } from "@/lib/blocks/schema";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:templates");

export async function GET() {
  const db = await getDb();
  const docs = await db.collection("templates").find({}).sort({ name: 1 }).toArray();

  return apiOk({
    templates: docs.map((doc) => ({
      id: String(doc._id),
      name: doc.name,
      blocks: doc.blocks,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })),
  });
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  blocks: z.array(templateBlockSchema).min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return apiError("Datos de plantilla inválidos.", 400);

  const db = await getDb();
  const result = await db.collection("templates").insertOne({
    name: parsed.data.name,
    blocks: parsed.data.blocks,
    createdAt: new Date(),
    updatedAt: null,
    createdBy: session.email,
  });

  log.info({ id: result.insertedId, email: session.email }, "Plantilla creada");
  return apiOk({ id: String(result.insertedId) }, 201);
}
