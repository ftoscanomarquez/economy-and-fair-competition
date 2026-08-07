"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ChartBlockContent } from "@/lib/blocks/schema";

const CHART_COLORS = [
  "oklch(0.55 0.13 230)",
  "oklch(0.72 0.11 75)",
  "oklch(0.70 0.12 230)",
  "oklch(0.45 0.035 250)",
  "oklch(0.62 0.025 250)",
];

/**
 * Renderizado público de un bloque "tabla → gráfica automática". El admin
 * captura filas { label, value } en components/admin/chart-data-editor.tsx;
 * aquí se traducen a barras/líneas/pastel según block.chartType.
 */
export function ChartBlock({ block }: { block: ChartBlockContent }) {
  if (block.data.length === 0) return null;

  return (
    <figure className="not-prose">
      {block.title ? (
        <figcaption className="mb-4 font-display text-lg font-medium text-ink">{block.title}</figcaption>
      ) : null}

      <div className="h-72 w-full rounded-md border border-border bg-surface p-4">
        <ResponsiveContainer width="100%" height="100%">
          {block.chartType === "bar" ? (
            <BarChart data={block.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.04 250 / 0.1)" />
              <XAxis dataKey="label" stroke="oklch(0.45 0.035 250)" fontSize={12} />
              <YAxis stroke="oklch(0.45 0.035 250)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : block.chartType === "line" ? (
            <LineChart data={block.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.04 250 / 0.1)" />
              <XAxis dataKey="label" stroke="oklch(0.45 0.035 250)" fontSize={12} />
              <YAxis stroke="oklch(0.45 0.035 250)" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={block.data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90}>
                {block.data.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
