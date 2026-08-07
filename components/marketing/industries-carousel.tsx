"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { SectionEyebrow } from "./section-eyebrow";
import { EditableText } from "@/components/admin/editable-text";
import { DetailDialog } from "./detail-dialog";
import { MarkdownText } from "./markdown-text";
import { INDUSTRY_ICONS } from "./industry-icons";
import { useGlobalContext } from "@/context/GlobalContext";
import { useToast } from "@/context/ToastContext";
import { t } from "@/lib/content-client";
import { cn } from "@/lib/utils";
import type { ContentItemSummary } from "@/lib/content-items";

export function IndustriesCarousel({ texts, items }: { texts: Record<string, string>; items: ContentItemSummary[] }) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [rows, setRows] = React.useState(items);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const { editMode, adminSession, editLocale } = useGlobalContext();
  const { notify } = useToast();

  const openItem = rows.find((r) => r.id === openId) ?? null;

  const scrollBy = (direction: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  };

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/content-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "industries",
          titleEs: editLocale === "es" ? "Nueva industria" : "",
          titleEn: editLocale === "en" ? "New industry" : "",
          summaryEs: "",
          summaryEn: "",
          detailEs: "",
          detailEn: "",
          imageUrl: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo crear la industria", description: data.error, variant: "error" });
        return;
      }
      const newItem: ContentItemSummary = {
        id: data.id,
        section: "industries",
        order: rows.length,
        title: editLocale === "en" ? "New industry" : "Nueva industria",
        summary: "",
        detail: "",
        imageUrl: null,
      };
      setRows((prev) => [...prev, newItem]);
      setOpenId(newItem.id);
    } catch (error) {
      notify({
        title: "Error de conexión al crear la industria",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="border-b border-border bg-bg-soft">
      <div className="mx-auto max-w-content px-6 py-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <SectionEyebrow>
              <EditableText textKey="industries.eyebrow" value={t(texts, "industries.eyebrow")} />
            </SectionEyebrow>
            <EditableText
              as="h2"
              textKey="industries.title"
              value={t(texts, "industries.title")}
              className="mt-5 block font-display text-display-xl font-medium text-ink"
            />
            <EditableText
              as="p"
              textKey="industries.subtitle"
              value={t(texts, "industries.subtitle")}
              className="mt-4 block text-lg leading-relaxed text-ink-soft"
            />
          </div>

          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="flex h-11 w-11 items-center justify-center rounded border border-ink/15 text-ink transition-colors duration-300 ease-institutional hover:border-ink"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="flex h-11 w-11 items-center justify-center rounded border border-ink/15 text-ink transition-colors duration-300 ease-institutional hover:border-ink"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="shrink-0 basis-[calc((100vw-1200px)/2)] max-lg:hidden" aria-hidden="true" />
        {rows.map((item, index) => {
          const Icon = INDUSTRY_ICONS[index % INDUSTRY_ICONS.length]!;
          return (
            <motion.div
              key={item.id}
              role={editMode ? undefined : "button"}
              tabIndex={editMode ? undefined : 0}
              onClick={editMode ? undefined : () => setOpenId(item.id)}
              onKeyDown={
                editMode
                  ? undefined
                  : (e) => {
                      if (e.key === "Enter" || e.key === " ") setOpenId(item.id);
                    }
              }
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className={cn(
                "flex h-40 w-64 shrink-0 cursor-pointer flex-col justify-between rounded-md border border-border bg-surface p-6 text-left shadow-card"
              )}
            >
              <Icon className="h-6 w-6 text-accent-deep/60" aria-hidden="true" />
              <div>
                <MarkdownText
                  text={item.title}
                  className="prose-headings:mt-0 prose-headings:mb-0 prose-p:my-0 prose-headings:font-display prose-headings:text-ink prose-headings:text-xl"
                  plainClassName="block font-display text-xl font-medium text-ink"
                />
                {!editMode ? (
                  <span className="mt-1 block text-xs text-accent-deep">Ver retos y soluciones →</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenId(item.id)}
                    className="mt-1 block text-xs text-accent-deep"
                  >
                    Editar →
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {editMode && adminSession ? (
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="flex h-40 w-64 shrink-0 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-accent-deep/40 text-accent-deep transition-colors duration-300 ease-institutional hover:bg-accent-soft/40"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            {creating ? "Creando…" : "Agregar industria"}
          </button>
        ) : null}
      </div>

      <DetailDialog
        key={openId}
        open={openId !== null}
        onOpenChange={(open) => !open && setOpenId(null)}
        item={openItem}
        onUpdated={(updated) => setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
        onDeleted={(id) => setRows((prev) => prev.filter((r) => r.id !== id))}
      />
    </section>
  );
}
