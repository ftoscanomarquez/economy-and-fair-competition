import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Mail, Clock } from "lucide-react";
import { getSiteTexts } from "@/lib/content";
import { t } from "@/lib/content-client";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { EditableText } from "@/components/admin/editable-text";
import { ContactForm } from "@/components/marketing/contact-form";
import { StyledMap } from "@/components/marketing/styled-map";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("contact") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const texts = await getSiteTexts(locale);

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-content px-6 py-20">
        <SectionEyebrow>
          <EditableText textKey="contact.eyebrow" value={t(texts, "contact.eyebrow")} />
        </SectionEyebrow>
        <EditableText
          as="h1"
          textKey="contact.title"
          value={t(texts, "contact.title")}
          className="mt-5 block max-w-3xl font-display text-display-xl font-medium text-ink"
        />
        <EditableText
          as="p"
          textKey="contact.subtitle"
          value={t(texts, "contact.subtitle")}
          className="mt-6 block max-w-2xl text-lg leading-relaxed text-ink-soft"
        />

        <div className="mt-16 grid gap-16 lg:grid-cols-[1.2fr_1fr]">
          <ContactForm
            labels={{
              name: t(texts, "contact.form.name"),
              company: t(texts, "contact.form.company"),
              email: t(texts, "contact.form.email"),
              phone: t(texts, "contact.form.phone"),
              areaOfInterest: t(texts, "contact.form.areaOfInterest"),
              message: t(texts, "contact.form.message"),
              submit: t(texts, "contact.form.submit"),
              submitting: t(texts, "contact.form.submitting"),
              success: t(texts, "contact.form.success"),
              error: t(texts, "contact.form.error"),
            }}
          />

          <div className="flex flex-col gap-8">
            <div>
              <EditableText
                as="h2"
                textKey="contact.direct.title"
                value={t(texts, "contact.direct.title")}
                className="block font-display text-lg font-medium text-ink"
              />
              <dl className="mt-4 flex flex-col gap-4">
                <div className="relative pl-7">
                  <Mail className="absolute left-0 top-0.5 h-4 w-4 shrink-0 text-accent-deep" aria-hidden="true" />
                  <dt className="text-xs uppercase tracking-wide text-ink-faint">
                    {t(texts, "contact.direct.emailLabel")}
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${t(texts, "contact.direct.email")}`}
                      className="text-sm text-ink hover:text-accent-deep"
                    >
                      {t(texts, "contact.direct.email")}
                    </a>
                  </dd>
                </div>
                <div className="relative pl-7">
                  <Clock className="absolute left-0 top-0.5 h-4 w-4 shrink-0 text-accent-deep" aria-hidden="true" />
                  <dt className="text-xs uppercase tracking-wide text-ink-faint">
                    {t(texts, "contact.direct.hoursLabel")}
                  </dt>
                  <dd className="text-sm text-ink-soft">{t(texts, "contact.direct.hours")}</dd>
                </div>
              </dl>
            </div>

            <div className="flex-1">
              <EditableText
                as="h2"
                textKey="contact.map.title"
                value={t(texts, "contact.map.title")}
                className="mb-4 block font-display text-lg font-medium text-ink"
              />
              <StyledMap label={t(texts, "contact.map.title")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
