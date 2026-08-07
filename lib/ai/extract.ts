/**
 * Extracción de contenido desde un documento (PDF, DOCX, PPTX) o una URL
 * (HTML) para generar automáticamente un resumen estructurado en Markdown
 * vía Claude. Dos consumidores:
 *  - El servidor MCP (create_post_from_media, ver app/api/mcp/route.ts) —
 *    solo PDF/URL, siempre crea un post en borrador.
 *  - El editor de bloques de texto enriquecido en el admin
 *    (components/admin/markdown-block-editor.tsx vía
 *    /api/ai/extract-document) — los 4 formatos, el resultado se muestra
 *    como sugerencia editable, nunca reemplaza el contenido sin
 *    confirmación explícita del admin.
 *
 * La extracción de texto de los documentos usa `officeparser` (un solo
 * paquete que cubre PDF/DOCX/PPTX/HTML de forma unificada, reemplaza el uso
 * anterior de `pdf-parse` + un stripHtml casero).
 *
 * Referencia de la fuente en el Markdown resultante: todo resultado agrega
 * al final una línea "Fuente: [...]" —
 *   - Si la extracción vino de una URL externa, enlaza esa URL directamente.
 *   - Si vino de un archivo subido (PDF/DOCX/PPTX), el archivo se guarda en
 *     public/documents/ (lib/uploads.ts → saveDocumentBuffer) y se enlaza su
 *     URL de descarga — así el Markdown generado siempre permite volver al
 *     documento original, y ese mismo archivo aparece listado en
 *     /admin/files para poder eliminarlo cuando ya no haga falta.
 */
import { parseOffice } from "officeparser";
import { getAnthropicClient } from "./client";
import { saveDocumentBuffer } from "../uploads";
import { childLogger } from "../logger";

const log = childLogger("ai:extract");

const EXTRACTION_SYSTEM_PROMPT = `Eres un asistente editorial que resume y estructura documentos técnicos de comercio exterior, aduanas y derecho para un sitio institucional.
A partir del texto que recibas (extraído de un PDF, documento Word, presentación PowerPoint o página web), produce:
1. Un título breve e impactante (máximo 90 caracteres), en la primera línea, sin el prefijo "Título:".
2. Un resumen ejecutivo de 1-2 frases, en la segunda línea, sin prefijo.
3. Una línea en blanco.
4. El cuerpo en Markdown limpio y bien formateado que capture los puntos más importantes del documento fuente — no lo transcribas completo, sintetiza lo esencial. Usa las herramientas de formato que hagan falta para que se lea con claridad:
   - Encabezados ## y ### para las secciones principales.
   - Listas (- o numeradas) cuando el contenido enumera elementos o pasos.
   - **Negrita** en términos clave, cifras y fechas importantes.
   - Tablas Markdown (| columna | columna |) cuando el documento compare datos, cifras o categorías — es la forma preferida de presentar información tabular, no la describas en prosa si puede ir en tabla.
No inventes información que no esté en el texto fuente. No agregues un encabezado de nivel 1 (#) al cuerpo — el bloque ya vive dentro de una página con su propio título. No agregues tú mismo una sección de fuente o referencia al final — eso se añade automáticamente después.`;

export type ExtractionResult = {
  title: string;
  summary: string;
  markdown: string;
  /** URL de la fuente (externa) o del documento guardado, ya usada para construir la línea de referencia al final de `markdown`. */
  sourceUrl: string | null;
};

function parseExtractionResponse(raw: string): Omit<ExtractionResult, "sourceUrl"> {
  const lines = raw.trim().split("\n");
  const title = lines[0]?.trim() ?? "Documento sin título";
  const summary = lines[1]?.trim() ?? "";
  const markdown = lines.slice(2).join("\n").trim();
  return { title, summary, markdown };
}

function appendSourceReference(markdown: string, sourceUrl: string, label: string): string {
  return `${markdown}\n\n---\n\n${label}: [${sourceUrl}](${sourceUrl})`;
}

