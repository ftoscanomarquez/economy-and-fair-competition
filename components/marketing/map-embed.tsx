/**
 * Mapa real de Google Maps vía iframe embed (formato `?output=embed`), sin
 * API key ni cuenta de Google Cloud — reemplaza el SVG decorativo previo
 * (styled-map.tsx, nunca fue un mapa real). Documentado en QUICK-START.md
 * cómo generar/editar la URL para otra dirección.
 */
export function MapEmbed({ address, label }: { address: string; label: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="h-full min-h-[320px] w-full overflow-hidden rounded-md border border-border">
      <iframe
        title={label}
        src={src}
        className="h-full w-full min-h-[320px] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
