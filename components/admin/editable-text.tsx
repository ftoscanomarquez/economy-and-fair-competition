"use client";

import * as React from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

type EditableTextProps = {
  textKey: string;
  value: string;
  as?: "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
  multiline?: boolean;
};

export function EditableText({ textKey, value, as = "span", className, multiline = false }: EditableTextProps) {
  const { editMode, editLocale, adminSession } = useGlobalContext();
  const { notify } = useToast();
  const [saving, setSaving] = React.useState(false);

  if (!editMode || !adminSession) {
    const Tag = as;
    return <Tag className={cn(className, multiline && "whitespace-pre-line")}>{value}</Tag>;
  }

  async function handleBlur(e: React.FocusEvent<HTMLElement>) {
    const newValue = e.currentTarget.textContent ?? "";
    if (newValue === value) return;

    setSaving(true);
    try {
      const res = await fetch("/api/content/site-texts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: textKey, [editLocale]: newValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: "No se pudo guardar", description: textKey, variant: "error", technicalDetail: data.error });
        return;
      }
      notify({ title: "Guardado", description: `${textKey} (${editLocale.toUpperCase()})` });
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

  const Tag = as;
  return (
    <Tag
      role="textbox"
      aria-label={`Editar: ${textKey}`}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={cn(
        className,
        "rounded-sm outline-dashed outline-1 outline-offset-2 outline-accent-deep/50 transition-opacity duration-300 ease-institutional",
        saving && "opacity-50",
        multiline && "whitespace-pre-line"
      )}
    >
      {value}
    </Tag>
  );
}
