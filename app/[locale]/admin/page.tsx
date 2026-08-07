import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "@/lib/session";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.dashboard" });
  return { title: t("title") };
}

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  const t = await getTranslations({ locale, namespace: "admin.dashboard" });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">{t("eyebrow")}</p>
      <h1 className="mt-3 font-display text-display-lg font-medium text-ink">
        {t("welcome", { email: session.email })}
      </h1>
      <p className="mt-3 text-ink-soft">{t("instructions")}</p>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>{t("liveEditTitle")}</CardTitle>
          <CardDescription>{t("liveEditDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="accent">
            <Link href="/">{t("goToLanding")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
