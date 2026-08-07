"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionEyebrow } from "./section-eyebrow";
import { EditableText } from "@/components/admin/editable-text";
import { DetailDialog } from "./detail-dialog";
import { MarkdownText } from "./markdown-text";
import { EXPERTISE_ICONS } from "./expertise-icons";
import { useGlobalContext } from "@/context/GlobalContext";
import { useToast } from "@/context/ToastContext";
import { t } from "@/lib/content-client";
import type { ContentItemSummary } from "@/lib/content-items";

export function ExpertiseAreas({ texts, items }: { texts: Record<string, string>; items: ContentItemSummary[] }) {
  const [rows, setRows] = React.useState(items);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const { editMode, adminSession, editLocale } = useGlobalContext();
  const { notify } = useToast();

  const openItem = rows.find((r) => r.id === openId) ?? null;

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/content-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "expertise",
          titleEs: editLocale === "es" ? "Nueva área" : "",
          titleEn: editLocale === "en" ? "New area" : "",
          summaryEs: "",
          summaryEn: "",
          detailEs: "",
          detailEn: "",
          imageUrl: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo crear el área", description: data.error, variant: "error" });
        return;
      }
      const newItem: ContentItemSummary = {
        id: data.id,
        section: "expertise",
        order: rows.length,
        title: editLocale === "en" ? "New area" : "Nueva área",
        summary: "",
        detail: "",
        imageUrl: null,
      };
      setRows((prev) => [...prev, newItem]);
      setOpenId(newItem.id);
    } catch (error) {
      notify({
        title: "Error de conexión al crear el área",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-content px-6 py-24">
        <div className="max-w-2xl">
          <SectionEyebrow>
            <EditableText textKey="expertise.eyebrow" value={t(texts, "expertise.eyebrow")} />
          </SectionEyebrow>
          <EditableText
            as="h2"
            textKey="expertise.title"
            value={t(texts, "expertise.title")}
            className="mt-5 block font-display text-display-xl font-medium text-ink"
          />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {rows.map((item, index) => {
            const Icon = EXPERTISE_ICONS[index % EXPERTISE_ICONS.length]!;
            return (
              <Card
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
                aria-haspopup={editMode ? undefined : "dialog"}
                className="group h-full cursor-pointer p-8 transition-all duration-300 ease-institutional hover:-translate-y-1 hover:border-accent-deep/40 hover:shadow-raised"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-soft text-accent-deep">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-3 block font-mono text-xs text-accent-deep">
                  {String.fromCharCode(65 + (index % 26))}
                </span>
                <MarkdownText
                  text={item.title}
                  className="mt-1 prose-headings:mt-0 prose-headings:mb-0 prose-p:my-0 prose-headings:font-display prose-headings:text-ink"
                  plainClassName="mt-1 block font-display text-2xl font-medium text-ink"
                />
                <MarkdownText text={item.summary} className="mt-3 block leading-relaxed text-ink-soft" />
                {!editMode ? (
                  <span className="mt-4 inline-block text-sm font-medium text-accent-deep">Ver detalle →</span>
                ) : (
                  <span className="mt-4 inline-block text-sm font-medium text-accent-deep">
                    <button type="button" onClick={() => setOpenId(item.id)}>
                      Editar →
                    </button>
                  </span>
                )}
              </Card>
            );
          })}

          {editMode && adminSession ? (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-accent-deep/40 p-8 text-accent-deep transition-colors duration-300 ease-institutional hover:bg-accent-soft/40"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              {creating ? "Creando…" : "Agregar área"}
            </button>
          ) : null}
        </div>
      </div>

      <DetailDialog
        key={openId}
        open={openId !== null}
        onOpenChange={(open) => !open && setOpenId(null)}
        item={openItem}
        eyebrow={openItem ? String.fromCharCode(65 + (rows.findIndex((r) => r.id === openItem.id) % 26)) : undefined}
        onUpdated={(updated) => setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
        onDeleted={(id) => setRows((prev) => prev.filter((r) => r.id !== id))}
      />
    </section>
  );
}
