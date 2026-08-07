/**
 * Manifest de descubrimiento MCP siguiendo el borrador SEP-2127 ("MCP Server
 * Cards"), que a la fecha (2026) sigue sin ser un estándar oficial cerrado
 * de Anthropic/MCP — no hay garantía de que todo cliente/extensión lo
 * reconozca, pero es lo más cercano a un mecanismo de descubrimiento pasivo
 * que existe hoy. El servidor MCP real (protocolo estable, JSON-RPC 2.0 vía
 * Streamable HTTP) vive en /api/mcp-public y es lo que un cliente MCP
 * conectado manualmente con esta URL realmente usa.
 */
import { getEnv } from "@/lib/env";

export async function GET() {
  const env = getEnv();
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  const manifest = {
    name: "com.economyandfaircompetition/public",
    title: "Economy and Fair Competition — Contenido público",
    description:
      "Herramientas de solo lectura sobre Artículos, Notas y áreas de práctica publicadas en el sitio de Economy and Fair Competition.",
    version: "1.0.0",
    remotes: [
      {
        url: `${baseUrl}/api/mcp-public`,
        transport: "streamable-http",
        protocolVersion: "2025-06-18",
      },
    ],
  };

  return Response.json(manifest);
}
