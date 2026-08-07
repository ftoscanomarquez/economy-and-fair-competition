/**
 * Generación de imágenes con IA vía pollinations.ai — usada por los bloques
 * hero/twoColumn del editor de posts (components/admin/image-upload-field.tsx),
 * botón "Generar imagen con IA". API pública, sin API key (https://image.pollinations.ai).
 *
 * Resiliencia (patrón obligatorio del proyecto, ver lib/circuit-breaker.ts):
 * pollinations.ai es un servicio externo gratuito, sin SLA. Si no responde o
 * responde con error, la llamada se registra como fallo del circuito y se
 * lanza ImageGenerationUnavailableError — el editor de posts captura ese error,
 * muestra un aviso claro y dejar el bloque SIN imagen (el resto del post se
 * guarda con normalidad). El admin puede volver a pulsar "Generar imagen" en
 * cualquier momento posterior desde el mismo editor; no hay reintento
 * automático en segundo plano ni cola — "esperar a que pase el tiempo y
 * reintentar manualmente" es el comportamiento pedido explícitamente.
 */
import { withCircuitBreaker } from "@/lib/circuit-breaker";
import { saveImageBuffer } from "@/lib/uploads";
import { getAnthropicClient } from "@/lib/ai/client";
import { childLogger } from "@/lib/logger";

const log = childLogger("ai:image-generation");

const POLLINATIONS_BASE_URL = "https://image.pollinations.ai/prompt";
const REQUEST_TIMEOUT_MS = 30_000;

const PROMPT_SUGGESTION_SYSTEM_PROMPT = `Eres un director de arte que escribe prompts de generación de imágenes para un sitio editorial de una firma legal internacional (comercio exterior, aduanas, propiedad intelectual).
A partir del texto que te da el usuario (título o fragmento de un artículo), escribe UN SOLO prompt en español, detallado y visual, para generar una fotografía o ilustración editorial de alto impacto que acompañe ese contenido.
Reglas:
- Describe escena, composición, iluminación y estilo fotográfico (ej. "fotografía documental", "luz dorada de atardecer", "plano general").
- Nunca incluyas texto, letras, logotipos ni marcas de agua en la descripción.
- No repitas literalmente el texto de entrada — interprétalo visualmente.
- Máximo 350 caracteres.
- Devuelve ÚNICAMENTE el prompt, sin comillas, explicaciones ni prefijos.`;

export class ImageGenerationUnavailableError extends Error {
  constructor() {
    super(
      "El servicio de generación de imágenes no está disponible en este momento. Intenta de nuevo más tarde."
    );
    this.name = "ImageGenerationUnavailableError";
  }
}

async function fetchFromPollinations(prompt: string): Promise<Buffer> {
  const encodedPrompt = encodeURIComponent(prompt);
  // pollinations.ai devuelve la MISMA imagen para el mismo prompt si no se
  // varía el seed (y el navegador además cachea la URL exacta) — sin esto,
  // "quitar la imagen y generar otra" con el mismo texto de bloque siempre
  // reproducía la imagen anterior en vez de una nueva.
  const seed = Math.floor(Math.random() * 1_000_000_000);
  const url = `${POLLINATIONS_BASE_URL}/${encodedPrompt}?width=1600&height=900&nologo=true&seed=${seed}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`pollinations.ai respondió ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Genera una imagen a partir de un prompt de texto y la guarda en
 * public/uploads, igual que una subida manual. Lanza
 * ImageGenerationUnavailableError si el circuito está abierto o la llamada falla
 * — nunca deja el post a medio guardar ni reintenta automáticamente.
 */
export async function generateImageFromPrompt(prompt: string, createdBy?: string): Promise<{ url: string }> {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("El prompt de generación de imagen no puede estar vacío.");
  }

  const buffer = await withCircuitBreaker(
    "pollinations-image-generation",
    () => fetchFromPollinations(trimmedPrompt),
    (reason, error) => {
      log.error({ reason, error, prompt: trimmedPrompt }, "No se pudo generar imagen vía pollinations.ai");
      throw new ImageGenerationUnavailableError();
    }
  );

  const url = await saveImageBuffer(buffer, "jpg", { createdBy, folder: "generado-ia" });
  log.info({ url, prompt: trimmedPrompt }, "Imagen generada con IA y guardada");
  return { url };
}

/**
 * Pide a Claude que expanda el texto del bloque (título o fragmento) en un
 * prompt de imagen más detallado y visual. El resultado se muestra al admin
 * como sugerencia editable — nunca se genera la imagen automáticamente con
 * este prompt, es un paso intermedio antes de "Generar imagen con IA".
 */
export async function suggestImagePrompt(sourceText: string): Promise<string> {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    throw new Error("No hay texto en el bloque para sugerir un prompt.");
  }

  const { client, model } = await getAnthropicClient();
  const response = await client.messages.create({
    model,
    max_tokens: 300,
    system: PROMPT_SUGGESTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: trimmed }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const suggestion = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

  if (!suggestion) {
    throw new Error("La IA no devolvió una sugerencia de prompt.");
  }

  log.info({ sourceLength: trimmed.length, suggestionLength: suggestion.length }, "Prompt de imagen sugerido por IA");
  return suggestion;
}
