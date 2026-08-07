/**
 * Traducción ES<->EN de campos de content items (título/resumen/detalle de
 * Especialización, Servicios e Industrias) — usada por
 * components/admin/content-items-manager.tsx cuando el admin llena un
 * idioma y el otro campo queda vacío: se traduce automáticamente en vez de
 * copiar el texto tal cual (a diferencia de imágenes, que sí son el mismo
 * valor en ambos idiomas). Si el Markdown está presente en el origen, la
 * traducción debe preservar la sintaxis (encabezados, listas, negritas).
 */
import { getAnthropicClient } from "./client";
import { childLogger } from "../logger";

const log = childLogger("ai:translate");

const TRANSLATION_SYSTEM_PROMPT = `Eres un traductor profesional para el sitio institucional de una firma legal especializada en comercio exterior, derecho aduanero y propiedad intelectual.
Reglas:
- Traduce el texto de forma precisa y natural, con el registro institucional/técnico apropiado para una firma legal (nunca informal).
- Si el texto de origen usa sintaxis Markdown (encabezados #, listas -/1., **negrita**, [enlaces](url)), preserva exactamente esa misma estructura en la traducción — no la elimines ni la agregues si no estaba.
- No agregues información, ejemplos, cifras o afirmaciones que no estén en el texto original.
- No agregues comentarios, notas ni explicaciones — devuelve únicamente el texto traducido.`;

export type TranslateDirection = "es-to-en" | "en-to-es";

export async function translateContentText(text: string, direction: TranslateDirection): Promise<string> {
  if (!text.trim()) return "";

  const { client, model } = await getAnthropicClient();
  const targetLabel = direction === "es-to-en" ? "inglés" : "español";

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: TRANSLATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Traduce el siguiente texto al ${targetLabel}:\n\n${text}` }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const translated = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

  log.info({ direction, inputLength: text.length, outputLength: translated.length }, "Texto traducido vía IA");

  return translated;
}

export type ContentItemFields = {
  title: string;
  summary: string;
  detail: string;
};

const DELIMITER_TITLE = "---TITLE---";
const DELIMITER_SUMMARY = "---SUMMARY---";
const DELIMITER_DETAIL = "---DETAIL---";

/**
 * Traduce título/resumen/detalle de un content item en una sola llamada a
 * Claude (delimitadores de texto plano en vez de JSON — más robusto cuando
 * el detalle contiene Markdown con caracteres que romperían un JSON strict).
 */
export async function translateContentItemFields(
  fields: ContentItemFields,
  direction: TranslateDirection
): Promise<ContentItemFields> {
  const { client, model } = await getAnthropicClient();
  const targetLabel = direction === "es-to-en" ? "inglés" : "español";

  const prompt = `Traduce cada una de las siguientes 3 secciones al ${targetLabel}, manteniendo exactamente los mismos delimitadores en tu respuesta:

${DELIMITER_TITLE}
${fields.title}
${DELIMITER_SUMMARY}
${fields.summary}
${DELIMITER_DETAIL}
${fields.detail}`;

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: TRANSLATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

  const titleMatch = raw.split(DELIMITER_SUMMARY)[0]?.split(DELIMITER_TITLE)[1]?.trim() ?? "";
  const summaryMatch = raw.split(DELIMITER_DETAIL)[0]?.split(DELIMITER_SUMMARY)[1]?.trim() ?? "";
  const detailMatch = raw.split(DELIMITER_DETAIL)[1]?.trim() ?? "";

  log.info({ direction }, "Campos de content item traducidos vía IA");

  return { title: titleMatch, summary: summaryMatch, detail: detailMatch };
}
