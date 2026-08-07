import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { AdminShell } from "@/components/admin/admin-shell";
import { getServerSession } from "@/lib/session";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const session = await getServerSession();

  const content = (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );

  if (!session) return content;

  return <AdminShell locale={locale}>{content}</AdminShell>;
}
