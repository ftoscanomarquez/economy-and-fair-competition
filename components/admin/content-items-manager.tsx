"use client";

/**
 * CRUD completo (crear, editar, reordenar, eliminar) de los items de una
 * sección de content_items (expertise/services/industries) desde el panel
 * admin — reemplaza la edición inline que existía antes directamente sobre
 * la landing pública para estas 3 secciones (decisión del usuario: quedan
 * mejor administradas como colecciones de items propias, no como texto fijo).
 *
 * Asistencia de IA (por pedido explícito del usuario):
 * - "Convertir con IA" en Detalle: si el texto no parece Markdown, ofrece
 *   estructurarlo (POST /api/ai/markdown, mismo endpoint que el editor de
 *   bloques de posts) como sugerencia editable, nunca aplicada sin confirmar.
 * - Auto-traducción ES<->EN: al salir (blur) de un campo ES con contenido,
 *   si el campo EN correspondiente está vacío, se traduce automáticamente
 *   (y viceversa) vía POST /api/ai/translate-content-item. Si el campo
 *   destino ya tiene texto, nunca se sobreescribe — la traducción solo
 *   rellena huecos, no reemplaza texto ya escrito por el admin.
 */
import * as React from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Plus, Trash2, Pencil, Check, X, ChevronUp, ChevronDown, ImageOff, Sparkles, Languages } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/context/ToastContext";
import type { ContentItemBilingual, ContentSection } from "@/lib/content-items";
import { SECTION_UPLOAD_FOLDER } from "@/lib/content-items-shared";

type Draft = {
  titleEs: string;
  titleEn: string;
  summaryEs: string;
  summaryEn: string;
  detailEs: string;
  detailEn: string;
  imageUrl: string | null;
};

function emptyDraft(): Draft {
  return { titleEs: "", titleEn: "", summaryEs: "", summaryEn: "", detailEs: "", detailEn: "", imageUrl: null };
}

const SECTION_NEW_ITEM_LABEL: Record<ContentSection, string> = {
  expertise: "Nueva área",
  services: "Nuevo servicio",
  industries: "Nueva industria",
};

