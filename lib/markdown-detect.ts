/**
 * Heurística de detección de Markdown, sin dependencias de servidor —
 * seguro de importar desde Client Components (a diferencia de
 * lib/ai/markdown.ts, que arrastra el cliente de Anthropic). Usado por
 * DetailDialog (components/marketing/detail-dialog.tsx) para decidir si el
 * campo "detail" de un content item se renderiza como Markdown o como texto
 * plano, y re-exportado desde lib/ai/markdown.ts por compatibilidad.
 */
const MARKDOWN_SIGNAL_PATTERNS = [
  /^#{1,6}\s+.+/m, // encabezados
  /^[-*+]\s+.+/m, // listas con viñetas
  /^\d+\.\s+.+/m, // listas numeradas
  /\*\*[^*]+\*\*/, // negrita
  /(?<!\*)\*[^*\n]+\*(?!\*)/, // itálica
  /^>\s+.+/m, // citas
  /\[[^\]]+\]\([^)]+\)/, // enlaces
];

export function looksLikeMarkdown(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return MARKDOWN_SIGNAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}
