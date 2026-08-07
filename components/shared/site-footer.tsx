import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-ink text-bg">
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl font-medium">
              Economy <span className="text-accent">&amp;</span> Fair Competition
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-bg/60">
              Comercio Exterior, Derecho Aduanero y Propiedad Intelectual e Industrial. Más de 28 años de
              experiencia e infraestructura global.
            </p>
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
            <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-bg/40">Contacto</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-bg/70">
              <li>
                <a href="mailto:contacto@economyandfaircompetition.com" className="hover:text-bg">
                  contacto@economyandfaircompetition.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-bg/10 pt-6 text-xs text-bg/40 sm:flex-row sm:items-center">
          <p>© {year} Economy and Fair Competition. {t("rights")}</p>
          <Link href="/admin" className="transition-colors duration-300 ease-institutional hover:text-bg/70">
            {t("admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
