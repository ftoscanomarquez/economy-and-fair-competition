# Design

<!-- impeccable:design-schema 1 -->

Sistema de diseño de **Economy and Fair Competition**. Los tres anclas de color y la dirección tipográfica general (serif de exhibición + sans técnica) son restricciones de marca fijadas por el cliente, no negociables; el resto del sistema (variantes derivadas, tipografía específica, elemento de firma, retícula, movimiento) se resolvió en Fase 1 siguiendo esas restricciones.

## Modo

**Persuade** en Home / Servicios / Contacto (el visitante decide contactar a la firma). **Read** en Artículos y Notas. **Operate** en el panel admin. Ver `AGENTS.md` §2.1.

## Color — OKLCH

Tres anclas fijadas por el cliente; el resto derivado matemáticamente en el mismo espacio OKLCH para uniformidad perceptual.

| Token | Rol | OKLCH | Hex aprox. |
|---|---|---|---|
| `bg` | Fondo base | `oklch(0.98 0.01 85)` | `#FAF9F6` |
| `bg-soft` | Fondo de sección alterna | `oklch(0.955 0.012 85)` | `#F3F1EB` |
| `surface` | Tarjetas sobre bg | `oklch(0.995 0.004 85)` | `#FEFDFB` |
| `surface-raised` | Modales, elementos flotantes | `oklch(1 0 0)` | `#FFFFFF` |
| `ink` | Texto principal / contraste | `oklch(0.22 0.04 250)` | `#0F172A` |
| `ink-soft` | Texto secundario | `oklch(0.45 0.035 250)` | `#4B5768` |
| `ink-faint` | Metadatos, captions | `oklch(0.62 0.025 250)` | `#7C879A` |
| `accent` | Azul cobalto tenue — acentos, iconografía | `oklch(0.70 0.12 230)` | `#38BDF8` |
| `accent-deep` | CTA primario, enlaces activos | `oklch(0.55 0.13 230)` | `#0E7FBF` |
| `accent-soft` | Fondos de badge/hover suave | `oklch(0.90 0.05 230)` | `#CDEBFA` |
| `border` | Líneas divisorias | `oklch(0.22 0.04 250 / 0.12)` | — |
| `gold` | Acento ceremonial puntual (sellos, cifras clave) | `oklch(0.72 0.11 75)` | `#C9A24B` |

`gold` se usa con extrema moderación: solo en el motivo de "sello institucional" del signature element y en la cifra "+28 años" del hero, nunca como color de UI general — evita que el sistema se sienta "dorado corporativo genérico".

## Tipografía

| Rol | Familia | Justificación |
|---|---|---|
| Display (H1, hero, títulos de sección) | **Fraunces** (variable, ejes `opsz`/`SOFT`/`WONK`, pesos 500/600, incluye itálica) | Serif contemporánea con carácter editorial-técnico: el eje óptico (`opsz`) le da autoridad a tamaños grandes sin volverse ornamental como Playfair, y la itálica funciona para las citas de artículos de tratado (ver signature element). Se descartó Instrument Serif (demasiado ligera para transmitir peso institucional a tamaños de cuerpo) y Playfair Display (sobreusada en el patrón "cream + serif + terracota" que el brief pide evitar por default). |
| Cuerpo / UI | **Inter** | Legibilidad probada en bloques largos de texto legal/técnico, buen soporte de números tabulares (fechas, artículos de tratado, cifras de años de experiencia) |
| Utilitaria (captions, metadatos, código de artículo) | **JetBrains Mono** | Para el motivo tipográfico del signature element (números de artículo tipo "ART. XIX" / "CAP. 10") — un monospace técnico refuerza la lectura de estas referencias como "citas de tratado", no como decoración |

Escala tipográfica (`tailwind.config.ts`): `display-2xl` (hero) → `display-xl` → `display-lg` → `display-md`, todas con `clamp()` fluido y tracking negativo ajustado; `eyebrow` para labels en mayúsculas con tracking amplio (+0.14em).

## Elemento de firma

**Citas de tratado como arquitectura tipográfica.** La firma real cita capítulos específicos de tratados internacionales (Capítulo XIX del TLCAN, Capítulo 10 del T-MEC, mecanismos de la OMC) — esto es información factual real, no un motivo decorativo inventado. Se usa como dispositivo estructural recurrente:

- Cada sección mayor de la Home lleva un "número de artículo" en `JetBrains Mono` como eyebrow (ej. `ART. 102 — MISIÓN`, `CAP. 10 — SERVICIOS`), evocando la numeración de instrumentos comerciales reales sin fabricar referencias legales falsas (los números son arbitrarios/estructurales del sitio, no citas jurídicas reales — esto se declara así para no crear la impresión de que cada número es una cita textual de un tratado).
- El hero usa una línea de "ruta comercial" sutil (SVG, trazo animado con `route-draw` keyframe) como fondo ambiental — conecta visualmente con "comercio exterior" sin caer en el cliché de mapa-mundi genérico ni en balanza de la justicia.
- Se descartaron: (a) sello/sceau reinterpretado — demasiado cercano al cliché notarial; (b) mapa de rutas como elemento central — se degradó a fondo ambiental secundario del hero para no competir con el mensaje.

## Retícula y layout

- Espaciado en múltiplos estrictos de 8px (`tailwind.config.ts` → `spacing["1x"..."24x"]`).
- `max-w-content` = 1200px para secciones; `max-w-prose` = 68ch para bloques de lectura larga (Artículos y Notas).
- `border-radius`: escala discreta 4/8/12/16/24px — nunca `rounded-full` en botones o tarjetas (mantiene el registro institucional, evita la estética "app consumer").

## Movimiento

- Easing único: `cubic-bezier(0.22, 0.61, 0.36, 1)` (`ease-institutional` en Tailwind) — fluido, sin overshoot/rebote, en toda animación del sitio.
- `prefers-reduced-motion: reduce` respetado globalmente en `app/globals.css` (reduce todas las animaciones/transiciones a 0.01ms).
- Animaciones con nombre: `fade-up` (reveals de contenido al hacer scroll/montar), `route-draw` (trazo del hero).

## Accesibilidad de base

- `:focus-visible` con ring de 2px en `accent-deep` sobre offset de `bg` — visible en todo elemento interactivo, nunca suprimido.
- Contraste: `ink` sobre `bg` = ratio >14:1 (AAA); `ink-soft` sobre `bg` cumple AA para texto normal.

## Componentes base (Fase 1)

Construidos sobre Radix UI primitives + `class-variance-authority` para variantes, en `components/ui/`: `Button`, `Card`, `Badge`, `Dialog`, `Drawer` (Radix Dialog con slide-in lateral), `Tabs`, `Toast`, `Input`/`Textarea`/`Label`, `NavigationMenu`. Todos consumen los tokens de `tailwind.config.ts`, ninguno usa color hardcodeado.