async function structureText(
  rawText: string,
  source: { url: string; label: string } | null
): Promise<ExtractionResult> {
  const { client, model } = await getAnthropicClient();

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: rawText.slice(0, 50_000) }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  const result = parseExtractionResponse(raw);

  if (!source) {
    return { ...result, sourceUrl: null };
  }

  return {
    ...result,
    sourceUrl: source.url,
    markdown: appendSourceReference(result.markdown, source.url, source.label),
  };
}

export type DocumentFileType = "pdf" | "docx" | "pptx" | "html";

const EXTENSION_BY_FILE_TYPE: Record<DocumentFileType, string> = {
  pdf: "pdf",
  docx: "docx",
  pptx: "pptx",
  html: "html",
};

/**
 * Extrae texto plano de un documento (PDF, Word o PowerPoint) y lo
 * estructura vía Claude. `fileType` es obligatorio para buffers sin cabecera
 * mágica reconocible por sí sola en algunos formatos; officeparser deduce el
 * resto por firma de bytes, pero se pasa siempre por explicitud y velocidad.
 *
 * Si `persistOriginal` es true (subida directa de un archivo, no HTML de una
 * URL), el documento se guarda en public/documents/ y el Markdown resultante
 * enlaza esa copia para descarga — así el post conserva el documento fuente
 * incluso si el enlace/servidor original desaparece después.
 */
export async function extractFromDocument(
  buffer: Buffer,
  fileType: DocumentFileType,
  options?: { persistOriginal?: boolean; originalName?: string; createdBy?: string }
): Promise<ExtractionResult> {
  const ast = await parseOffice(buffer, { fileType });
  const { value: text } = await ast.to("text");

  if (!text.trim()) {
    throw new Error("El documento no contiene texto extraíble (puede ser un escaneo de imagen sin OCR).");
  }

  log.info({ fileType, textLength: text.length }, "Documento parseado");

  let source: { url: string; label: string } | null = null;
  if (options?.persistOriginal && fileType !== "html") {
    const documentUrl = await saveDocumentBuffer(buffer, EXTENSION_BY_FILE_TYPE[fileType], {
      originalName: options.originalName,
      createdBy: options.createdBy,
    });
    source = { url: documentUrl, label: "Documento original" };
  }

  return structureText(text, source);
}

/** Compatibilidad con el servidor MCP (create_post_from_media), que solo maneja PDF y sí conserva el documento original. */
export async function extractFromPdf(buffer: Buffer, createdBy?: string): Promise<ExtractionResult> {
  return extractFromDocument(buffer, "pdf", { persistOriginal: true, createdBy });
}

export async function extractFromUrl(url: string): Promise<ExtractionResult> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Solo se admiten URLs http/https.");
  }

  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) {
    throw new Error(`No se pudo descargar la URL (HTTP ${res.status}).`);
  }

  // La URL puede apuntar a HTML o directo a un archivo descargable
  // (ej. enlaces "Descargar PDF" que sirven application/pdf). Se detecta por
  // Content-Type para elegir el fileType correcto en vez de asumir siempre HTML.
  const contentType = res.headers.get("content-type") ?? "";
  const buffer = Buffer.from(await res.arrayBuffer());

  let fileType: DocumentFileType = "html";
  if (contentType.includes("application/pdf")) fileType = "pdf";
  else if (contentType.includes("wordprocessingml")) fileType = "docx";
  else if (contentType.includes("presentationml")) fileType = "pptx";

  log.info({ url, contentType, fileType, bytes: buffer.length }, "URL descargada para extracción");

  const ast = await parseOffice(buffer, { fileType });
  const { value: text } = await ast.to("text");

  if (!text.trim()) {
    throw new Error("No se pudo extraer texto legible de la URL.");
  }

  // Fuente externa: se enlaza la URL original tal cual (no se guarda copia
  // local del archivo/página, a diferencia de un documento subido directo).
  return structureText(text, { url, label: "Para más detalle, consulta la fuente original" });
}
