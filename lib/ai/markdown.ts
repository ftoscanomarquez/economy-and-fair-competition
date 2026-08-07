/**
 * Detección y conversión de texto libre a Markdown, usado por el editor de
 * bloques richtext/twoColumn en el admin (Fase 7C) — ver
 * components/admin/markdown-block-editor.tsx.
 *
 * Flujo: el admin pega texto → looksLikeMarkdown() decide si ofrecer el
 * botón "Convertir con IA" → si el admin lo pide, convertToMarkdown() llama
 * a Claude una sola vez y devuelve el resultado para previsualización (el
 * admin decide aceptar o seguir editando manualmente; nunca se sobreescribe
 * sin confirmación).
 */
import { getAnthropicClient } from "./client";
import { childLogger } from "../logger";

const log = childLogger("ai:markdown");

// Re-exportado por compatibilidad — la implementación real vive en
// lib/markdown-detect.ts (sin dependencias de servidor, seguro para Client
// Components). No la reimportes aquí si el consumidor es un "use client".
export { looksLikeMarkdown } from "../markdown-detect";

const CONVERSION_SYSTEM_PROMPT = `Eres un asistente editorial que estructura texto plano en Markdown limpio y semántico para un sitio de una firma legal.
Reglas:
- Usa encabezados (##, ###) solo si el texto tiene subtemas claros.
- Usa listas (- o 1.) cuando el contenido enumera elementos.
- Usa **negrita** para términos técnicos clave, con moderación.
- No inventes contenido, no agregues información que no esté en el texto original.
- No agregues un título de nivel 1 (#) — el bloque ya vive dentro de una página con su propio título.
- Devuelve únicamente el Markdown resultante, sin explicaciones ni comentarios adicionales.`;

export type MarkdownConversionResult = {
  markdown: string;
  model: string;
};

export async function convertToMarkdown(rawText: string): Promise<MarkdownConversionResult> {
  const { client, model } = await getAnthropicClient();

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: CONVERSION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: rawText }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const markdown = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

  log.info({ inputLength: rawText.length, outputLength: markdown.length }, "Texto convertido a Markdown vía IA");

  return { markdown, model };
}
