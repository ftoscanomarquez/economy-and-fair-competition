import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { CONTENT_SECTIONS, SECTION_LABELS, listContentItems } from "@/lib/content-items";
import { LayoutGrid } from "lucide-react";

export const metadata = { title: "Secciones" };

export default async function AdminContentIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) redirect(`/${locale}/admin/login`);

  const counts = await Promise.all(
    CONTENT_SECTIONS.map(async (section) => ({
      section,
      count: (await listContentItems(section, locale)).length,
    }))
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">Panel administrativo</p>
      <h1 className="mt-3 font-display text-display-lg font-medium text-ink">Secciones</h1>
      <p className="mt-2 text-ink-soft">
        Áreas de Especialización, Servicios e Industrias — agrega, edita, reordena o elimina los items que se
        muestran en la landing pública. Cada item abre en una ventana modal con título, imagen y detalle.
      </p>

      <div className="mt-10 flex flex-col gap-3">
        {counts.map(({ section, count }) => (
          <Link key={section} href={`/admin/content/${section}`}>
            <Card className="flex items-center gap-4 p-5 transition-all duration-300 ease-institutional hover:-translate-y-0.5 hover:border-accent-deep/40 hover:shadow-raised">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-deep">
                <LayoutGrid className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{SECTION_LABELS[section].es}</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {count} item{count === 1 ? "" : "s"}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
