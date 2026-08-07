/**
 * Composición editorial para Quiénes Somos: un motivo de "sello institucional"
 * abstracto (anillos concéntricos + marcas radiales, como un timbre de
 * certificación) evocando trayectoria y autoridad institucional sin caer en
 * el cliché literal de una balanza de la justicia.
 */
export function AboutVisual({ className }: { className?: string }) {
  const marks = Array.from({ length: 36 }, (_, i) => i);

  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" className={className} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="about-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="oklch(0.98 0.01 85)" stopOpacity="0" />
          <stop offset="70%" stopColor="oklch(0.90 0.05 230)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="oklch(0.90 0.05 230)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="200" r="180" fill="url(#about-glow)" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="oklch(0.22 0.04 250 / 0.12)" strokeWidth="1" />
      <circle cx="200" cy="200" r="128" fill="none" stroke="oklch(0.55 0.13 230 / 0.4)" strokeWidth="1.5" />

      {marks.map((i) => {
        const angle = (i / marks.length) * 2 * Math.PI;
        const outer = 128;
        const inner = i % 3 === 0 ? 108 : 116;
        const x1 = 200 + outer * Math.cos(angle);
        const y1 = 200 + outer * Math.sin(angle);
        const x2 = 200 + inner * Math.cos(angle);
        const y2 = 200 + inner * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 3 === 0 ? "oklch(0.72 0.11 75 / 0.6)" : "oklch(0.22 0.04 250 / 0.2)"}
            strokeWidth={i % 3 === 0 ? 1.5 : 1}
          />
        );
      })}

      <circle cx="200" cy="200" r="70" fill="none" stroke="oklch(0.22 0.04 250 / 0.15)" strokeWidth="1" />
      <text
        x="200"
        y="196"
        textAnchor="middle"
        className="font-display"
        fontSize="15"
        fill="oklch(0.22 0.04 250 / 0.55)"
      >
        EST. 1998
      </text>
      <text
        x="200"
        y="216"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="0.14em"
        fill="oklch(0.55 0.13 230 / 0.6)"
      >
        OMC · TLCAN · T-MEC
      </text>
    </svg>
  );
}
