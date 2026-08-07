"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateBlockListEditor } from "./template-block-list-editor";
import { useToast } from "@/context/ToastContext";
import type { TemplateBlock } from "@/lib/blocks/schema";

type TemplateFormProps = {
  locale: string;
  templateId?: string;
  initialName?: string;
  initialBlocks?: TemplateBlock[];
};

export function TemplateForm({ locale, templateId, initialName = "", initialBlocks = [] }: TemplateFormProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [name, setName] = React.useState(initialName);
  const [blocks, setBlocks] = React.useState<TemplateBlock[]>(initialBlocks);
  const [saving, setSaving] = React.useState(false);

  const isEditing = Boolean(templateId);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!templateId) return;
    if (!window.confirm(`¿Eliminar la plantilla "${name}"? Esta acción no se puede deshacer.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/templates/${templateId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        notify({ title: "No se pudo eliminar la plantilla", variant: "error", technicalDetail: data.error });
        return;
      }

      notify({ title: "Plantilla eliminada" });
      router.push(`/${locale}/admin/templates`);
      router.refresh();
    } catch (error) {
      notify({
        title: "Error de conexión",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (blocks.length === 0) {
      notify({ title: "Agrega al menos un bloque", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(templateId ? `/api/templates/${templateId}` : "/api/templates", {
        method: templateId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, blocks }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify({ title: "No se pudo guardar la plantilla", variant: "error", technicalDetail: data.error });
        return;
      }

      notify({ title: isEditing ? "Plantilla actualizada" : "Plantilla creada" });
      router.push(`/${locale}/admin/templates`);
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <Label htmlFor="template-name">Nombre de la plantilla</Label>
        <Input
          id="template-name"
          required
          className="mt-1.5 max-w-md"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Análisis extenso con gráfica"
        />
        <p className="mt-1.5 text-xs text-ink-faint">
          La misma plantilla se usa para publicaciones en español e inglés — solo cambia el contenido, no la
          estructura.
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-ink">Estructura de bloques</p>
        <TemplateBlockListEditor blocks={blocks} onChange={setBlocks} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="accent" disabled={saving}>
          {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear plantilla"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push(`/${locale}/admin/templates`)}>
          Cancelar
        </Button>
        {isEditing ? (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-red-600 hover:bg-red-50"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Eliminando…" : "Eliminar plantilla"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
