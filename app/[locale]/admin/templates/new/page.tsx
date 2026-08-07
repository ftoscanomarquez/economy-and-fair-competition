import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { TemplateForm } from "@/components/admin/template-form";

export const metadata = { title: "Nueva plantilla" };

export default async function NewTemplatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) redirect(`/${locale}/admin/login`);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">Panel administrativo</p>
      <h1 className="mt-3 font-display text-display-lg font-medium text-ink">Nueva plantilla</h1>

      <div className="mt-10">
        <TemplateForm locale={locale} />
      </div>
    </div>
  );
}