export function ContentItemsManager({
  section,
  initialItems,
}: {
  section: ContentSection;
  initialItems: ContentItemBilingual[];
}) {
  const { notify } = useToast();
  const [items, setItems] = React.useState(initialItems);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Draft>(emptyDraft());
  const [saving, setSaving] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [reordering, setReordering] = React.useState(false);
  const [convertingDetail, setConvertingDetail] = React.useState<"es" | "en" | null>(null);
  const [detailSuggestion, setDetailSuggestion] = React.useState<{ locale: "es" | "en"; markdown: string } | null>(null);
  const [translating, setTranslating] = React.useState<"es-to-en" | "en-to-es" | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function startEdit(item: ContentItemBilingual) {
    setEditingId(item.id);
    setDetailSuggestion(null);
    setDraft({
      titleEs: item.titleEs,
      titleEn: item.titleEn,
      summaryEs: item.summaryEs,
      summaryEn: item.summaryEn,
      detailEs: item.detailEs,
      detailEn: item.detailEn,
      imageUrl: item.imageUrl,
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", SECTION_UPLOAD_FOLDER[section]);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo subir la imagen", description: data.error, variant: "error" });
        return;
      }
      setDraft((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      notify({
        title: "Error de conexión al subir la imagen",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/content-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          titleEs: SECTION_NEW_ITEM_LABEL[section],
          titleEn: "",
          summaryEs: "",
          summaryEn: "",
          detailEs: "",
          detailEn: "",
          imageUrl: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo crear el item", description: data.error, variant: "error" });
        return;
      }
      const newItem: ContentItemBilingual = {
        id: data.id,
        section,
        order: items.length,
        titleEs: SECTION_NEW_ITEM_LABEL[section],
        titleEn: "",
        summaryEs: "",
        summaryEn: "",
        detailEs: "",
        detailEn: "",
        imageUrl: null,
      };
      setItems((prev) => [...prev, newItem]);
      startEdit(newItem);
      notify({ title: "Item creado" });
    } catch (error) {
      notify({
        title: "Error de conexión al crear el item",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/content-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo guardar", description: data.error, variant: "error" });
        return;
      }
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...draft } : item)));
      setEditingId(null);
      setDetailSuggestion(null);
      notify({ title: "Guardado" });
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

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/content-items/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo eliminar", description: data.error, variant: "error" });
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      notify({ title: "Eliminado" });
    } catch (error) {
      notify({
        title: "Error de conexión al eliminar",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function persistOrder(nextItems: ContentItemBilingual[]) {
    setReordering(true);
    try {
      const res = await fetch("/api/content-items/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, orderedIds: nextItems.map((i) => i.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo reordenar", description: data.error, variant: "error" });
        return;
      }
    } catch (error) {
      notify({
        title: "Error de conexión al reordenar",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setReordering(false);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex]!, next[index]!];
    setItems(next);
    void persistOrder(next);
  }

  async function handleConvertDetail(locale: "es" | "en") {
    const value = locale === "es" ? draft.detailEs : draft.detailEn;
    if (!value.trim()) return;
    setConvertingDetail(locale);
    try {
      const res = await fetch("/api/ai/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo convertir con IA", description: data.error, variant: "error" });
        return;
      }
      setDetailSuggestion({ locale, markdown: data.markdown });
    } catch (error) {
      notify({
        title: "Error de conexión con la IA",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setConvertingDetail(null);
    }
  }

  function acceptDetailSuggestion() {
    if (!detailSuggestion) return;
    setDraft((prev) =>
      detailSuggestion.locale === "es" ? { ...prev, detailEs: detailSuggestion.markdown } : { ...prev, detailEn: detailSuggestion.markdown }
    );
    setDetailSuggestion(null);
    notify({ title: "Markdown aplicado" });
  }

  /**
   * Al salir de un campo ES, si el campo EN correspondiente está vacío, lo
   * traduce automáticamente (y viceversa) — nunca sobreescribe un campo que
   * ya tiene contenido, solo rellena el hueco.
   */
  async function handleAutoTranslate(field: "title" | "summary" | "detail", fromLocale: "es" | "en") {
    const sourceKey = fromLocale === "es" ? (`${field}Es` as const) : (`${field}En` as const);
    const targetKey = fromLocale === "es" ? (`${field}En` as const) : (`${field}Es` as const);
    const sourceValue = draft[sourceKey];
    const targetValue = draft[targetKey];

    if (!sourceValue.trim() || targetValue.trim()) return;

    const direction = fromLocale === "es" ? "es-to-en" : "en-to-es";
    setTranslating(direction);
    try {
      const res = await fetch("/api/ai/translate-content-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: field === "title" ? sourceValue : draft[fromLocale === "es" ? "titleEs" : "titleEn"],
          summary: field === "summary" ? sourceValue : draft[fromLocale === "es" ? "summaryEs" : "summaryEn"],
          detail: field === "detail" ? sourceValue : draft[fromLocale === "es" ? "detailEs" : "detailEn"],
          direction,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status !== 503) {
          notify({ title: "No se pudo traducir automáticamente", description: data.error, variant: "error" });
        }
        return;
      }

      // Solo aplica el campo que disparó la traducción — los otros dos campos
      // del payload eran contexto para que la traducción sea coherente, no se
      // sobreescriben aquí (cada campo se traduce solo cuando SU blur ocurre).
      setDraft((prev) => {
        if (prev[targetKey].trim()) return prev; // ya se llenó mientras tanto (otra traducción en curso)
        const translatedValue = field === "title" ? data.title : field === "summary" ? data.summary : data.detail;
        return { ...prev, [targetKey]: translatedValue };
      });
      notify({ title: `Traducido automáticamente al ${fromLocale === "es" ? "inglés" : "español"}` });
    } catch (error) {
      notify({
        title: "Error de conexión al traducir",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setTranslating(null);
    }
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <ImageOff className="mx-auto h-8 w-8 text-ink-faint" />
            <p className="mt-3 text-sm text-ink-soft">Aún no hay items en esta sección.</p>
          </Card>
        ) : (
          items.map((item, index) => {
            const isEditing = editingId === item.id;
            return (
              <Card key={item.id} className={isEditing ? "border-accent-deep/40 p-5" : "flex items-center gap-4 p-4"}>
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded bg-ink/5">
                        {draft.imageUrl ? (
                          <Image src={draft.imageUrl} alt="" fill className="object-cover" sizes="160px" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageOff className="h-6 w-6 text-ink-faint" aria-hidden="true" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="absolute inset-0 flex items-center justify-center bg-ink/0 text-xs font-medium text-bg opacity-0 transition-all duration-300 ease-institutional hover:bg-ink/50 hover:opacity-100"
                        >
                          {uploading ? "Subiendo…" : "Cambiar imagen"}
                        </button>
                      </div>
                      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">Título (ES)</span>
                          <Input
                            value={draft.titleEs}
                            onChange={(e) => setDraft((d) => ({ ...d, titleEs: e.target.value }))}
                            onBlur={() => handleAutoTranslate("title", "es")}
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
                            Título (EN)
                            {translating === "es-to-en" ? <Languages className="h-3 w-3 animate-pulse text-accent-deep" /> : null}
                          </span>
                          <Input
                            value={draft.titleEn}
                            onChange={(e) => setDraft((d) => ({ ...d, titleEn: e.target.value }))}
                            onBlur={() => handleAutoTranslate("title", "en")}
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">Resumen (ES)</span>
                          <Textarea
                            rows={2}
                            value={draft.summaryEs}
                            onChange={(e) => setDraft((d) => ({ ...d, summaryEs: e.target.value }))}
                            onBlur={() => handleAutoTranslate("summary", "es")}
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">Resumen (EN)</span>
                          <Textarea
                            rows={2}
                            value={draft.summaryEn}
                            onChange={(e) => setDraft((d) => ({ ...d, summaryEn: e.target.value }))}
                            onBlur={() => handleAutoTranslate("summary", "en")}
                          />
                        </label>
                      </div>
                    </div>

                    <label className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                          Detalle (ES) — admite Markdown, se muestra en la ventana modal
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-accent-deep hover:bg-accent-soft/40"
                          disabled={convertingDetail === "es" || !draft.detailEs.trim()}
                          onClick={() => handleConvertDetail("es")}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {convertingDetail === "es" ? "Convirtiendo…" : "Convertir con IA"}
                        </Button>
                      </div>
                      <Textarea
                        rows={6}
                        value={draft.detailEs}
                        onChange={(e) => setDraft((d) => ({ ...d, detailEs: e.target.value }))}
                        onBlur={() => handleAutoTranslate("detail", "es")}
                      />
                    </label>
                    {detailSuggestion?.locale === "es" ? (
                      <div className="rounded-md border border-accent-deep/30 bg-accent-soft/20 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-accent-deep">
                          Sugerencia de conversión (revisa antes de aplicar)
                        </p>
                        <div className="prose prose-sm mt-2 max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{detailSuggestion.markdown}</ReactMarkdown>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button type="button" size="sm" variant="accent" onClick={acceptDetailSuggestion}>
                            Aplicar
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setDetailSuggestion(null)}>
                            Descartar
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    <label className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
                          Detalle (EN)
                          {translating === "es-to-en" ? <Languages className="h-3 w-3 animate-pulse text-accent-deep" /> : null}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-accent-deep hover:bg-accent-soft/40"
                          disabled={convertingDetail === "en" || !draft.detailEn.trim()}
                          onClick={() => handleConvertDetail("en")}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {convertingDetail === "en" ? "Convirtiendo…" : "Convertir con IA"}
                        </Button>
                      </div>
                      <Textarea
                        rows={6}
                        value={draft.detailEn}
                        onChange={(e) => setDraft((d) => ({ ...d, detailEn: e.target.value }))}
                        onBlur={() => handleAutoTranslate("detail", "en")}
                      />
                    </label>
                    {detailSuggestion?.locale === "en" ? (
                      <div className="rounded-md border border-accent-deep/30 bg-accent-soft/20 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-accent-deep">
                          Sugerencia de conversión (revisa antes de aplicar)
                        </p>
                        <div className="prose prose-sm mt-2 max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{detailSuggestion.markdown}</ReactMarkdown>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button type="button" size="sm" variant="accent" onClick={acceptDetailSuggestion}>
                            Aplicar
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setDetailSuggestion(null)}>
                            Descartar
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)} disabled={saving}>
                        <X className="h-4 w-4" aria-hidden="true" />
                        Cancelar
                      </Button>
                      <Button type="button" size="sm" variant="accent" onClick={() => handleSave(item.id)} disabled={saving}>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {saving ? "Guardando…" : "Guardar"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-ink/5">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="96px" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageOff className="h-4 w-4 text-ink-faint" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{item.titleEs || item.titleEn}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-faint">{item.summaryEs || item.summaryEn || "Sin resumen"}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={index === 0 || reordering}
                        onClick={() => move(index, -1)}
                        aria-label="Mover arriba"
                      >
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={index === items.length - 1 || reordering}
                        onClick={() => move(index, 1)}
                        aria-label="Mover abajo"
                      >
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(item)} aria-label="Editar">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(item.id, item.titleEs || item.titleEn)}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            );
          })
        )}
      </div>

      <Button type="button" variant="outline" className="mt-4 w-full" onClick={handleCreate} disabled={creating}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        {creating ? "Creando…" : "Agregar item"}
      </Button>
    </div>
  );
}
