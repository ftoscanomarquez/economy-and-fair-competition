/**
 * Helper puro sin dependencias de servidor, seguro de importar desde
 * Client Components. lib/content.ts (que sí toca lib/db.ts) es exclusivo
 * de Server Components.
 */
export function t(texts: Record<string, string>, key: string): string {
  return texts[key] ?? `[[${key}]]`;
}
