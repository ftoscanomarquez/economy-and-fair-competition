/**
 * Genera un reporte HTML legible a partir del JSON que produce
 * `semgrep scan --json`. El CLI de Semgrep no tiene un formato --html
 * nativo (a diferencia de Vitest/Playwright), así que este script cierra
 * ese hueco para cumplir el requisito de "reporte HTML" de la Fase 9.
 * Uso: node scripts/semgrep-html-report.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const jsonPath = "tests/reports/semgrep/report.json";
const htmlPath = "tests/reports/semgrep/report.html";

const report = JSON.parse(readFileSync(jsonPath, "utf8"));
const results = report.results ?? [];

const severityOrder = { ERROR: 0, WARNING: 1, INFO: 2 };
const sorted = [...results].sort(
  (a, b) => (severityOrder[a.extra.severity] ?? 3) - (severityOrder[b.extra.severity] ?? 3)
);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const severityBadge = { ERROR: "#dc2626", WARNING: "#d97706", INFO: "#2563eb" };

const rows = sorted
  .map((f) => {
    const color = severityBadge[f.extra.severity] ?? "#6b7280";
    return `
      <tr>
        <td><span style="background:${color};color:white;padding:2px 8px;border-radius:4px;font-size:12px;">${f.extra.severity}</span></td>
        <td><code>${escapeHtml(f.check_id)}</code></td>
        <td><code>${escapeHtml(f.path)}:${f.start.line}</code></td>
        <td>${escapeHtml(f.extra.message)}</td>
      </tr>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Reporte Semgrep — Economy and Fair Competition</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #1a1a1a; }
  h1 { font-size: 1.5rem; }
  .summary { color: #555; margin-bottom: 1.5rem; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e5e5e5; padding: 8px 12px; text-align: left; vertical-align: top; font-size: 14px; }
  th { background: #f5f5f5; }
  code { font-size: 13px; background: #f5f5f5; padding: 1px 4px; border-radius: 3px; }
</style>
</head>
<body>
  <h1>Reporte SAST — Semgrep</h1>
  <p class="summary">Generado el ${new Date().toISOString()} · ${results.length} hallazgo(s) totales</p>
  ${
    results.length === 0
      ? "<p>Sin hallazgos.</p>"
      : `<table>
    <thead><tr><th>Severidad</th><th>Regla</th><th>Ubicación</th><th>Mensaje</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`
  }
</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");
console.log(`Reporte HTML generado en ${htmlPath} (${results.length} hallazgos)`);
