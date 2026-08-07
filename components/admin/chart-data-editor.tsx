"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHART_TYPES, type ChartDataRow, type ChartType } from "@/lib/blocks/schema";

const CHART_TYPE_LABELS: Record<ChartType, string> = {
  bar: "Barras",
  line: "Líneas",
  pie: "Pastel/dona",
};

export function ChartDataEditor({
  chartType,
  data,
  onChartTypeChange,
  onDataChange,
}: {
  chartType: ChartType;
  data: ChartDataRow[];
  onChartTypeChange: (type: ChartType) => void;
  onDataChange: (data: ChartDataRow[]) => void;
}) {
  function updateRow(index: number, patch: Partial<ChartDataRow>) {
    onDataChange(data.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onDataChange([...data, { label: "", value: 0 }]);
  }

  function removeRow(index: number) {
    onDataChange(data.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Tipo de gráfica</p>
        <div className="flex gap-2">
          {CHART_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChartTypeChange(type)}
              className={cn(
                "rounded border px-3 py-1.5 text-sm transition-colors duration-300 ease-institutional",
                chartType === type
                  ? "border-accent-deep bg-accent-soft text-accent-deep"
                  : "border-ink/15 text-ink-soft hover:border-ink/30"
              )}
            >
              {CHART_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Datos</p>
        <div className="flex flex-col gap-2">
          {data.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Etiqueta (ej. 2023)"
                value={row.label}
                onChange={(e) => updateRow(index, { label: e.target.value })}
                className="max-w-[200px]"
              />
              <Input
                type="number"
                placeholder="Valor"
                value={row.value}
                onChange={(e) => updateRow(index, { value: Number(e.target.value) })}
                className="max-w-[120px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => removeRow(index)}
                aria-label="Eliminar fila"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRow}>
          <Plus className="h-3.5 w-3.5" />
          Agregar fila
        </Button>
      </div>
    </div>
  );
}
