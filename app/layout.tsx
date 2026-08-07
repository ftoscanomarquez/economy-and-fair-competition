import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Economy and Fair Competition",
    template: "%s | Economy and Fair Competition",
  },
  description:
    "Firma internacional especializada en Comercio Exterior, Derecho Aduanero y Propiedad Intelectual e Industrial.",
};

/**
 * proxy.ts (next-intl createMiddleware) redirige "/" a /[locale] antes de
 * llegar aquí, así que <html>/<body> viven en app/[locale]/layout.tsx, el
 * primer layout que realmente envuelve contenido renderizado.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
