import { SectionEyebrow } from "./section-eyebrow";
import { EditableText } from "@/components/admin/editable-text";
import { t } from "@/lib/content";

const ITEM_KEYS = ["item1", "item2", "item3"] as const;

export function GuaranteeSection({ texts }: { texts: Record<string, string> }) {
  return (
    <section className="border-b border-border bg-ink text-bg">
      <div className="mx-auto max-w-content px-6 py-24">
        <div className="max-w-2xl">
          <SectionEyebrow className="text-accent">
            <EditableText textKey="guarantee.eyebrow" value={t(texts, "guarantee.eyebrow")} />
          </SectionEyebrow>
          <EditableText
            as="h2"
            textKey="guarantee.title"
            value={t(texts, "guarantee.title")}
            className="mt-5 block font-display text-display-xl font-medium"
          />
          <EditableText
            as="p"
            textKey="guarantee.body"
            value={t(texts, "guarantee.body")}
            multiline
            className="mt-4 block text-lg leading-relaxed text-bg/70"
          />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 border-t border-bg/10 pt-12 sm:grid-cols-3">
          {ITEM_KEYS.map((key) => (
            <div key={key}>
              <EditableText
                as="h3"
                textKey={`guarantee.${key}.title`}
                value={t(texts, `guarantee.${key}.title`)}
                className="block font-display text-lg font-medium"
              />
              <EditableText
                as="p"
                textKey={`guarantee.${key}.body`}
                value={t(texts, `guarantee.${key}.body`)}
                multiline
                className="mt-2 block text-sm leading-relaxed text-bg/60"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
