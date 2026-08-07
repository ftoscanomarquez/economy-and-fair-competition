import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BLOCK_TYPE_LABELS, type BlockType } from "@/lib/blocks/schema";
import { Plus, LayoutTemplate } from "lucide-react";

export const metadata = { title: "Plantillas" };

export default async function TemplatesListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) redirect(`/${locale}/admin/login`);

  const db = await getDb();
  const templates = await db.collection("templates").find({}).sort({ name: 1 }).toArray();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">Panel administrativo</p>
          <h1 className="mt-3 font-display text-display-lg font-medium text-ink">Plantillas</h1>
          <p className="mt-2 text-ink-soft">
            Estructuras de bloques reutilizables para Artículos y Notas. La misma plantilla sirve para ES/EN.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/admin/templates/new">
            <Plus className="h-4 w-4" />
            Nueva plantilla
          </Link>
        </Button>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        {templates.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <LayoutTemplate className="mx-auto h-8 w-8 text-ink-faint" />
            <p className="mt-3 text-sm text-ink-soft">Aún no hay plantillas. Crea la primera para empezar.</p>
          </Card>
        ) : (
          templates.map((template) => (
            <Link key={String(template._id)} href={`/admin/templates/${String(template._id)}`}>
              <Card className="flex items-center gap-4 p-5 transition-all duration-300 ease-institutional hover:-translate-y-0.5 hover:border-accent-deep/40 hover:shadow-raised">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-deep">
                  <LayoutTemplate className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{template.name}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {(template.blocks as { type: BlockType }[])
                      .map((b) => BLOCK_TYPE_LABELS[b.type].es)
                      .join(" · ")}
                  </p>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
