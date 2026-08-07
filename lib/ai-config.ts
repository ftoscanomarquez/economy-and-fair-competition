/**
 * Resolución de la API key de Claude a usar en toda llamada a la IA
 * (conversión de texto a Markdown, extracción de PDF/URL, futuro asistente
 * de redacción del toolbar admin). Ver diagrama de flujo en DIAGRAMAS.md
 * ("Resolución de la API key de IA").
 *
 * Prioridad: admin (Mongo, cifrada) > ANTHROPIC_API_KEY de .env > null.
 * TODO llamador de la API de Claude debe pasar por resolveAiConfig() —
 * nunca leer process.env.ANTHROPIC_API_KEY directamente en otro módulo.
 */
import crypto from "node:crypto";
import { getDb } from "./db";
import { getEnv } from "./env";
import { childLogger } from "./logger";

const log = childLogger("ai-config");

const ALGORITHM = "aes-256-gcm";
const AUTH_TAG_LENGTH = 16; // 128 bits — especificado explícitamente (hallazgo Semgrep, Fase 9): sin este valor el decipher no verifica la longitud esperada del tag de autenticación
const CONFIG_DOC_ID = "anthropic";

type AiConfigDoc = {
  _id: string;
  encryptedApiKey: string;
  iv: string;
  authTag: string;
  model: string | null;
  updatedAt: Date;
  updatedBy: string | null;
};

function getEncryptionKey(): Buffer {
  const env = getEnv();
  if (!env.AI_CONFIG_ENCRYPTION_KEY) {
    throw new Error(
      "AI_CONFIG_ENCRYPTION_KEY no está configurada. Genera una con `node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"` y agrégala a .env."
    );
  }
  const key = Buffer.from(env.AI_CONFIG_ENCRYPTION_KEY, "hex");
  if (key.length !== 32) {
    throw new Error("AI_CONFIG_ENCRYPTION_KEY debe ser una cadena hex de 32 bytes (64 caracteres).");
  }
  return key;
}

function encrypt(plainText: string): { encrypted: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return {
    encrypted: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
  };
}

function decrypt(encryptedHex: string, ivHex: string, authTagHex: string): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivHex, "hex"), {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const authTag = Buffer.from(authTagHex, "hex");
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Tag de autenticación con longitud inesperada.");
  }
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export async function saveAiApiKey(apiKey: string, model: string | null, adminEmail: string): Promise<void> {
  const db = await getDb();
  const { encrypted, iv, authTag } = encrypt(apiKey);

  await db.collection<AiConfigDoc>("ai_config").updateOne(
    { _id: CONFIG_DOC_ID },
    {
      $set: {
        encryptedApiKey: encrypted,
        iv,
        authTag,
        model,
        updatedAt: new Date(),
        updatedBy: adminEmail,
      },
    },
    { upsert: true }
  );
  log.info({ adminEmail }, "API key de IA actualizada por el admin");
}

export async function clearAiApiKey(adminEmail: string): Promise<void> {
  const db = await getDb();
  await db.collection<AiConfigDoc>("ai_config").deleteOne({ _id: CONFIG_DOC_ID });
  log.info({ adminEmail }, "API key de IA (configuración de admin) eliminada, se usará el fallback de .env");
}

export type ResolvedAiConfig = { apiKey: string; model: string; source: "admin" | "env" };

/**
 * Resuelve la API key de Anthropic a usar: prioriza la configurada por el
 * admin en Mongo (cifrada); si no existe, cae a ANTHROPIC_API_KEY de .env.
 */
export async function resolveAiConfig(): Promise<ResolvedAiConfig | null> {
  const env = getEnv();
  const db = await getDb();
  const doc = await db.collection<AiConfigDoc>("ai_config").findOne({ _id: CONFIG_DOC_ID });

  if (doc) {
    try {
      const apiKey = decrypt(doc.encryptedApiKey, doc.iv, doc.authTag);
      return { apiKey, model: doc.model ?? env.ANTHROPIC_MODEL, source: "admin" };
    } catch (error) {
      log.error({ error }, "No se pudo descifrar la API key de IA guardada por el admin, usando fallback de .env");
    }
  }

  if (env.ANTHROPIC_API_KEY) {
    return { apiKey: env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL, source: "env" };
  }

  return null;
}

export async function getAiConfigStatus(): Promise<{ configured: boolean; source: "admin" | "env" | "none" }> {
  const config = await resolveAiConfig();
  if (!config) return { configured: false, source: "none" };
  return { configured: true, source: config.source };
}
