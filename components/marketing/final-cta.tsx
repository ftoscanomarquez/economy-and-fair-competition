import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/admin/editable-text";
import { t } from "@/lib/content";

export function FinalCta({ texts }: { texts: Record<string, string> }) {
  return (
    <section>
      <div className="mx-auto max-w-content px-6 py-24 text-center">
        <EditableText
          as="h2"
          textKey="home.cta.title"
          value={t(texts, "home.cta.title")}
          className="block font-display text-display-lg font-medium text-ink"
        />
        <EditableText
          as="p"
          textKey="home.cta.body"
          value={t(texts, "home.cta.body")}
          multiline
          className="mx-auto mt-4 block max-w-xl text-lg leading-relaxed text-ink-soft"
        />
        <Button asChild size="lg" variant="accent" className="mt-8">
          <Link href="/contacto">{t(texts, "home.cta.button")}</Link>
        </Button>
      </div>
    </section>
  );
}
