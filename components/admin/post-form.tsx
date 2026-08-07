"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentBlockEditor } from "./content-block-editor";
import { ThumbnailSelector } from "./thumbnail-selector";
import { useToast } from "@/context/ToastContext";
import { emptyBlockContent, type ContentBlock, type TemplateBlock } from "@/lib/blocks/schema";
import { POST_CATEGORIES, CATEGORY_LABELS, POST_TYPE_LABELS, type PostCategory, type PostType } from "@/lib/posts-taxonomy";
import { cn } from "@/lib/utils";

type TemplateOption = { id: string; name: string; blocks: TemplateBlock[] };

type PostFormProps = {
  locale: string;
  templates: TemplateOption[];
  postId?: string;
  initial?: {
    slug: string;
    templateId: string | null;
    postType: PostType;
    category: PostCategory | null;
    tags: string[];
    titleEs: string;
    titleEn: string;
    summaryEs: string | null;
    summaryEn: string | null;
    blocksEs: ContentBlock[];
    blocksEn: ContentBlock[];
    thumbnailUrl: string | null;
    status: "draft" | "published";
  };
};

function blocksFromTemplate(template: TemplateOption | undefined): ContentBlock[] {
  if (!template) return [];
  return template.blocks.map((b) => emptyBlockContent(b.id, b.type));
}

/**
 * Editor de un Artículo/Nota concreto: elegir plantilla → llenar cada
 * bloque (ES y EN comparten la misma secuencia de bloques, contenido
 * independiente) → metadata (tipo, categoría, tags, slug, resumen) → guardar.
 * Ver AGENTS.md §10.4 para el flujo de producto completo.
 */
