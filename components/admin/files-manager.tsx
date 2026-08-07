"use client";

/**
 * Pantalla de gestión de archivos subidos (/admin/files) — imágenes y
 * documentos (PDF/Word/PowerPoint) guardados en public/uploads y
 * public/documents respectivamente. Permite ver cuáles ya son viejos y
 * eliminarlos. Un archivo eliminado desde aquí puede seguir referenciado
 * por un post antiguo — ese caso se maneja en el render público
 * (PurgedFileNotice), no aquí: esta pantalla solo gestiona el archivo en sí.
 */
import * as React from "react";
import Image from "next/image";
import { Search, FileText, Image as ImageIcon, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

type UploadedFile = {
  id: string;
  url: string;
  kind: "image" | "document";
  originalName: string | null;
  sizeBytes: number;
  createdAt: string;
  createdBy: string | null;
  existsOnDisk: boolean;
};

type KindFilter = "all" | "image" | "document";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function FilesManager({ initialFiles }: { initialFiles: UploadedFile[] }) {
  const { notify } = useToast();
  const [files, setFiles] = React.useState(initialFiles);
  const [query, setQuery] = React.useState("");
  const [kindFilter, setKindFilter] = React.useState<KindFilter>("all");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [deleting, setDeleting] = React.useState(false);

  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return files.filter((f) => {
      if (kindFilter !== "all" && f.kind !== kindFilter) return false;
      if (!normalized) return true;
      return (f.originalName ?? f.url).toLowerCase().includes(normalized);
    });
  }, [files, query, kindFilter]);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`¿Eliminar ${selected.size} archivo(s)? Esta acción no se puede deshacer.`)) return;

    setDeleting(true);
    const ids = Array.from(selected);
    let successCount = 0;

    for (const id of ids) {
      const res = await fetch(`/api/uploaded-files/${id}`, { method: "DELETE" }).catch(() => null);
      if (res?.ok) successCount += 1;
    }

    setFiles((prev) => prev.filter((f) => !ids.includes(f.id)));
    setSelected(new Set());
    setDeleting(false);

    notify({
      title: successCount === ids.length ? "Archivos eliminados" : "Eliminación parcial",
      description: `${successCount} de ${ids.length} archivo(s) eliminado(s).`,
      variant: successCount === ids.length ? "default" : "error",
    });
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre de archivo…"
            className="pl-9"
            aria-label="Buscar archivos"
          />
        </div>
        <div className="flex gap-1 rounded border border-ink/15 p-1">
          {(["all", "image", "document"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKindFilter(k)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-xs transition-colors duration-300 ease-institutional",
                kindFilter === k ? "bg-ink text-bg" : "text-ink-soft"
              )}
            >
              {k === "all" ? "Todos" : k === "image" ? "Imágenes" : "Documentos"}
            </button>
          ))}
        </div>
        {selected.size > 0 ? (
          <Button type="button" variant="outline" size="sm" disabled={deleting} onClick={handleDeleteSelected}>
            <Trash2 className="h-4 w-4" />
            Eliminar {selected.size} seleccionado(s)
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-ink-faint" />
          <p className="mt-3 text-sm text-ink-soft">
            {files.length === 0 ? "Aún no se ha subido ningún archivo." : "Ningún archivo coincide con la búsqueda."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((file) => {
            const isSelected = selected.has(file.id);
            return (
              <Card
                key={file.id}
                className={cn(
                  "relative flex flex-col gap-2 p-3 transition-colors duration-300 ease-institutional",
                  isSelected ? "border-accent-deep bg-accent-soft/20" : ""
                )}
              >
                <label className="absolute left-2 top-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-surface/90 shadow-card">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(file.id)}
                    aria-label={`Seleccionar ${file.originalName ?? file.url}`}
                  />
                </label>

                {!file.existsOnDisk ? (
                  <span
                    className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700"
                    title="El archivo físico ya no existe en el servidor"
                  >
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    Depurado
                  </span>
                ) : null}

                <div className="flex h-24 items-center justify-center overflow-hidden rounded bg-ink/5">
                  {file.kind === "image" && file.existsOnDisk ? (
                    <Image src={file.url} alt="" width={120} height={96} className="h-full w-full object-cover" />
                  ) : file.kind === "image" ? (
                    <ImageIcon className="h-8 w-8 text-ink-faint" aria-hidden="true" />
                  ) : (
                    <FileText className="h-8 w-8 text-ink-faint" aria-hidden="true" />
                  )}
                </div>

                <p className="truncate text-xs font-medium text-ink" title={file.originalName ?? file.url}>
                  {file.originalName ?? file.url.split("/").pop()}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge>{formatSize(file.sizeBytes)}</Badge>
                  {file.kind === "document" ? <Badge variant="accent">Documento</Badge> : null}
                </div>
                <p className="text-[11px] text-ink-faint">{formatDate(file.createdAt)}</p>
                {file.createdBy ? (
                  <p className="truncate text-[11px] text-ink-faint" title={file.createdBy}>
                    {file.createdBy}
                  </p>
                ) : null}

                {file.existsOnDisk ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto flex items-center gap-1 text-xs text-accent-deep hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    Abrir
                  </a>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
