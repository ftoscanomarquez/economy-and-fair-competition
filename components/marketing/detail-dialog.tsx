"use client";

/**
 * Modal de detalle compartido por Áreas de Especialización, Servicios e
 * Industrias — formato fijo pedido por el usuario: **Título arriba, Imagen
 * de alto impacto debajo, y un bloque de texto al final** (Markdown
 * auto-detectado al guardar, vía looksLikeMarkdown). El contenido vive en
 * la colección content_items (lib/content-items.ts), no en site_texts — el
 * admin agrega y elimina items libremente desde /admin/content/[section],
 * no desde aquí.
 *
 * En modo edición, el header (título del panel + botones Editar/Eliminar) es
 * un bloque `shrink-0` fuera del contenedor con scroll: antes vivía dentro
 * del área scrolleable y desaparecía al avanzar hacia abajo en el contenido
 * largo (bug reportado por el usuario). El formulario de edición reemplaza
 * la vista de lectura completa mientras está activo.
 */
import * as React from "react";
import Image from "next/image";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGlobalContext } from "@/context/GlobalContext";
import { useToast } from "@/context/ToastContext";
import { MarkdownText } from "./markdown-text";
import type { ContentItemSummary } from "@/lib/content-items";
import { SECTION_UPLOAD_FOLDER } from "@/lib/content-items-shared";
import { cn } from "@/lib/utils";

export function DetailDialog({
  open,
  onOpenChange,
  item,
  eyebrow,
  onUpdated,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentItemSummary | null;
  eyebrow?: string;
  /** Notifica al padre (grilla) que el item cambió, para refrescar sin recargar toda la página. */
  onUpdated?: (item: ContentItemSummary) => void;
  onDeleted?: (id: string) => void;
}) {
  const { editMode, adminSession, editLocale } = useGlobalContext();
  const { notify } = useToast();
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState(item?.title ?? "");
  const [draftSummary, setDraftSummary] = React.useState(item?.summary ?? "");
  const [draftDetail, setDraftDetail] = React.useState(item?.detail ?? "");
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [draftImageUrl, setDraftImageUrl] = React.useState<string | null>(item?.imageUrl ?? null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const canEdit = editMode && adminSession;

  function startEditing() {
    if (!item) return;
    setDraftTitle(item.title);
    setDraftSummary(item.summary);
    setDraftDetail(item.detail);
    setDraftImageUrl(item.imageUrl);
    setEditing(true);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !item) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", SECTION_UPLOAD_FOLDER[item.section]);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo subir la imagen", description: data.error, variant: "error" });
        return;
      }
      setDraftImageUrl(data.url);
    } catch (error) {
      notify({
        title: "Error de conexión al subir la imagen",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    try {
      const field = (base: "title" | "summary" | "detail") =>
        editLocale === "en" ? (`${base}En` as const) : (`${base}Es` as const);

      const body: Record<string, string | null> = {
        [field("title")]: draftTitle,
        [field("summary")]: draftSummary,
        [field("detail")]: draftDetail,
        imageUrl: draftImageUrl,
      };

      const res = await fetch(`/api/content-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo guardar", description: data.error, variant: "error" });
        return;
      }

      notify({ title: "Guardado" });
      setEditing(false);
      onUpdated?.({
        ...item,
        title: draftTitle,
        summary: draftSummary,
        detail: draftDetail,
        imageUrl: draftImageUrl,
      });
    } catch (error) {
      notify({
        title: "Error de conexión al guardar",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (!window.confirm(`¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/content-items/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo eliminar", description: data.error, variant: "error" });
        return;
      }
      notify({ title: "Eliminado" });
      onDeleted?.(item.id);
      onOpenChange(false);
    } catch (error) {
      notify({
        title: "Error de conexión al eliminar",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden p-0">
        {item ? (
          <>
            {canEdit ? (
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface-raised px-6 py-3">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">
                  {editing ? "Editando" : "Vista previa"}
                </span>
                <div className="flex items-center gap-2">
                  {editing ? (
                    <>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                        <X className="h-4 w-4" aria-hidden="true" />
                        Cancelar
                      </Button>
                      <Button type="button" size="sm" variant="accent" onClick={handleSave} disabled={saving}>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {saving ? "Guardando…" : "Guardar"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        {deleting ? "Eliminando…" : "Eliminar"}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={startEditing}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Editar contenido
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto">
              <div className="p-8 pb-0">
                {eyebrow ? <span className="mb-2 block font-mono text-xs text-accent-deep">{eyebrow}</span> : null}
                {editing ? (
                  <DialogTitle className="mb-4">
                    <Input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="font-display text-xl font-medium"
                      aria-label="Título"
                    />
                  </DialogTitle>
                ) : (
                  <DialogTitle className="mb-4" asChild>
                    <div>
                      <MarkdownText
                        text={item.title}
                        stripLeadingH1
                        className="prose-headings:mt-0 prose-headings:mb-0 prose-p:my-0 prose-headings:font-display prose-headings:text-ink"
                        plainClassName="font-display text-display-md font-medium text-ink"
                      />
                    </div>
                  </DialogTitle>
                )}
              </div>

              <div className="relative mt-6 aspect-[16/9] w-full shrink-0 bg-ink/5">
                {(editing ? draftImageUrl : item.imageUrl) ? (
                  <Image
                    src={(editing ? draftImageUrl : item.imageUrl) as string}
                    alt=""
                    fill
                    className={cn("object-contain transition-opacity duration-300 ease-institutional", uploadingImage && "opacity-50")}
                    sizes="720px"
                  />
                ) : null}
                {editing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="group absolute inset-0 flex items-center justify-center gap-2 bg-ink/0 text-sm font-medium text-bg transition-all duration-300 ease-institutional hover:bg-ink/50"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      {uploadingImage ? "Subiendo…" : "Cambiar imagen"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </>
                ) : null}
              </div>

              <div className="p-8">
                {editing ? (
                  <div className="mt-4 flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">Resumen (tarjeta)</span>
                      <Textarea
                        value={draftSummary}
                        onChange={(e) => setDraftSummary(e.target.value)}
                        rows={3}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                        Detalle (se muestra en esta ventana; admite Markdown)
                      </span>
                      <Textarea
                        value={draftDetail}
                        onChange={(e) => setDraftDetail(e.target.value)}
                        rows={10}
                      />
                    </label>
                  </div>
                ) : (
                  <MarkdownText text={item.detail} className="text-ink-soft" stripLeadingH1 />
                )}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
