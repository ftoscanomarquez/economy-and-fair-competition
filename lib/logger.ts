import fs from "node:fs";
import path from "node:path";
import pino from "pino";
import { getEnv } from "./env";

const env = getEnv();

// En Vercel (y cualquier plataforma serverless) el filesystem del proceso es
// de solo lectura salvo /tmp — un pino.destination() a un archivo físico
// tumba cada request con EROFS. VERCEL es la variable que la plataforma
// inyecta automáticamente en runtime; ahí el logger escribe a stdout, que
// Vercel ya captura y muestra en su panel de logs sin configuración extra.
// El archivo físico solo tiene sentido para desarrollo/despliegues propios
// con disco persistente (ver OBSERVABILIDAD.md).
const useFileLog = env.NODE_ENV !== "production" || !process.env.VERCEL;

let fileDestination: pino.DestinationStream | undefined;
if (useFileLog) {
  const logFilePath = path.resolve(process.cwd(), env.LOG_FILE_PATH);
  const logDir = path.dirname(logFilePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fileDestination = pino.destination({ dest: logFilePath, mkdir: true, sync: false });
}

const targets: pino.TransportTargetOptions[] =
  env.NODE_ENV === "development"
    ? [{ target: "pino-pretty", level: env.PINO_LOG_LEVEL, options: { colorize: true } }]
    : [];

export const logger = pino(
  {
    level: env.PINO_LOG_LEVEL,
    base: { service: "economy-and-fair-competition", env: env.NODE_ENV },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  },
  env.NODE_ENV === "development"
    ? pino.multistream([
        { stream: fileDestination!, level: env.PINO_LOG_LEVEL as pino.Level },
        ...(targets.length ? [{ stream: pino.transport({ targets }), level: env.PINO_LOG_LEVEL as pino.Level }] : []),
      ])
    : (fileDestination ?? pino.destination(1))
);

export function childLogger(scope: string) {
  return logger.child({ scope });
}
