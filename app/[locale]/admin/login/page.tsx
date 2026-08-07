import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "@/lib/session";
import { getEnv } from "@/lib/env";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { AdminLoginForm } from "@/components/admin/login-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.login" });
  return { title: t("title") };
}

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (session) {
    redirect(`/${locale}/admin`);
  }

  const env = getEnv();
  const mailpitUiUrl = env.NODE_ENV !== "production" ? env.MAILPIT_UI_URL : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <AdminLoginForm locale={locale} mailpitUiUrl={mailpitUiUrl} />
    </div>
  );
}
