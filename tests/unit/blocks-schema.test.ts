import { describe, it, expect } from "vitest";
import {
  blockTypeSchema,
  templateBlockSchema,
  contentBlockSchema,
  chartDataRowSchema,
  emptyBlockContent,
  BLOCK_TYPE_LABELS,
} from "@/lib/blocks/schema";

describe("blockTypeSchema", () => {
  it("acepta los 4 tipos de bloque válidos", () => {
    for (const type of ["hero", "richtext", "twoColumn", "chart"]) {
      expect(blockTypeSchema.safeParse(type).success).toBe(true);
    }
  });

  it("rechaza un tipo de bloque desconocido", () => {
    expect(blockTypeSchema.safeParse("video").success).toBe(false);
  });
});

describe("templateBlockSchema", () => {
  it("valida un bloque de plantilla mínimo (sin contenido)", () => {
    const result = templateBlockSchema.safeParse({ id: "b1", type: "hero" });
    expect(result.success).toBe(true);
  });

  it("rechaza un bloque de plantilla sin id", () => {
    const result = templateBlockSchema.safeParse({ type: "hero" });
    expect(result.success).toBe(false);
  });
});

describe("contentBlockSchema (unión discriminada)", () => {
  it("valida un bloque hero completo", () => {
    const result = contentBlockSchema.safeParse({
      id: "b1",
      type: "hero",
      title: "Título",
      imageUrl: "/uploads/x.png",
    });
    expect(result.success).toBe(true);
  });

  it("aplica defaults en un bloque richtext incompleto", () => {
    const result = contentBlockSchema.safeParse({ id: "b1", type: "richtext" });
    expect(result.success).toBe(true);
    if (result.success && result.data.type === "richtext") {
      expect(result.data.markdown).toBe("");
    }
  });

  it("rechaza un bloque chart con chartType inválido", () => {
    const result = contentBlockSchema.safeParse({
      id: "b1",
      type: "chart",
      chartType: "donut-3d",
      data: [],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando el discriminante 'type' no coincide con ningún bloque conocido", () => {
    const result = contentBlockSchema.safeParse({ id: "b1", type: "video", url: "x" });
    expect(result.success).toBe(false);
  });
});

describe("chartDataRowSchema", () => {
  it("acepta una fila con label y value numérico", () => {
    expect(chartDataRowSchema.safeParse({ label: "2024", value: 42 }).success).toBe(true);
  });

  it("rechaza una fila sin label", () => {
    expect(chartDataRowSchema.safeParse({ label: "", value: 42 }).success).toBe(false);
  });

  it("rechaza un value no numérico", () => {
    expect(chartDataRowSchema.safeParse({ label: "2024", value: "42" }).success).toBe(false);
  });
});

describe("emptyBlockContent", () => {
  it("genera contenido vacío correcto para cada tipo de bloque", () => {
    expect(emptyBlockContent("id1", "hero")).toEqual({
      id: "id1",
      type: "hero",
      title: "",
      imageUrl: null,
    });
    expect(emptyBlockContent("id2", "richtext")).toEqual({
      id: "id2",
      type: "richtext",
      markdown: "",
    });
    expect(emptyBlockContent("id3", "twoColumn")).toEqual({
      id: "id3",
      type: "twoColumn",
      markdown: "",
      imageUrl: null,
      imagePosition: "right",
    });
    expect(emptyBlockContent("id4", "chart")).toEqual({
      id: "id4",
      type: "chart",
      title: "",
      chartType: "bar",
      data: [],
    });
  });
});

describe("BLOCK_TYPE_LABELS", () => {
  it("tiene etiquetas ES/EN para los 4 tipos de bloque", () => {
    for (const type of ["hero", "richtext", "twoColumn", "chart"] as const) {
      expect(BLOCK_TYPE_LABELS[type].es).toBeTruthy();
      expect(BLOCK_TYPE_LABELS[type].en).toBeTruthy();
    }
  });
});
