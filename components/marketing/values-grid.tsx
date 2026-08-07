import { Card } from "@/components/ui/card";
import { SectionEyebrow } from "./section-eyebrow";
import { EditableText } from "@/components/admin/editable-text";
import { t } from "@/lib/content";

const VALUE_KEYS = [
  "integrity",
  "responsibility",
  "experience",
  "excellence",
  "commitment",
  "quality",
  "professionalism",
  "proactive",
] as const;

export function ValuesGrid({ texts }: { texts: Record<string, string> }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-content px-6 py-24">
        <div className="max-w-2xl">
          <SectionEyebrow>
            <EditableText textKey="values.eyebrow" value={t(texts, "values.eyebrow")} />
          </SectionEyebrow>
          <EditableText
            as="h2"
            textKey="values.title"
            value={t(texts, "values.title")}
            className="mt-5 block font-display text-display-xl font-medium text-ink"
          />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_KEYS.map((key) => (
            <Card
              key={key}
              className="group p-6 transition-all duration-300 ease-institutional hover:-translate-y-1 hover:border-accent-deep/40 hover:shadow-raised"
            >
              <span
                aria-hidden="true"
                className="block h-8 w-8 rounded-full border border-accent-deep/30 bg-accent-soft/50 transition-colors duration-300 ease-institutional group-hover:bg-accent-soft"
              />
              <EditableText
                as="h3"
                textKey={`values.${key}.title`}
                value={t(texts, `values.${key}.title`)}
                className="mt-4 block font-display text-lg font-medium text-ink"
              />
              <EditableText
                as="p"
                textKey={`values.${key}.body`}
                value={t(texts, `values.${key}.body`)}
                multiline
                className="mt-2 block text-sm leading-relaxed text-ink-soft"
              />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
