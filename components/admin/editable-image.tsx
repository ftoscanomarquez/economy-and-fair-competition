"use client";

/**
 * Análogo a EditableText pero para imágenes: en modo edición, superpone un
 * botón "Cambiar imagen" sobre la imagen actual. Al elegir un archivo, se
 * sube (POST /api/uploads) y la URL resultante se guarda en site_texts con
 * el mismo valor para ES y EN en una sola llamada — a diferencia del texto,
 * la imagen del hero no varía por idioma (decisión de producto).
 */
import * as React from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

export function EditableImage({
  textKey,
  value,
  alt,
  className,
  imageClassName,
  sizes,
}: {
  textKey: string;
  value: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}) {
  const { editMode, adminSession } = useGlobalContext();
  const { notify } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [currentUrl, setCurrentUrl] = React.useState(value);

  if (!editMode || !adminSession) {
    return (
      <div className={cn("relative", className)}>
        <Image src={currentUrl} alt={alt} fill className={cn("object-cover", imageClassName)} sizes={sizes} />
      </div>
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "home");
      const uploadRes = await fetch("/api/uploads", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        notify({ title: "No se pudo subir la imagen", description: uploadData.error, variant: "error" });
        return;
      }

      const newUrl: string = uploadData.url;
      // Misma URL para es/en en una sola llamada — la imagen no distingue idioma.
      const saveRes = await fetch("/api/content/site-texts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: textKey, es: newUrl, en: newUrl }),
      });
      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        notify({ title: "No se pudo guardar la imagen", description: saveData.error, variant: "error" });
        return;
      }

      setCurrentUrl(newUrl);
      notify({ title: "Imagen actualizada", description: textKey });
    } catch (error) {
      notify({
        title: "Error de conexión al subir la imagen",
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("group relative rounded-sm outline-dashed outline-1 outline-offset-2 outline-accent-deep/50", className)}>
      <Image
        src={currentUrl}
        alt={alt}
        fill
        className={cn("object-cover transition-opacity duration-300 ease-institutional", uploading && "opacity-50", imageClassName)}
        sizes={sizes}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={`Editar imagen: ${textKey}`}
        className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/0 text-sm font-medium text-bg opacity-0 transition-all duration-300 ease-institutional group-hover:bg-ink/50 group-hover:opacity-100"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        {uploading ? "Subiendo…" : "Cambiar imagen"}
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
