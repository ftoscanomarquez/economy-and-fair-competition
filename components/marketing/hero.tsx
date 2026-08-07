import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "./section-eyebrow";
import { EditableText } from "@/components/admin/editable-text";
import { EditableImage } from "@/components/admin/editable-image";
import { t } from "@/lib/content";

export function Hero({ texts }: { texts: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute -right-16 top-1/2 hidden h-[520px] w-[640px] -translate-y-1/2 overflow-hidden rounded-lg shadow-raised lg:block">
        <EditableImage
          textKey="home.hero.image"
          value={t(texts, "home.hero.image")}
          alt="Economy and Fair Competition"
          className="h-full w-full"
          sizes="640px"
        />
      </div>

      <div className="pointer-events-none relative mx-auto flex max-w-content flex-col gap-10 px-6 py-24 lg:py-32 [&>*]:pointer-events-auto">
        <div className="max-w-3xl animate-fade-up lg:max-w-xl">
          <SectionEyebrow>
            <EditableText textKey="home.hero.eyebrow" value={t(texts, "home.hero.eyebrow")} />
          </SectionEyebrow>
          <EditableText
            as="h1"
            textKey="home.hero.title"
            value={t(texts, "home.hero.title")}
            className="mt-5 block font-display text-display-2xl font-medium text-ink"
          />
          <EditableText
            as="p"
            textKey="home.hero.subtitle"
            value={t(texts, "home.hero.subtitle")}
            multiline
            className="mt-6 block max-w-2xl text-lg leading-relaxed text-ink-soft"
          />

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="accent">
              <Link href="/contacto">{t(texts, "home.hero.ctaPrimary")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/servicios">{t(texts, "home.hero.ctaSecondary")}</Link>
            </Button>
          </div>
        </div>

        <dl className="grid animate-fade-up grid-cols-1 gap-8 border-t border-border pt-10 sm:grid-cols-3 lg:max-w-2xl">
          {(["stat1", "stat2", "stat3"] as const).map((stat) => (
            <div key={stat}>
              <dt className="font-display text-display-md font-medium text-ink">
                {t(texts, `home.hero.${stat}.value`)}
              </dt>
              <dd className="mt-1 text-sm text-ink-soft">{t(texts, `home.hero.${stat}.label`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
