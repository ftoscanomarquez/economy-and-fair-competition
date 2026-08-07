import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteTexts } from "@/lib/content";
import { listContentItems } from "@/lib/content-items";
import { t } from "@/lib/content-client";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { ExpertiseAreas } from "@/components/marketing/expertise-areas";
import { FinalCta } from "@/components/marketing/final-cta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("services") };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const texts = await getSiteTexts(locale);
  const [servicesItems, expertiseItems] = await Promise.all([
    listContentItems("services", locale),
    listContentItems("expertise", locale),
  ]);

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-content px-6 py-20">
          <SectionEyebrow>{t(texts, "services.eyebrow")}</SectionEyebrow>
          <h1 className="mt-5 max-w-3xl font-display text-display-xl font-medium text-ink">
            {t(texts, "services.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {t(texts, "services.subtitle")}
          </p>
        </div>
      </section>

      <ServicesGrid texts={texts} items={servicesItems} showHeader={false} />
      <ExpertiseAreas texts={texts} items={expertiseItems} />
      <FinalCta texts={texts} />
    </>
  );
}
