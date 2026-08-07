"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Eye, Pencil, FileUp, Upload, Link2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";

type MarkdownBlockEditorProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

type ExtractionSuggestion = {
  title: string;
  summary: string;
  markdown: string;
};

const ACCEPTED_DOCUMENT_TYPES =
  ".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation";

/**
 * Editor de un bloque de texto Markdown:
 * - Detecta automáticamente si el contenido pegado ya parece Markdown; si
 *   no, ofrece "Convertir con IA" (POST /api/ai/markdown).
 * - Permite extraer y resumir un documento (PDF/Word/PowerPoint subido, o
 *   una URL con HTML o un archivo servible) vía "Extraer de PDF/URL"
 *   (POST /api/ai/extract-document).
 * Ambas rutas muestran el resultado como sugerencia editable con vista
 * previa — nunca sobreescriben el texto del admin sin confirmación explícita.
 */
export function MarkdownBlockEditor({ value, onChange, label }: MarkdownBlockEditorProps) {
  const { notify } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mode, setMode] = React.useState<"edit" | "preview">("edit");
  const [converting, setConverting] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<string | null>(null);

  const [showExtractPanel, setShowExtractPanel] = React.useState(false);
  const [extracting, setExtracting] = React.useState(false);
  const [documentUrl, setDocumentUrl] = React.useState("");
  const [extraction, setExtraction] = React.useState<ExtractionSuggestion | null>(null);

  async function handleConvert() {
    if (!value.trim()) return;
    setConverting(true);
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

      setSuggestion(data.markdown);
    } catch (error) {
      notify({
        title: "Error de conexión con la IA",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setConverting(false);
    }
  }

  function acceptSuggestion() {
    if (suggestion === null) return;
    onChange(suggestion);
    setSuggestion(null);
    notify({ title: "Markdown aplicado" });
  }

  async function runExtraction(request: () => Promise<Response>, sourceLabel: string) {
    setExtracting(true);
    try {
      const res = await request();
      const data = await res.json();

      if (!res.ok) {
        notify({
          title: res.status === 503 ? "IA no disponible" : "No se pudo extraer el contenido",
          description: data.error,
          variant: "error",
        });
        return;
      }

      setExtraction({ title: data.title, summary: data.summary, markdown: data.markdown });
      notify({ title: "Resumen generado", description: `Fuente: ${sourceLabel}. Revisa antes de aplicar.` });
    } catch (error) {
      notify({
        title: "Error de conexión con la IA",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setExtracting(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await runExtraction(
      () => fetch("/api/ai/extract-document", { method: "POST", body: formData }),
      file.name
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUrlSubmit() {
    const trimmed = documentUrl.trim();
    if (!trimmed) return;
    await runExtraction(
      () =>
        fetch("/api/ai/extract-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        }),
      trimmed
    );
  }

  function acceptExtraction() {
    if (!extraction) return;
    onChange(extraction.markdown);
    setExtraction(null);
    setShowExtractPanel(false);
    setDocumentUrl("");
    notify({ title: "Contenido extraído aplicado al bloque" });
  }

  return (
    <div className="flex flex-col gap-2">
      {label ? <p className="text-sm font-medium text-ink">{label}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={mode === "edit" ? "outline" : "ghost"}
          size="sm"
          onClick={() => setMode("edit")}
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          type="button"
          variant={mode === "preview" ? "outline" : "ghost"}
          size="sm"
          onClick={() => setMode("preview")}
        >
          <Eye className="h-3.5 w-3.5" />
          Vista previa
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-accent-deep hover:bg-accent-soft/40"
          onClick={handleConvert}
          disabled={converting || !value.trim()}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {converting ? "Convirtiendo…" : "Convertir con IA"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto text-accent-deep hover:bg-accent-soft/40"
          onClick={() => setShowExtractPanel((v) => !v)}
        >
          <FileUp className="h-3.5 w-3.5" />
          Extraer de PDF/URL
        </Button>
      </div>

      {mode === "edit" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="font-mono text-sm"
          placeholder="Escribe o pega el texto del bloque. Soporta Markdown: ## subtítulos, - listas, **negrita**…"
        />
      ) : (
        <div className="prose prose-sm max-w-none rounded-md border border-border bg-surface p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "*Sin contenido aún.*"}</ReactMarkdown>
        </div>
      )}

      {suggestion !== null ? (
        <div className="rounded-md border border-accent-deep/30 bg-accent-soft/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-accent-deep">
            Sugerencia de conversión (revisa antes de aplicar)
          </p>
          <div className="prose prose-sm mt-2 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{suggestion}</ReactMarkdown>
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" variant="accent" onClick={acceptSuggestion}>
              Aplicar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSuggestion(null)}>
              Descartar
            </Button>
          </div>
        </div>
      ) : null}

      {showExtractPanel ? (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Resumir un documento (PDF, Word, PowerPoint) o una página web con IA
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={extracting}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Subir archivo (PDF, .docx, .pptx)
            </Button>
            <span className="text-xs text-ink-faint">o</span>
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://ejemplo.com/articulo-o-documento"
                className="text-sm"
              />
              <Button type="button" size="sm" variant="accent" disabled={extracting || !documentUrl.trim()} onClick={handleUrlSubmit}>
                <Link2 className="h-3.5 w-3.5" />
                {extracting ? "Leyendo…" : "Leer URL"}
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_DOCUMENT_TYPES}
            className="hidden"
            onChange={handleFileSelected}
          />

          {extraction ? (
            <div className="rounded-md border border-accent-deep/30 bg-accent-soft/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-accent-deep">
                Resumen generado (revisa antes de aplicar — reemplazará el contenido actual del bloque)
              </p>
              <p className="mt-2 font-display text-base font-medium text-ink">{extraction.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{extraction.summary}</p>
              <div className="prose prose-sm mt-3 max-w-none border-t border-accent-deep/20 pt-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{extraction.markdown}</ReactMarkdown>
              </div>
              <div className="mt-3 flex gap-2">
                <Button type="button" size="sm" variant="accent" onClick={acceptExtraction}>
                  Aplicar al bloque
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setExtraction(null)}>
                  Descartar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
