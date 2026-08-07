/**
 * CRUD de items administrables de Áreas de Especialización, Servicios e
 * Industrias (lib/content-items.ts). GET es público (alimenta las 3 grillas
 * de la landing); POST requiere sesión admin.
 */
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { isLocale, defaultLocale } from "@/lib/i18n";
import {
  CONTENT_SECTIONS,
  listContentItems,
  createContentItem,
  type ContentSection,
} from "@/lib/content-items";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sectionParam = searchParams.get("section");
  const localeParam = searchParams.get("locale") ?? defaultLocale;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  if (!sectionParam || !CONTENT_SECTIONS.includes(sectionParam as ContentSection)) {
    return apiError("Parámetro 'section' inválido o ausente.", 400);
  }

  const items = await listContentItems(sectionParam as ContentSection, locale);
  return apiOk({ items });
}

const createSchema = z
  .object({
    section: z.enum(CONTENT_SECTIONS),
    titleEs: z.string().default(""),
    titleEn: z.string().default(""),
    summaryEs: z.string().default(""),
    summaryEn: z.string().default(""),
    detailEs: z.string().default(""),
    detailEn: z.string().default(""),
    imageUrl: z.string().nullable().default(null),
  })
  .refine((data) => data.titleEs.trim() || data.titleEn.trim(), {
    message: "El título debe tener contenido en al menos un idioma.",
  });

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return apiError("Datos de item inválidos.", 400);

  const { section, ...input } = parsed.data;
  const id = await createContentItem(section, input);
  return apiOk({ id }, 201);
}
