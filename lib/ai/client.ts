/**
 * Cliente compartido de la API de Claude para todo el proyecto. Nunca
 * instanciar Anthropic() directamente en otro archivo — siempre pasar por
 * getAnthropicClient(), que resuelve la key vía lib/ai-config.ts
 * (admin en Mongo > .env > error explícito).
 */
import Anthropic from "@anthropic-ai/sdk";
import { resolveAiConfig } from "../ai-config";

export class AiNotConfiguredError extends Error {
  constructor() {
    super(
      "No hay una API key de Claude configurada. Un administrador debe configurarla desde /admin, o definir ANTHROPIC_API_KEY en .env."
    );
    this.name = "AiNotConfiguredError";
  }
}

export async function getAnthropicClient(): Promise<{ client: Anthropic; model: string }> {
  const config = await resolveAiConfig();
  if (!config) {
    throw new AiNotConfiguredError();
  }
  return { client: new Anthropic({ apiKey: config.apiKey }), model: config.model };
}
