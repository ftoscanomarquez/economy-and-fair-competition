"use client";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MarkdownBlockEditor } from "./markdown-block-editor";
import { ImageUploadField } from "./image-upload-field";
import { ChartDataEditor } from "./chart-data-editor";
import { BLOCK_TYPE_LABELS, type ContentBlock } from "@/lib/blocks/schema";
import { cn } from "@/lib/utils";

/**
 * Dispatcher: renderiza el sub-editor correcto según block.type. Usado por
 * el editor de posts (Fase 7C) para llenar cada bloque de la plantilla
 * elegida, una vez por idioma (ver app/[locale]/admin/posts/*).
 */
export function ContentBlockEditor({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
}) {
  return (
    <Card className={cn("p-5")}>
      <p className="mb-3 font-mono text-xs uppercase tracking-wide text-accent-deep">
        {BLOCK_TYPE_LABELS[block.type].es}
      </p>

      {block.type === "hero" ? (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor={`${block.id}-title`}>
              Título de impacto
            </label>
            <Input
              id={`${block.id}-title`}
              value={block.title}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              placeholder="Título grande al inicio del artículo"
            />
          </div>
          <ImageUploadField
            label="Imagen de alto impacto"
            value={block.imageUrl}
            onChange={(imageUrl) => onChange({ ...block, imageUrl })}
            promptSource={block.title}
          />
        </div>
      ) : null}

      {block.type === "richtext" ? (
        <MarkdownBlockEditor value={block.markdown} onChange={(markdown) => onChange({ ...block, markdown })} />
      ) : null}

      {block.type === "twoColumn" ? (
        <div className="flex flex-col gap-4">
          <MarkdownBlockEditor
            label="Columna de texto"
            value={block.markdown}
            onChange={(markdown) => onChange({ ...block, markdown })}
          />
          <div className="flex items-end gap-4">
            <ImageUploadField
              label="Imagen"
              value={block.imageUrl}
              onChange={(imageUrl) => onChange({ ...block, imageUrl })}
              promptSource={block.markdown}
            />
            <div className="flex gap-2 pb-1">
              {(["left", "right"] as const).map((position) => (
                <button
                  key={position}
                  type="button"
                  onClick={() => onChange({ ...block, imagePosition: position })}
                  className={cn(
                    "rounded border px-3 py-1.5 text-xs transition-colors duration-300 ease-institutional",
                    block.imagePosition === position
                      ? "border-accent-deep bg-accent-soft text-accent-deep"
                      : "border-ink/15 text-ink-soft"
                  )}
                >
                  Imagen a la {position === "left" ? "izquierda" : "derecha"}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {block.type === "chart" ? (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor={`${block.id}-chart-title`}>
              Título de la gráfica
            </label>
            <Input
              id={`${block.id}-chart-title`}
              value={block.title}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
            />
          </div>
          <ChartDataEditor
            chartType={block.chartType}
            data={block.data}
            onChartTypeChange={(chartType) => onChange({ ...block, chartType })}
            onDataChange={(data) => onChange({ ...block, data })}
          />
        </div>
      ) : null}
    </Card>
  );
}
