"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SectionEyebrow } from "./section-eyebrow";
import { EditableText } from "@/components/admin/editable-text";
import { DetailDialog } from "./detail-dialog";
import { MarkdownText } from "./markdown-text";
import { SERVICE_ICONS } from "./service-icons";
import { useGlobalContext } from "@/context/GlobalContext";
import { useToast } from "@/context/ToastContext";
import { t } from "@/lib/content-client";
import { cn } from "@/lib/utils";
import type { ContentItemSummary } from "@/lib/content-items";

export function ServicesGrid({
  texts,
  items,
  showHeader = true,
}: {
  texts: Record<string, string>;
  items: ContentItemSummary[];
  showHeader?: boolean;
}) {
  const [rows, setRows] = React.useState(items);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const { editMode, adminSession, editLocale } = useGlobalContext();
  const { notify } = useToast();

  const openItem = rows.find((r) => r.id === openId) ?? null;
  const openIndex = rows.findIndex((r) => r.id === openId);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/content-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "services",
          titleEs: editLocale === "es" ? "Nuevo servicio" : "",
          titleEn: editLocale === "en" ? "New service" : "",
          summaryEs: "",
          summaryEn: "",
          detailEs: "",
          detailEn: "",
          imageUrl: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo crear el servicio", description: data.error, variant: "error" });
        return;
      }
      const newItem: ContentItemSummary = {
        id: data.id,
        section: "services",
        order: rows.length,
        title: editLocale === "en" ? "New service" : "Nuevo servicio",
        summary: "",
        detail: "",
        imageUrl: null,
      };
      setRows((prev) => [...prev, newItem]);
      setOpenId(newItem.id);
    } catch (error) {
      notify({
        title: "Error de conexión al crear el servicio",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <section id="servicios" className="border-b border-border bg-bg-soft">
      <div className="mx-auto max-w-content px-6 py-24">
        {showHeader ? (
          <div className="max-w-2xl">
            <SectionEyebrow>
              <EditableText textKey="services.eyebrow" value={t(texts, "services.eyebrow")} />
            </SectionEyebrow>
            <EditableText
              as="h2"
              textKey="services.title"
              value={t(texts, "services.title")}
              className="mt-5 block font-display text-display-xl font-medium text-ink"
            />
            <EditableText
              as="p"
              textKey="services.subtitle"
              value={t(texts, "services.subtitle")}
              className="mt-4 block text-lg leading-relaxed text-ink-soft"
            />
          </div>
        ) : null}

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((item, index) => {
            const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length]!;
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
                className={cn("flex h-full flex-col", !editMode && "cursor-pointer transition-all duration-300 ease-institutional hover:-translate-y-1 hover:border-accent-deep/40 hover:shadow-raised")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-deep">
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-accent-deep">CAP. 10.{index + 1}</span>
                  </div>
                  <CardTitle asChild className="text-lg leading-snug">
                    <div>
                      <MarkdownText
                        text={item.title}
                        className="prose-headings:mt-0 prose-headings:mb-0 prose-p:my-0 prose-headings:font-display prose-headings:text-ink prose-headings:text-lg"
                        plainClassName="block font-display text-lg font-medium leading-snug text-ink"
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownText text={item.summary} className="text-sm leading-relaxed text-ink-soft" />
                  {!editMode ? (
                    <span className="mt-3 inline-block text-sm font-medium text-accent-deep">Ver detalle →</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenId(item.id)}
                      className="mt-3 inline-block text-sm font-medium text-accent-deep"
                    >
                      Editar →
                    </button>
                  )}
                </CardContent>
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
              {creating ? "Creando…" : "Agregar servicio"}
            </button>
          ) : null}
        </div>
      </div>

      <DetailDialog
        key={openId}
        open={openId !== null}
        onOpenChange={(open) => !open && setOpenId(null)}
        item={openItem}
        eyebrow={openIndex >= 0 ? `CAP. 10.${openIndex + 1}` : undefined}
        onUpdated={(updated) => setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
        onDeleted={(id) => setRows((prev) => prev.filter((r) => r.id !== id))}
      />
    </section>
  );
}
