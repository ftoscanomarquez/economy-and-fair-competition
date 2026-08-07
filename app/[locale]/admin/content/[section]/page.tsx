import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ContentItemsManager } from "@/components/admin/content-items-manager";
import { CONTENT_SECTIONS, SECTION_LABELS, listContentItemsBilingual, type ContentSection } from "@/lib/content-items";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const label = CONTENT_SECTIONS.includes(section as ContentSection)
    ? SECTION_LABELS[section as ContentSection].es
    : "Secciones";
  return { title: label };
}

export default async function AdminContentSectionPage({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale: rawLocale, section: rawSection } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) redirect(`/${locale}/admin/login`);

  if (!CONTENT_SECTIONS.includes(rawSection as ContentSection)) notFound();
  const section = rawSection as ContentSection;

  const items = await listContentItemsBilingual(section);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Secciones
      </Link>

      <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">Panel administrativo</p>
      <h1 className="mt-3 font-display text-display-lg font-medium text-ink">{SECTION_LABELS[section].es}</h1>
      <p className="mt-2 text-ink-soft">
        Agrega, edita, reordena o elimina los items de esta sección. Los cambios se reflejan de inmediato en la
        landing pública.
      </p>

      <ContentItemsManager section={section} initialItems={items} />

      <Button asChild variant="link" className="mt-8 px-0">
        <Link href="/">Ver en la landing pública →</Link>
      </Button>
    </div>
  );
}