export function PostForm({ locale, templates, postId, initial }: PostFormProps) {
  const router = useRouter();
  const { notify } = useToast();
  const isEditing = Boolean(postId);

  // El fallback a templates[0] SOLO aplica al crear un post nuevo (sin
  // `initial`) — con una sola plantilla, el <select> arranca con esa opción
  // preseleccionada y los bloques deben llenarse desde ella, si no el
  // <select> muestra la plantilla correcta pero la sección de bloques queda
  // vacía. En modo edición, `initial.templateId` puede ser legítimamente
  // `null` (post creado sin plantilla) y el <select> debe reflejar ESE
  // estado real — usar el fallback aquí también haría que todo post sin
  // plantilla muestre engañosamente "Análisis extenso con gráfica"
  // seleccionada (única plantilla existente) aunque en la base de datos no
  // tenga ninguna asignada.
  const fallbackTemplateId = isEditing ? "" : (templates[0]?.id ?? "");
  const initialTemplate = templates.find((t) => t.id === (initial?.templateId ?? fallbackTemplateId));

  const [templateId, setTemplateId] = React.useState(initial?.templateId ?? fallbackTemplateId);
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [postType, setPostType] = React.useState<PostType>(initial?.postType ?? "articulo");
  const [category, setCategory] = React.useState<PostCategory | "">(initial?.category ?? "");
  const [tagsInput, setTagsInput] = React.useState((initial?.tags ?? []).join(", "));
  const [titleEs, setTitleEs] = React.useState(initial?.titleEs ?? "");
  const [titleEn, setTitleEn] = React.useState(initial?.titleEn ?? "");
  const [summaryEs, setSummaryEs] = React.useState(initial?.summaryEs ?? "");
  const [summaryEn, setSummaryEn] = React.useState(initial?.summaryEn ?? "");
  const [blocksEs, setBlocksEs] = React.useState<ContentBlock[]>(
    initial?.blocksEs ?? blocksFromTemplate(initialTemplate)
  );
  const [blocksEn, setBlocksEn] = React.useState<ContentBlock[]>(
    initial?.blocksEn ?? blocksFromTemplate(initialTemplate)
  );
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(initial?.thumbnailUrl ?? null);
  const [editLang, setEditLang] = React.useState<"es" | "en">("es");
  const [saving, setSaving] = React.useState(false);
  const currentStatus = initial?.status ?? "draft";

  function handleTemplateChange(newTemplateId: string) {
    setTemplateId(newTemplateId);
    if (!isEditing) {
      const template = templates.find((t) => t.id === newTemplateId);
      setBlocksEs(blocksFromTemplate(template));
      setBlocksEn(blocksFromTemplate(template));
    }
  }

  function updateBlock(lang: "es" | "en", index: number, block: ContentBlock) {
    const setter = lang === "es" ? setBlocksEs : setBlocksEn;
    setter((prev) => prev.map((b, i) => (i === index ? block : b)));
  }

  async function handleSubmit(e: React.FormEvent, publishOverride?: "draft" | "published") {
    e.preventDefault();

    if (!templateId) {
      notify({ title: "Elige una plantilla", variant: "error" });
      return;
    }

    setSaving(true);
    const finalStatus = publishOverride ?? currentStatus;

    const payload = {
      slug,
      templateId,
      postType,
      category: category || null,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      titleEs,
      titleEn,
      summaryEs: summaryEs || undefined,
      summaryEn: summaryEn || undefined,
      blocksEs,
      blocksEn,
      thumbnailUrl,
      status: finalStatus,
    };

    try {
      const res = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
        method: postId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        notify({ title: "No se pudo guardar la publicación", variant: "error", technicalDetail: data.error });
        return;
      }

      notify({ title: isEditing ? "Publicación actualizada" : "Publicación creada" });
      router.push(`/${locale}/admin/posts`);
      router.refresh();
    } catch (error) {
      notify({
        title: "Error de conexión",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSaving(false);
    }
  }

  const activeBlocks = editLang === "es" ? blocksEs : blocksEn;

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Plantilla y clasificación</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="template">Plantilla</Label>
            <select
              id="template"
              value={templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={isEditing}
              className="mt-1.5 h-11 w-full rounded border border-ink/15 bg-surface px-3 text-sm text-ink"
            >
              <option value="">Selecciona una plantilla…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {isEditing ? (
              <p className="mt-1 text-xs text-ink-faint">La plantilla no se puede cambiar una vez creada la publicación.</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="postType">Tipo</Label>
              <div className="mt-1.5 flex gap-2">
                {(["articulo", "nota"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type)}
                    className={cn(
                      "flex-1 rounded border px-3 py-2 text-sm transition-colors duration-300 ease-institutional",
                      postType === type
                        ? "border-accent-deep bg-accent-soft text-accent-deep"
                        : "border-ink/15 text-ink-soft"
                    )}
                  >
                    {POST_TYPE_LABELS[type].es}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory | "")}
                className="mt-1.5 h-11 w-full rounded border border-ink/15 bg-surface px-3 text-sm text-ink"
              >
                <option value="">Sin categoría</option>
                {POST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c].es}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="T-MEC, reglas de origen"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="mi-articulo-de-ejemplo"
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Título y resumen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="titleEs">Título (Español)</Label>
            <Input id="titleEs" required value={titleEs} onChange={(e) => setTitleEs(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="titleEn">Título (English)</Label>
            <Input id="titleEn" required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="summaryEs">Resumen (Español)</Label>
            <Textarea id="summaryEs" value={summaryEs} onChange={(e) => setSummaryEs(e.target.value)} rows={3} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="summaryEn">Resumen (English)</Label>
            <Textarea id="summaryEn" value={summaryEn} onChange={(e) => setSummaryEn(e.target.value)} rows={3} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      {templateId ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-lg font-medium text-ink">Contenido de los bloques</p>
            <div className="flex gap-1 rounded border border-ink/15 p-1">
              {(["es", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setEditLang(lang)}
                  className={cn(
                    "rounded-sm px-3 py-1 font-mono text-xs uppercase transition-colors duration-300 ease-institutional",
                    editLang === lang ? "bg-ink text-bg" : "text-ink-soft"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {activeBlocks.map((block, index) => (
              <ContentBlockEditor
                key={block.id}
                block={block}
                onChange={(updated) => updateBlock(editLang, index, updated)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {templateId ? (
        <Card>
          <CardHeader>
            <CardTitle>Miniatura</CardTitle>
            <p className="text-sm text-ink-soft">
              Elige cuál de las imágenes de los bloques se muestra en las tarjetas del listado público de Artículos y
              Notas.
            </p>
          </CardHeader>
          <CardContent>
            <ThumbnailSelector
              blocksEs={blocksEs}
              blocksEn={blocksEn}
              thumbnailUrl={thumbnailUrl}
              onChange={setThumbnailUrl}
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="flex gap-3">
        <Button type="button" variant="outline" disabled={saving} onClick={(e) => handleSubmit(e, "draft")}>
          {saving ? "Guardando…" : "Guardar borrador"}
        </Button>
        <Button type="button" variant="accent" disabled={saving} onClick={(e) => handleSubmit(e, "published")}>
          {saving ? "Guardando…" : "Publicar"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push(`/${locale}/admin/posts`)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
