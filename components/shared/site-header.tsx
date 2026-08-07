"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

const NAV_ITEMS = [
  { href: "/", key: "home" as const },
  { href: "/quienes-somos", key: "about" as const },
  { href: "/servicios", key: "services" as const },
  { href: "/articulos-y-notas", key: "articles" as const },
  { href: "/contacto", key: "contact" as const },
];

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const otherLocale: Locale = locale === "es" ? "en" : "es";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-20 max-w-content items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-medium tracking-tight text-ink">
          <Image src="/logo-eafc.png" alt="" width={32} height={32} className="h-8 w-8" priority />
          Economy <span className="text-accent-deep">&amp;</span> Fair Competition
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-ink-soft transition-colors duration-300 ease-institutional hover:text-ink",
                pathname === item.href && "text-ink"
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href={pathname}
            locale={otherLocale}
            className="rounded border border-ink/15 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft transition-colors duration-300 ease-institutional hover:border-ink hover:text-ink"
            aria-label={`Switch to ${otherLocale === "es" ? "Español" : "English"}`}
          >
            {otherLocale}
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded text-ink lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen ? (
        <nav
          className="border-t border-border bg-bg px-6 py-4 lg:hidden animate-in fade-in slide-in-from-top-2"
          aria-label="Principal (móvil)"
        >
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded px-3 py-3 text-sm font-medium text-ink-soft transition-colors duration-300 ease-institutional hover:bg-ink/5 hover:text-ink"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-border pt-3">
              <Link
                href={pathname}
                locale={otherLocale}
                className="block rounded px-3 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft"
              >
                {otherLocale === "es" ? "Español" : "English"}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
