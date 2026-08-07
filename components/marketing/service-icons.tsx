import {
  Compass,
  Scale,
  FileCheck2,
  ShieldCheck,
  Gavel,
  Landmark,
  PackageSearch,
  ClipboardCheck,
  Stamp,
  Building2,
  type LucideIcon,
} from "lucide-react";

/**
 * Un ícono por cada uno de los 10 servicios (mismo orden que content/seeds/site-texts.ts,
 * claves services.1..10), elegido por relación conceptual directa con el servicio,
 * no genéricos intercambiables.
 */
export const SERVICE_ICONS: LucideIcon[] = [
  Compass, // 1. Consultoría Estratégica en Comercio Internacional
  Scale, // 2. Clasificación Arancelaria y Valoración Técnica
  FileCheck2, // 3. Optimización de Tratados y Reglas de Origen
  ShieldCheck, // 4. Gobierno Corporativo de Cumplimiento
  Gavel, // 5. Defensa Comercial, Antidumping
  Landmark, // 6. Litigio Especializado y Solución de Controversias
  PackageSearch, // 7. Programas de Fomento (IMMEX, PROSEC, Drawback)
  ClipboardCheck, // 8. Auditorías Aduaneras Preventivas
  Stamp, // 9. Certificación y Verificación de Origen
  Building2, // 10. Relaciones Institucionales y Propiedad Intelectual
];
