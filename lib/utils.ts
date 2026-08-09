import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Registra las escalas de fuente custom de tailwind.config.ts (fontSize) como
// parte del grupo "font-size" — sin esto, tailwind-merge no las reconoce y las
// clasifica como "text-color", descartando p. ej. "text-display-xl" cuando
// coexiste con "text-ink" en el mismo className (ver HISTORY.md).
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display-2xl", "display-xl", "display-lg", "display-md", "eyebrow"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
