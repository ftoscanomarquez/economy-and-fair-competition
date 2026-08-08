import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EditableText } from "@/components/admin/editable-text";
import { getSiteTexts } from "@/lib/content";
import { t } from "@/lib/content-client";
import type { Locale } from "@/lib/i18n";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const texts = await getSiteTexts(locale);
  const nav = await getTranslations({ locale, namespace: "nav" });
  const footer = await getTranslations({ locale, namespace: "footer" });
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-ink text-bg">
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <EditableText
              as="p"
              textKey="footer.brand"
              value={t(texts, "footer.brand")}
              className="font-display text-xl font-medium"
            />
            <EditableText
              as="p"
              textKey="footer.tagline"
              value={t(texts, "footer.tagline")}
              multiline
              className="mt-4 block max-w-sm text-sm leading-relaxed text-bg/60"
            />
          </div>

          <div>
            <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-bg/40">{nav("home")}</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li><Link href="/quienes-somos" className="text-bg/70 hover:text-bg">{nav("about")}</Link></li>
              <li><Link href="/servicios" className="text-bg/70 hover:text-bg">{nav("services")}</Link></li>
              <li><Link href="/articulos-y-notas" className="text-bg/70 hover:text-bg">{nav("articles")}</Link></li>
              <li><Link href="/contacto" className="text-bg/70 hover:text-bg">{nav("contact")}</Link></li>
            </ul>
          </div>

          <div>
            <EditableText
              as="p"
              textKey="footer.contactLabel"
              value={t(texts, "footer.contactLabel")}
              className="font-mono text-eyebrow uppercase tracking-[0.14em] text-bg/40"
            />
            <ul className="mt-4 flex flex-col gap-3 text-sm text-bg/70">
              <li>
                <a href={`mailto:${t(texts, "contact.direct.email")}`} className="hover:text-bg">
                  {t(texts, "contact.direct.email")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-bg/10 pt-6 text-xs text-bg/40 sm:flex-row sm:items-center">
          <p>© {year} Economy and Fair Competition. {footer("rights")}</p>
          <Link href="/admin" className="transition-colors duration-300 ease-institutional hover:text-bg/70">
            {footer("admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
