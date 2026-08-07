"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, Trash2, Plus, LayoutTemplate, FileText, Columns2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BLOCK_TYPE_LABELS, type BlockType, type TemplateBlock } from "@/lib/blocks/schema";

const BLOCK_TYPE_ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  hero: LayoutTemplate,
  richtext: FileText,
  twoColumn: Columns2,
  chart: BarChart3,
};

const ALL_BLOCK_TYPES: BlockType[] = ["hero", "richtext", "twoColumn", "chart"];

let blockIdCounter = 0;
function generateBlockId() {
  blockIdCounter += 1;
  return `block-${Date.now()}-${blockIdCounter}`;
}

export function TemplateBlockListEditor({
  blocks,
  onChange,
}: {
  blocks: TemplateBlock[];
  onChange: (blocks: TemplateBlock[]) => void;
}) {
  function addBlock(type: BlockType) {
    onChange([...blocks, { id: generateBlockId(), type }]);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.length === 0 ? (
        <Card className="border-dashed p-8 text-center">
          <p className="text-sm text-ink-faint">Agrega al menos un bloque para definir la plantilla.</p>
        </Card>
      ) : (
        <ol className="flex flex-col gap-2">
          {blocks.map((block, index) => {
            const Icon = BLOCK_TYPE_ICONS[block.type];
            return (
              <li key={block.id} className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-deep">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{BLOCK_TYPE_LABELS[block.type].es}</p>
                  <p className="text-xs text-ink-faint">Bloque {index + 1}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveBlock(index, -1)}
                    aria-label="Mover arriba"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === blocks.length - 1}
                    onClick={() => moveBlock(index, 1)}
                    aria-label="Mover abajo"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => removeBlock(index)}
                    aria-label="Eliminar bloque"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">Agregar bloque</p>
        <div className="flex flex-wrap gap-2">
          {ALL_BLOCK_TYPES.map((type) => {
            const Icon = BLOCK_TYPE_ICONS[type];
            return (
              <Button key={type} type="button" variant="outline" size="sm" onClick={() => addBlock(type)}>
                <Icon className="h-4 w-4" />
                <Plus className="h-3 w-3" />
                {BLOCK_TYPE_LABELS[type].es}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
