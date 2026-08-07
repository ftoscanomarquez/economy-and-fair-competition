import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteTexts } from "@/lib/content";
import { listContentItems } from "@/lib/content-items";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { Hero } from "@/components/marketing/hero";
import { AboutSummary } from "@/components/marketing/about-summary";
import { ValuesGrid } from "@/components/marketing/values-grid";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { ExpertiseAreas } from "@/components/marketing/expertise-areas";
import { IndustriesCarousel } from "@/components/marketing/industries-carousel";
import { GuaranteeSection } from "@/components/marketing/guarantee-section";
import { FinalCta } from "@/components/marketing/final-cta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("home") };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const texts = await getSiteTexts(locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const [servicesItems, expertiseItems, industriesItems] = await Promise.all([
    listContentItems("services", locale),
    listContentItems("expertise", locale),
    listContentItems("industries", locale),
  ]);

  return (
    <>
      <Hero texts={texts} />
      <AboutSummary texts={texts} learnMoreLabel={t("learnMore")} />
      <ValuesGrid texts={texts} />
      <ServicesGrid texts={texts} items={servicesItems} />
      <ExpertiseAreas texts={texts} items={expertiseItems} />
      <IndustriesCarousel texts={texts} items={industriesItems} />
      <GuaranteeSection texts={texts} />
      <FinalCta texts={texts} />
    </>
  );
}
