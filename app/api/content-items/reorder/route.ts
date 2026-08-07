import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getServerSession } from "@/lib/session";
import { CONTENT_SECTIONS, reorderContentItems } from "@/lib/content-items";

const bodySchema = z.object({
  section: z.enum(CONTENT_SECTIONS),
  orderedIds: z.array(z.string().min(1)).min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return apiError("No autenticado.", 401);

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiError("Datos de reordenamiento inválidos.", 400);

  await reorderContentItems(parsed.data.section, parsed.data.orderedIds);
  return apiOk({ reordered: true });
}
