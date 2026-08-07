"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/context/ToastContext";

/**
 * Deriva un prompt de generación de imagen a partir del texto ya escrito en
 * el bloque (título del hero, o inicio del markdown de twoColumn) — punto de
 * partida antes de que el admin lo edite a mano o pida una sugerencia más
 * detallada a la IA (ver handleSuggestPrompt).
 */
function buildPromptFromSource(source: string): string {
  const plainText = source
    .replace(/[#*_`>[\]()]/g, " ") // quita sintaxis Markdown básica
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  return `Fotografía editorial profesional, alta calidad, relacionada con: ${plainText}`;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  promptSource,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  /** Texto del bloque (título o contenido) usado para armar el prompt inicial. Si se omite u está vacío, la opción de generar con IA no se muestra. */
  promptSource?: string;
}) {
  const { notify } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [suggesting, setSuggesting] = React.useState(false);
  const [showPromptEditor, setShowPromptEditor] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "articulos-y-notas");

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        notify({ title: "No se pudo subir la imagen", description: data.error, variant: "error" });
        return;
      }

      onChange(data.url);
    } catch (error) {
      notify({
        title: "Error de conexión",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleOpenPromptEditor() {
    const trimmedSource = promptSource?.trim();
    if (!trimmedSource) {
      notify({
        title: "Escribe primero un título o texto",
        description: "El prompt de la imagen se genera a partir del contenido del bloque.",
        variant: "error",
      });
      return;
    }
    setPrompt(buildPromptFromSource(trimmedSource));
    setShowPromptEditor(true);
  }

  async function handleSuggestPrompt() {
    const trimmedSource = promptSource?.trim();
    if (!trimmedSource) return;

    setSuggesting(true);
    try {
      const res = await fetch("/api/ai/suggest-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText: trimmedSource }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify({
          title: res.status === 503 ? "Sugerencias de IA no disponibles" : "No se pudo sugerir un prompt",
          description: res.status === 503 ? data.error : "Puedes escribir el prompt manualmente y generar la imagen.",
          variant: "error",
        });
        return;
      }

      // El prompt sugerido reemplaza momentáneamente el campo: el admin lo ve,
      // puede seguir editándolo antes de generar, nunca se aplica solo.
      setPrompt(data.prompt);
    } catch (error) {
      notify({
        title: "Error de conexión",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSuggesting(false);
    }
  }

  async function handleGenerateImage() {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      notify({ title: "El prompt no puede estar vacío", variant: "error" });
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });
      const data = await res.json();

      if (!res.ok) {
        // 503 = pollinations.ai no respondió (circuito abierto o fallo de red):
        // no es un error bloqueante, el admin puede volver a intentarlo cuando quiera.
        notify({
          title: res.status === 503 ? "Generador de imágenes no disponible" : "No se pudo generar la imagen",
          description: res.status === 503 ? "Puedes intentarlo de nuevo en unos minutos." : data.error,
          variant: "error",
        });
        return;
      }

      onChange(data.url);
      setShowPromptEditor(false);
      notify({ title: "Imagen generada" });
    } catch (error) {
      notify({
        title: "Error de conexión",
        description: "Puedes intentar generar la imagen de nuevo más tarde.",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setGenerating(false);
    }
  }

  function handleRemoveImage() {
    onChange(null);
    setShowPromptEditor(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {label ? <p className="text-sm font-medium text-ink">{label}</p> : null}

      {value ? (
        <div className="relative w-full max-w-xs overflow-hidden rounded-md border border-border">
          <Image src={value} alt="" width={320} height={180} className="h-auto w-full object-cover" />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-bg"
            aria-label="Quitar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {uploading ? "Subiendo…" : "Subir imagen"}
            </Button>
            {promptSource !== undefined && !showPromptEditor ? (
              <Button type="button" variant="outline" size="sm" onClick={handleOpenPromptEditor}>
                <Sparkles className="h-4 w-4" />
                Generar imagen con IA
              </Button>
            ) : null}
          </div>

          {showPromptEditor ? (
            <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="image-prompt" className="text-xs font-medium text-ink-soft">
                  Prompt de la imagen (puedes editarlo antes de generar)
                </label>
                <Button type="button" variant="ghost" size="sm" disabled={suggesting} onClick={handleSuggestPrompt}>
                  <Wand2 className="h-3.5 w-3.5" />
                  {suggesting ? "Pensando…" : "Sugerir prompt con IA"}
                </Button>
              </div>
              <Textarea
                id="image-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button type="button" variant="accent" size="sm" disabled={generating} onClick={handleGenerateImage}>
                  <Sparkles className="h-4 w-4" />
                  {generating ? "Generando…" : "Generar con este prompt"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPromptEditor(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
