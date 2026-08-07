"use client";

import * as React from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, Pencil, PencilOff, PanelRight, Languages, Sparkles, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/GlobalContext";
import { useToast } from "@/context/ToastContext";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AdminToolbar({
  locale,
  onOpenDrawer,
}: {
  locale: string;
  onOpenDrawer: () => void;
}) {
  const nextRouter = useNextRouter();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("admin.toolbar");
  const { notify } = useToast();
  const { editMode, setEditMode, adminSession, editLocale, setEditLocale } = useGlobalContext();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    nextRouter.push(`/${locale}`);
    nextRouter.refresh();
  }

  function handleLanguageSwitch(target: Locale) {
    setEditLocale(target);
    router.push(pathname, { locale: target });
  }

  return (
    <div className="sticky top-0 z-[60] border-b border-ink/10 bg-ink text-bg">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-bg/50">{t("modeLabel")}</span>
          {adminSession ? <span className="text-xs text-bg/70">{adminSession.email}</span> : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded border border-bg/15 p-1">
            <Languages className="ml-1.5 h-3.5 w-3.5 text-bg/50" aria-hidden="true" />
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleLanguageSwitch(l)}
                className={cn(
                  "rounded-sm px-2.5 py-1 font-mono text-xs uppercase transition-colors duration-300 ease-institutional",
                  editLocale === l ? "bg-bg text-ink" : "text-bg/60 hover:text-bg"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <Button
            type="button"
            size="sm"
            variant={editMode ? "accent" : "outline"}
            className={cn(!editMode && "border-bg/20 text-bg hover:border-bg hover:bg-bg/10")}
            onClick={() => {
              setEditMode(!editMode);
              notify({
                title: editMode ? t("editionDisabled") : t("editionEnabled"),
                description: editMode
                  ? undefined
                  : t("editingIn", { language: editLocale === "es" ? t("spanish") : t("english") }),
              });
            }}
          >
            {editMode ? <PencilOff className="h-4 w-4" aria-hidden="true" /> : <Pencil className="h-4 w-4" aria-hidden="true" />}
            {editMode ? t("exitEdit") : t("editContent")}
          </Button>

          {editMode ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-bg/50 hover:bg-bg/10 hover:text-bg/70"
              onClick={() =>
                notify({
                  title: t("aiAssistantTitle"),
                  description: t("aiAssistantBody"),
                })
              }
              aria-label={t("aiAssistantLabel")}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("aiAssistant")}
            </Button>
          ) : null}

          <Button asChild type="button" size="sm" variant="ghost" className="text-bg hover:bg-bg/10">
            <Link href="/admin/templates">
              <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
              Plantillas
            </Link>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-bg hover:bg-bg/10"
            onClick={onOpenDrawer}
          >
            <PanelRight className="h-4 w-4" aria-hidden="true" />
            {t("management")}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-bg hover:bg-bg/10"
            onClick={handleLogout}
            aria-label={t("logout")}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
