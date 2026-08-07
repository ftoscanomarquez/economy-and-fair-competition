import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "./section-eyebrow";
import { EditableText } from "@/components/admin/editable-text";
import { t } from "@/lib/content";

export function AboutSummary({ texts, learnMoreLabel }: { texts: Record<string, string>; learnMoreLabel: string }) {
  return (
    <section className="border-b border-border bg-bg-soft">
      <div className="mx-auto max-w-content px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionEyebrow>
              <EditableText textKey="about.eyebrow" value={t(texts, "about.eyebrow")} />
            </SectionEyebrow>
            <EditableText
              as="h2"
              textKey="about.title"
              value={t(texts, "about.title")}
              className="mt-5 block font-display text-display-xl font-medium text-ink"
            />
            <Button asChild variant="link" className="mt-6 px-0">
              <Link href="/quienes-somos">{learnMoreLabel} →</Link>
            </Button>
          </div>

          <EditableText
            as="p"
            textKey="about.summary"
            value={t(texts, "about.summary")}
            multiline
            className="block text-lg leading-relaxed text-ink-soft"
          />
        </div>

        <div className="mt-16 grid gap-8 border-t border-border pt-12 sm:grid-cols-2">
          <div>
            <EditableText
              as="h3"
              textKey="mission.title"
              value={t(texts, "mission.title")}
              className="block font-display text-display-md font-medium text-ink"
            />
            <EditableText
              as="p"
              textKey="mission.body"
              value={t(texts, "mission.body")}
              multiline
              className="mt-3 block leading-relaxed text-ink-soft"
            />
          </div>
          <div>
            <EditableText
              as="h3"
              textKey="vision.title"
              value={t(texts, "vision.title")}
              className="block font-display text-display-md font-medium text-ink"
            />
            <EditableText
              as="p"
              textKey="vision.body"
              value={t(texts, "vision.body")}
              multiline
              className="mt-3 block leading-relaxed text-ink-soft"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
