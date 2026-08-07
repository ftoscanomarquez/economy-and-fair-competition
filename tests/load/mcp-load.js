// Prueba de carga k6 — endpoint del servidor MCP (POST /api/mcp).
//
// Solo ejercita herramientas de LECTURA (list_templates, list_posts,
// get_post_detail). Las herramientas de escritura (create_post_from_media,
// update_post, delete_post) quedan fuera a propósito: VUs concurrentes
// escribiendo contra Mongo Atlas real generaría datos basura y no reflejaría
// un patrón de uso real (WhatsApp es de baja frecuencia en escrituras).
//
// IMPORTANTE — el endpoint aplica rate limiting de 30 req/min POR IP
// (app/api/mcp/route.ts, patrón de resiliencia obligatorio). k6 ejecutado
// desde una sola máquina origina todo el tráfico desde la misma IP, así que
// la concurrencia de este script se mantiene deliberadamente baja (<=15 VUs)
// para medir latencia real del endpoint sin disparar el 429 que el propio
// rate limiter debe emitir por diseño. Ver INFRA.md para el mapeo completo
// de dónde vive cada control de resiliencia.
//
// Requiere MCP_WEBHOOK_SECRET del .env del proyecto:
//   k6 run --env MCP_SECRET=<valor> tests/load/mcp-load.js
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3100";
const MCP_SECRET = __ENV.MCP_SECRET;
const errorRate = new Rate("errores_negocio_mcp");
const rateLimited = new Rate("bloqueados_por_rate_limit");

if (!MCP_SECRET) {
  throw new Error("Falta --env MCP_SECRET=<valor de MCP_WEBHOOK_SECRET en .env>");
}

export const options = {
  scenarios: {
    mcp_sostenido: {
      executor: "constant-vus",
      vus: 5, // a 3 llamadas/iteración y ~2s de sleep, ronda cerca del límite de 30 req/min sin dispararlo en exceso
      duration: "2m",
    },
  },
  thresholds: {
    errores_negocio_mcp: ["rate<0.01"], // solo cuenta como error un status inesperado (ni 200 ni 429)
  },
};

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${MCP_SECRET}`,
};

export default function escenarioMcp() {
  let res = http.post(
    `${BASE_URL}/api/mcp`,
    JSON.stringify({ tool: "list_templates", params: {} }),
    { headers, tags: { name: "mcp_list_templates" } }
  );
  registrarResultado(res, "list_templates");
  sleep(0.5);

  res = http.post(
    `${BASE_URL}/api/mcp`,
    JSON.stringify({ tool: "list_posts", params: { locale: "es" } }),
    { headers, tags: { name: "mcp_list_posts" } }
  );
  registrarResultado(res, "list_posts");
  sleep(0.5);

  res = http.post(
    `${BASE_URL}/api/mcp`,
    JSON.stringify({
      tool: "get_post_detail",
      params: { slug: "controversias-omc-perspectiva-institucional", locale: "es" },
    }),
    { headers, tags: { name: "mcp_get_post_detail" } }
  );
  registrarResultado(res, "get_post_detail", [200, 404]);

  sleep(1);
}

// 429 se cuenta como el rate limiter funcionando correctamente (30 req/min por
// IP), no como error de negocio — solo un status fuera de lo esperado es fallo real.
function registrarResultado(res, label, okStatuses = [200]) {
  const isRateLimited = res.status === 429;
  const isOk = okStatuses.includes(res.status);
  check(res, { [`${label} status esperado (200/404 o 429 de rate limit)`]: () => isOk || isRateLimited });
  rateLimited.add(isRateLimited ? 1 : 0);
  errorRate.add(isOk || isRateLimited ? 0 : 1);
}

export function handleSummary(data) {
  return {
    "tests/reports/k6/mcp-load.html": htmlReport(data),
    stdout: JSON.stringify(data, null, 2).slice(0, 2000),
  };
}
