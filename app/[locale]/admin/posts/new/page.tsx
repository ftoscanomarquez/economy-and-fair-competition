import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { PostForm } from "@/components/admin/post-form";
import type { TemplateBlock } from "@/lib/blocks/schema";

export const metadata = { title: "Nueva publicación" };

export default async function NewPostPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) redirect(`/${locale}/admin/login`);

  const db = await getDb();
  const templateDocs = await db.collection("templates").find({}).sort({ name: 1 }).toArray();
  const templates = templateDocs.map((doc) => ({
    id: String(doc._id),
    name: doc.name as string,
    blocks: doc.blocks as TemplateBlock[],
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">Panel administrativo</p>
      <h1 className="mt-3 font-display text-display-lg font-medium text-ink">Nueva publicación</h1>

      {templates.length === 0 ? (
        <p className="mt-8 text-ink-soft">
          No hay plantillas disponibles. Crea una primero en{" "}
          <a href={`/${locale}/admin/templates/new`} className="text-accent-deep underline">
            Plantillas
          </a>
          .
        </p>
      ) : (
        <div className="mt-10">
          <PostForm locale={locale} templates={templates} />
        </div>
      )}
    </div>
  );
}
