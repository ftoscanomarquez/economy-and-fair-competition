import { describe, it, expect } from "vitest";
import { looksLikeMarkdown } from "@/lib/ai/markdown";

describe("looksLikeMarkdown", () => {
  it("considera vacío como 'ya es markdown' (nada que convertir)", () => {
    expect(looksLikeMarkdown("")).toBe(true);
    expect(looksLikeMarkdown("   ")).toBe(true);
  });

  it("detecta encabezados", () => {
    expect(looksLikeMarkdown("## Un subtítulo\n\nTexto normal.")).toBe(true);
  });

  it("detecta listas con viñetas", () => {
    expect(looksLikeMarkdown("- primer punto\n- segundo punto")).toBe(true);
  });

  it("detecta listas numeradas", () => {
    expect(looksLikeMarkdown("1. primer punto\n2. segundo punto")).toBe(true);
  });

  it("detecta negrita", () => {
    expect(looksLikeMarkdown("Este es un texto con **negrita** en medio.")).toBe(true);
  });

  it("detecta enlaces estilo Markdown", () => {
    expect(looksLikeMarkdown("Visita [nuestro sitio](https://example.com) para más información.")).toBe(true);
  });

  it("detecta citas", () => {
    expect(looksLikeMarkdown("> Esta es una cita textual.")).toBe(true);
  });

  it("NO detecta párrafos de texto plano sin ninguna sintaxis Markdown", () => {
    const plainText =
      "Este es un texto de prueba sin formato markdown. Primero hablamos de comercio exterior. Segundo hablamos de aduanas.";
    expect(looksLikeMarkdown(plainText)).toBe(false);
  });

  it("NO se confunde con asteriscos usados como multiplicación o énfasis suelto", () => {
    // Un solo asterisco aislado (no un par válido de itálica) no debe activar falso positivo
    expect(looksLikeMarkdown("El resultado es 4 * 5 = 20.")).toBe(false);
  });
});
