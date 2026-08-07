import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { getSiteTexts } from "@/lib/content";
import { isLocale, defaultLocale } from "@/lib/i18n";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:content:site-texts");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale") ?? defaultLocale;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const texts = await getSiteTexts(locale);
  return apiOk({ locale, texts });
}

const putSchema = z.object({
  key: z.string().min(1),
  es: z.string().optional(),
  en: z.string().optional(),
});

export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return apiError("No autenticado.", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return apiError("Datos de actualización inválidos.", 400);
  }

  const { key, es, en } = parsed.data;
  if (es === undefined && en === undefined) {
    return apiError("Debe proporcionar al menos un valor (es o en).", 400);
  }

  const db = await getDb();
  const update: Record<string, unknown> = { updatedAt: new Date(), updatedBy: session.email };
  if (es !== undefined) update.es = es;
  if (en !== undefined) update.en = en;

  const result = await db.collection("site_texts").updateOne({ key }, { $set: update });
  if (result.matchedCount === 0) {
    return apiError("La clave de contenido no existe.", 404);
  }

  log.info({ key, email: session.email }, "Texto de sitio actualizado");
  return apiOk({ updated: true });
}
