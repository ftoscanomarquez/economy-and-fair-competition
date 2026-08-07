"use client";

import Image from "next/image";
import { ImageOff, Check } from "lucide-react";
import type { ContentBlock } from "@/lib/blocks/schema";
import { cn } from "@/lib/utils";

/**
 * Recopila todas las imágenes ya asignadas a bloques hero/twoColumn (en
 * cualquiera de los dos idiomas) del post en edición, sin duplicados.
 */
function collectBlockImages(blocksEs: ContentBlock[], blocksEn: ContentBlock[]): string[] {
  const urls = new Set<string>();
  for (const block of [...blocksEs, ...blocksEn]) {
    if ((block.type === "hero" || block.type === "twoColumn") && block.imageUrl) {
      urls.add(block.imageUrl);
    }
  }
  return Array.from(urls);
}

/**
 * Permite elegir, entre las imágenes ya subidas/generadas en los bloques del
 * post, cuál se usa como miniatura en las tarjetas del listado público
 * (components/marketing/posts-feed.tsx) — antes ese listado siempre mostraba
 * un ícono genérico porque nada podía marcar una imagen como thumbnail.
 */
export function ThumbnailSelector({
  blocksEs,
  blocksEn,
  thumbnailUrl,
  onChange,
}: {
  blocksEs: ContentBlock[];
  blocksEn: ContentBlock[];
  thumbnailUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const images = collectBlockImages(blocksEs, blocksEn);

  if (images.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed border-border p-4 text-sm text-ink-faint">
        <ImageOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        Agrega una imagen a algún bloque (Hero o Dos columnas) para poder elegirla como miniatura.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((url) => {
        const isSelected = thumbnailUrl === url;
        return (
          <button
            key={url}
            type="button"
            onClick={() => onChange(isSelected ? null : url)}
            aria-pressed={isSelected}
            className={cn(
              "relative h-20 w-32 shrink-0 overflow-hidden rounded-md border-2 transition-colors duration-300 ease-institutional",
              isSelected ? "border-accent-deep" : "border-transparent hover:border-ink/20"
            )}
          >
            <Image src={url} alt="" fill className="object-cover" sizes="128px" />
            {isSelected ? (
              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-deep text-bg">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
