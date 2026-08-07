import { MapPin } from "lucide-react";

/**
 * Mapa ilustrativo estilizado con la paleta OKLCH de la firma, sin dependencia
 * de una API key de Google Maps. Reemplazable por un mapa interactivo real
 * cuando se confirme la integración.
 */
export function StyledMap({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative h-full min-h-[320px] w-full overflow-hidden rounded-md border border-border bg-ink"
    >
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full opacity-40"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.70 0.12 230 / 0.15)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#grid)" />
        <path
          d="M 20 300 C 100 280, 140 180, 220 160 C 280 145, 320 100, 380 60"
          stroke="oklch(0.70 0.12 230 / 0.3)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 0 120 C 80 140, 160 90, 240 110 C 300 125, 340 200, 400 220"
          stroke="oklch(0.70 0.12 230 / 0.2)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-deep shadow-raised">
          <MapPin className="h-6 w-6 text-bg" aria-hidden="true" />
        </div>
        <div className="mx-auto mt-2 h-2 w-2 rounded-full bg-accent-deep/40 blur-[2px]" />
      </div>

      <div className="absolute bottom-4 left-4 rounded bg-bg/95 px-3 py-1.5 font-mono text-xs text-ink">
        Ciudad de México, México
      </div>
    </div>
  );
}
