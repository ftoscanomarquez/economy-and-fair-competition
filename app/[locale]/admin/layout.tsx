import { AdminNav } from "@/components/admin/admin-nav";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  return (
    <div className="min-h-screen bg-bg-soft">
      <AdminNav locale={locale} />
      {children}
    </div>
  );
}
