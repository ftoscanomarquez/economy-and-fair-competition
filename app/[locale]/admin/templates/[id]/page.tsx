import { redirect, notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { TemplateForm } from "@/components/admin/template-form";
import type { TemplateBlock } from "@/lib/blocks/schema";

export const metadata = { title: "Editar plantilla" };

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) redirect(`/${locale}/admin/login`);

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    notFound();
  }

  const db = await getDb();
  const template = await db.collection("templates").findOne({ _id: objectId });
  if (!template) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">Panel administrativo</p>
      <h1 className="mt-3 font-display text-display-lg font-medium text-ink">Editar plantilla</h1>

      <div className="mt-10">
        <TemplateForm
          locale={locale}
          templateId={id}
          initialName={template.name}
          initialBlocks={template.blocks as TemplateBlock[]}
        />
      </div>
    </div>
  );
}
