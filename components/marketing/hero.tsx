import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "./section-eyebrow";
import { EditableText } from "@/components/admin/editable-text";
import { EditableImage } from "@/components/admin/editable-image";
import { t } from "@/lib/content";

export function Hero({ texts }: { texts: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute -right-16 top-24 hidden h-[520px] w-[640px] overflow-hidden rounded-lg shadow-raised lg:top-32 lg:block">
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
              <EditableText
                as="dt"
                textKey={`home.hero.${stat}.value`}
                value={t(texts, `home.hero.${stat}.value`)}
                className="block font-display text-display-md font-medium text-ink"
              />
              <EditableText
                as="dd"
                textKey={`home.hero.${stat}.label`}
                value={t(texts, `home.hero.${stat}.label`)}
                className="mt-1 block text-sm text-ink-soft"
              />
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
