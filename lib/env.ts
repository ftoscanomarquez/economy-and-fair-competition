import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url(),

  MONGODB_URI: z.string().min(1, "MONGODB_URI es requerido"),
  MONGODB_DB: z.string().min(1, "MONGODB_DB es requerido"),

  MAILPIT_HOST: z.string().default("localhost"),
  MAILPIT_PORT: z.coerce.number().default(1025),
  MAILPIT_UI_URL: z.string().default("http://localhost:8025"),
  RESEND_API_KEY: z.string().optional().default(""),
  MAIL_FROM: z.string().default("Economy and Fair Competition <no-reply@economyandfaircompetition.com>"),
  CONTACT_NOTIFICATION_EMAIL: z.string().email(),

  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  MAGIC_LINK_CODE_TTL_MINUTES: z.coerce.number().default(10),
  MAGIC_LINK_MAX_ATTEMPTS: z.coerce.number().default(5),
  ADMIN_ALLOWED_EMAILS: z.string().min(1),
  SESSION_COOKIE_NAME: z.string().default("efc_session"),

  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["es", "en"]).default("es"),
  NEXT_PUBLIC_LOCALES: z.string().default("es,en"),

  PINO_LOG_LEVEL: z.string().default("info"),
  LOG_FILE_PATH: z.string().default("./logs/app.log"),

  UPLOADS_DIR: z.string().default("./public/uploads"),
  DOCUMENTS_DIR: z.string().default("./public/documents"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(15),
  MAX_DOCUMENT_SIZE_MB: z.coerce.number().default(20),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),

  MCP_WEBHOOK_SECRET: z.string().optional().default(""),
  WHATSAPP_PROVIDER: z.string().optional().default(""),
  WHATSAPP_VERIFY_TOKEN: z.string().optional().default(""),
  // Teléfonos autorizados a ejecutar mutaciones (update_post/delete_post) vía
  // MCP, formato E.164 separados por coma. Análogo a ADMIN_ALLOWED_EMAILS
  // pero para el canal de WhatsApp — ver AGENTS.md §10.5.
  MCP_ADMIN_PHONES: z.string().optional().default(""),

  // Fallback de desarrollo/arranque. En producción, el admin puede
  // configurar su propia key desde /admin (se guarda cifrada en Mongo,
  // ver lib/ai-config.ts) — esa toma prioridad sobre esta variable.
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-5"),
  AI_CONFIG_ENCRYPTION_KEY: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Variables de entorno inválidas:\n${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function getAdminAllowedEmails(): string[] {
  return getEnv()
    .ADMIN_ALLOWED_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getLocales(): string[] {
  return getEnv()
    .NEXT_PUBLIC_LOCALES.split(",")
    .map((locale) => locale.trim())
    .filter(Boolean);
}

export function getMcpAdminPhones(): string[] {
  return getEnv()
    .MCP_ADMIN_PHONES.split(",")
    .map((phone) => phone.trim())
    .filter(Boolean);
}
