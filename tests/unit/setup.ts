import fs from "node:fs";
import path from "node:path";

// Vitest no carga .env automáticamente como sí hace Next.js — se lee aquí
// para que cualquier módulo importado por los tests (incluso indirectamente,
// vía lib/db.ts o lib/env.ts) encuentre las variables requeridas.
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}
