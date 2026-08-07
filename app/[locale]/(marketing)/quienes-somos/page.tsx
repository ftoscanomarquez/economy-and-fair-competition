import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getSiteTexts } from "@/lib/content";
import { t } from "@/lib/content-client";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { ValuesGrid } from "@/components/marketing/values-grid";
import { FinalCta } from "@/components/marketing/final-cta";
import { AboutVisual } from "@/components/marketing/about-visual";
import { EditableText } from "@/components/admin/editable-text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("about") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const texts = await getSiteTexts(locale);

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-content px-6 py-20">
          <SectionEyebrow>
            <EditableText textKey="about.eyebrow" value={t(texts, "about.eyebrow")} />
          </SectionEyebrow>
          <EditableText
            as="h1"
            textKey="about.title"
            value={t(texts, "about.title")}
            className="mt-5 block max-w-3xl font-display text-display-xl font-medium text-ink"
          />
          <EditableText
            as="p"
            textKey="about.summary"
            value={t(texts, "about.summary")}
            multiline
            className="mt-6 block max-w-2xl text-lg leading-relaxed text-ink-soft"
          />
        </div>
      </section>

      <section className="border-b border-border bg-bg-soft">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[0.5fr_1fr_0.5fr]">
            <EditableText
              as="h2"
              textKey="about.history.title"
              value={t(texts, "about.history.title")}
              className="block font-display text-display-lg font-medium text-ink"
            />
            <EditableText
              as="p"
              textKey="about.history.body"
              value={t(texts, "about.history.body")}
              multiline
              className="block max-w-prose whitespace-pre-line text-lg leading-loose text-ink-soft"
            />
            <div className="hidden items-start justify-center lg:flex">
              <AboutVisual className="w-full max-w-[240px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <EditableText
                as="h2"
                textKey="mission.title"
                value={t(texts, "mission.title")}
                className="block font-display text-display-md font-medium text-ink"
              />
              <EditableText
                as="p"
                textKey="mission.body"
                value={t(texts, "mission.body")}
                multiline
                className="mt-4 block leading-relaxed text-ink-soft"
              />
            </div>
            <div>
              <EditableText
                as="h2"
                textKey="vision.title"
                value={t(texts, "vision.title")}
                className="block font-display text-display-md font-medium text-ink"
              />
              <EditableText
                as="p"
                textKey="vision.body"
                value={t(texts, "vision.body")}
                multiline
                className="mt-4 block leading-relaxed text-ink-soft"
              />
            </div>
          </div>
        </div>
      </section>

      <ValuesGrid texts={texts} />

      <section className="border-b border-border bg-bg-soft">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="max-w-2xl">
            <EditableText
              as="h2"
              textKey="about.team.title"
              value={t(texts, "about.team.title")}
              className="block font-display text-display-lg font-medium text-ink"
            />
            <EditableText
              as="p"
              textKey="about.team.body"
              value={t(texts, "about.team.body")}
              multiline
              className="mt-4 block leading-relaxed text-ink-soft"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-content px-6 py-20">
          <SectionEyebrow>ART. 302</SectionEyebrow>
          <EditableText
            as="h2"
            textKey="about.international.title"
            value={t(texts, "about.international.title")}
            className="mt-4 block max-w-2xl font-display text-display-lg font-medium text-ink"
          />

          <div className="mt-12 grid gap-12 sm:grid-cols-2">
            <div>
              <EditableText
                as="h3"
                textKey="about.international.disputes.title"
                value={t(texts, "about.international.disputes.title")}
                className="block font-display text-xl font-medium text-ink"
              />
              <EditableText
                as="p"
                textKey="about.international.disputes.body"
                value={t(texts, "about.international.disputes.body")}
                multiline
                className="mt-3 block leading-relaxed text-ink-soft"
              />
            </div>
            <div>
              <EditableText
                as="h3"
                textKey="about.international.negotiations.title"
                value={t(texts, "about.international.negotiations.title")}
                className="block font-display text-xl font-medium text-ink"
              />
              <EditableText
                as="p"
                textKey="about.international.negotiations.body"
                value={t(texts, "about.international.negotiations.body")}
                multiline
                className="mt-3 block leading-relaxed text-ink-soft"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink text-bg">
        <div className="mx-auto max-w-content px-6 py-20">
          <EditableText
            as="h2"
            textKey="about.specialization.title"
            value={t(texts, "about.specialization.title")}
            className="block font-display text-display-lg font-medium"
          />
          <EditableText
            as="p"
            textKey="about.specialization.body"
            value={t(texts, "about.specialization.body")}
            multiline
            className="mt-4 block max-w-3xl text-lg leading-relaxed text-bg/70"
          />
        </div>
      </section>

      <FinalCta texts={texts} />
    </>
  );
}
