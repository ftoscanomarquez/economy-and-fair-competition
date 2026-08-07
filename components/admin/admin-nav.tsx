"use client";

/**
 * Barra de navegación fija de las páginas /admin/* (dashboard, plantillas,
 * publicaciones) — antes estas páginas no tenían forma de volver al panel ni
 * de moverse entre secciones sin editar la URL a mano. Vive en
 * app/[locale]/admin/layout.tsx, envolviendo a todas las rutas admin excepto
 * /admin/login (que no la necesita).
 */
import { useRouter as useNextRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, FileText, LayoutTemplate, LayoutGrid, FolderOpen, ExternalLink, LogOut } from "lucide-react";
import { usePathname, Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AdminNav({ locale }: { locale: string }) {
  const nextRouter = useNextRouter();
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  // /admin/login no tiene sesión todavía — no tiene sentido mostrar navegación
  // ni el botón de cerrar sesión ahí.
  if (pathname === "/admin/login") return null;

  const links = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/posts", label: t("posts"), icon: FileText },
    { href: "/admin/templates", label: t("templates"), icon: LayoutTemplate },
    { href: "/admin/content", label: t("content"), icon: LayoutGrid },
    { href: "/admin/files", label: t("files"), icon: FolderOpen },
  ] as const;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    nextRouter.push(`/${locale}`);
    nextRouter.refresh();
  }

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-surface-raised">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-3">
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-300 ease-institutional",
                  isActive ? "bg-accent-soft text-accent-deep" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-soft transition-colors duration-300 ease-institutional hover:bg-ink/5 hover:text-ink"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            {t("backToSite")}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t("logout")}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-soft transition-colors duration-300 ease-institutional hover:bg-ink/5 hover:text-ink"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
