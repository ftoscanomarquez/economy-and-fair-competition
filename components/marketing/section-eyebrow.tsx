import { cn } from "@/lib/utils";

/**
 * Eyebrow con motivo de "cita de tratado" (ART./CAP. + número estructural
 * del sitio, no una referencia jurídica real) — el elemento de firma
 * tipográfico documentado en DESIGN.md.
 */
export function SectionEyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-eyebrow uppercase tracking-[0.14em] text-accent-deep",
        className
      )}
    >
      {children}
    </p>
  );
}
