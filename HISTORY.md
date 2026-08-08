# HISTORY.md — Bitácora de progreso

> Fuente de verdad para retomar el trabajo exactamente donde se quedó. Cada sesión de trabajo debe actualizar este archivo al terminar (o al alcanzar un checkpoint estable dentro de una fase larga).
>
> Formato por entrada: fecha, fase, qué se completó, qué quedó pendiente, y cualquier decisión o bloqueante relevante.

---

## Estado actual

**Fase en curso:** Ninguna — **las 11 fases planificadas en `AGENTS.md` están cerradas**. El sitio está en producción real y completamente operativo en `https://economyandfaircompetition.com` (Vercel): CI/CD (`ci.yml`/`load-test.yml`), imágenes en Vercel Blob, correo real vía Resend, dirección/mapa reales en Contacto, y todos los textos institucionales (incluido el footer y las estadísticas del hero) editables desde el admin. Sin pendientes de infraestructura ni de contenido conocidos.
**Última actualización:** 2026-08-08

---

## 2026-07-30 — Planificación

- Se generó `AGENTS.md` con la planificación completa por fases, basada en `PROMPT.md`, `ECONOMY-AND-FAIR-COMPETITION.md`, `URUCHURTU.md`, y las skills `toscaprompt` + `frontend-design`.
- Se validó conexión a MongoDB Atlas (credenciales corregidas por el usuario): autenticación OK, lectura/escritura confirmadas. Base `economy-and-fair-competition-db` aún no existe (se crea en Fase 0 con la primera seed).
- Decisiones de gobernanza cerradas con el usuario (ver AGENTS.md §1):
  - DB: MongoDB Atlas.
  - Correo: Mailpit (dev, contenedor compartido `magic-link-mailpit` ya activo) + Resend (prod).
  - Almacenamiento: disco local (no RustFS en MVP).
  - Testing: Vitest (reporte HTML) + Playwright (reporte HTML) + k6 (concurrencia instantánea + sostenida 15 min).
  - Seguridad: Semgrep (SAST, reporte HTML).
  - Observabilidad: Pino, formato JSON, archivo físico de logs.
  - Vault / Traefik+SSL / SonarQube / Elasticsearch+Kibana: **no implementados en MVP**, solo documentados como referencia activable (`docker-compose.yml`, `CERTIFICADOS.md`, `INFRA.md`, `OBSERVABILIDAD.md`).
  - Stack: Next.js 16 + TypeScript + npm.

## 2026-07-31 — Fase 0 en curso

### Completado

- [x] `package.json` con stack completo (Next 16.2.12, React 19.2.8, TypeScript 5.7, Tailwind 3, Radix UI, Framer Motion, next-intl **4.13.4** — se corrigió de 3.x porque no soporta Next 16 —, mongodb, pino, jose, resend, nodemailer 9.x, zod, vitest, playwright, tsx).
- [x] `tsconfig.json` estricto (`strict: true`, `noUncheckedIndexedAccess`, sin `any` permitido vía ESLint).
- [x] `next.config.ts` con plugin `next-intl`. Nota: la clave `eslint` fue removida del tipo `NextConfig` en Next 16 (linting es independiente del build ahora); se quitó del config.
- [x] `tailwind.config.ts` con el sistema de tokens OKLCH completo derivado de las 3 anclas del brief (bg, accent, ink) más las variantes derivadas (`ink-soft`, `ink-faint`, `accent-deep`, `accent-soft`, `surface`, `border`), retícula de 8px, tipografía display/sans/mono vía CSS variables, animaciones sin rebote (`cubic-bezier(0.22, 0.61, 0.36, 1)`).
- [x] `eslint.config.mjs` (flat config) con `@typescript-eslint/no-explicit-any: error`.
- [x] `.gitignore`, `.env.example`, `.env` (con credenciales reales de Mongo Atlas validadas, JWT_SECRET generado con `crypto.randomBytes`).
- [x] `lib/env.ts` — validación de variables de entorno con Zod, falla rápido si falta algo crítico.
- [x] `lib/logger.ts` — Pino JSON con archivo físico (`logs/app.log`) + pretty-print en consola solo en dev.
- [x] `lib/db.ts` — singleton MongoDB (patrón global promise en dev para sobrevivir HMR, cache module-level en prod).
- [x] `lib/rate-limit.ts` — ventana deslizante en memoria, documentado el upgrade path a Redis.
- [x] `lib/circuit-breaker.ts` — patrón CLOSED/OPEN/HALF_OPEN persistido en colección `circuit_breaker_state` de Mongo.
- [x] `lib/mailer.ts` — switch Mailpit (dev, vía nodemailer SMTP) / Resend (prod, envuelto en circuit breaker).
- [x] `lib/auth.ts` — JWT de sesión (jose) + magic link de 6 dígitos con hash HMAC, expiración, límite de intentos, comparación timing-safe.
- [x] `lib/utils.ts` (`cn` helper) y `lib/i18n.ts` (locales tipados).
- [x] Estructura i18n de App Router **sin middleware.ts** (regla toscaprompt): `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`; la raíz `app/page.tsx` resuelve `Accept-Language` en un Server Component y hace `redirect()` a `/es` o `/en` explícitamente.
- [x] `app/layout.tsx` (mínimo, pass-through) + `app/[locale]/layout.tsx` (real: `<html>`, fuentes Playfair Display + Inter + JetBrains Mono vía `next/font/google`, `NextIntlClientProvider`).
- [x] `messages/es.json` y `messages/en.json` (mínimos: nav, footer, common — se expanden por fase).
- [x] `app/globals.css` con reset base, `prefers-reduced-motion` respetado, `:focus-visible` con ring de accent.
- [x] Página placeholder `app/[locale]/page.tsx` para validar el pipeline.
- [x] **Validado con dev server real**: `/` → redirect 200 a `/es`; `/es` y `/en` responden 200 directamente. `npx tsc --noEmit` limpio.
- [x] `docker-compose.yml` de referencia completo (Mongo local, Mailpit dedicado, RustFS, Vault, Traefik, SonarQube, Elasticsearch+Kibana) — todos con `profiles` para que nada se levante por accidente; el MVP no depende de ninguno.
- [x] Carpetas creadas: `lib/`, `components/{ui,admin,marketing,shared}/`, `context/`, `content/seeds/`, `scripts/`, `tests/{unit,e2e,load,reports}/`, `postman/`, `logs/`, `public/uploads/`, `i18n/`, `messages/`.

### Cierre de Fase 0 — completado

- [x] Esqueletos/contenido inicial de `QUICK-START.md`, `SPECIFICATION-SUMMARY.md`, `INFRA.md`, `OBSERVABILIDAD.md`, `CERTIFICADOS.md`, `DEPLOYMENT.md`, `DIAGRAMAS.md`, `RETROSPECTIVA.md`, `MEJORAS.md`, `README.md`.
- [x] `npm run lint` limpio (0 errores, 0 warnings) tras resolver conflicto de flat config de ESLint 9 (ver Retrospectiva).
- [x] `npx tsc --noEmit` limpio.
- [ ] Seeds (schema/config/data) — se ejecutan en Fase 1/2 cuando el modelo de datos de `site_texts`/`posts` esté fijado por el contenido real.
- [ ] `PRODUCT.md` y `DESIGN.md` vía flujo impeccable — se generan al iniciar Fase 1, dependen de la decisión tipográfica final y el elemento de firma.

**Fase 0: CERRADA.** Checklist de validación de salida (AGENTS.md): `npm run dev` levanta sin errores ✅, conexión a Mongo Atlas confirmada ✅, `npm run lint` en verde ✅.

### Decisiones técnicas tomadas en esta fase (no estaban explícitas en AGENTS.md)

- **next-intl 4.x en vez de 3.x**: 3.x no declara peer dependency para Next 16; 4.13.4 sí. Sin impacto funcional relevante para este proyecto.
- **`localePrefix: "always"`**: se decidió que ambos idiomas usen prefijo explícito (`/es/...`, `/en/...`) en vez de ocultar el default, porque el toolbar admin de edición bilingüe necesita URLs simétricas y predecibles para ambos idiomas.
- **Sin middleware.ts**: next-intl normalmente resuelve el locale vía middleware; en su lugar, el detection inicial ocurre solo en la raíz `/` (Server Component + `redirect()` basado en `Accept-Language`), y las rutas `/es` y `/en` son estáticas/explícitas de ahí en adelante. Cumple la regla toscaprompt de no usar `middleware.tsx`.
- **`<html>`/`<body>` en `app/[locale]/layout.tsx`**, no en `app/layout.tsx` raíz: como la raíz siempre redirige, el layout raíz es un simple pass-through de metadata; el layout real que envuelve contenido visible es el de `[locale]`.

---

## 2026-07-31 — Fase 1 completa

### Completado

- [x] `PRODUCT.md` escrito directamente desde el contexto ya confirmado con el usuario en `AGENTS.md` (no requirió re-entrevista: usuarios, propósito, posicionamiento, restricciones de contenido ya estaban validados).
- [x] `DESIGN.md` con el sistema de diseño completo: tokens OKLCH derivados matemáticamente, decisión tipográfica final (**Fraunces** variable para display — se descartaron Playfair Display por sobreuso en el patrón "cream+serif+terracota" e Instrument Serif por ser demasiado ligera para el peso institucional requerido —, Inter para cuerpo, JetBrains Mono para utilitario), elemento de firma decidido (citas de tratado como arquitectura tipográfica + línea de ruta comercial ambiental en el hero).
- [x] Librería de componentes UI base en `components/ui/`: `button`, `card`, `badge`, `input`, `textarea`, `label`, `dialog`, `drawer`, `tabs`, `toast` — todos sobre Radix UI + `class-variance-authority`, consumiendo únicamente los tokens de `tailwind.config.ts`.
- [x] `tailwindcss-animate` agregado (necesario para las transiciones `data-[state=...]` de Radix).
- [x] `context/GlobalContext.tsx` (sesión admin, locale, editMode — evita prop drilling, requerido por toscaprompt) y `context/ToastContext.tsx` (notificaciones con soporte de "Ver detalle técnico", requerido por la regla de manejo de errores en UI).
- [x] `components/shared/site-header.tsx` (nav responsive, selector de idioma ES/EN, skip-to-content) y `site-footer.tsx`.
- [x] Route group `app/[locale]/(marketing)/` creado para separar el shell público (header/footer) del futuro shell admin, que no los llevará.
- [x] `npx tsc --noEmit` y `npm run lint` limpios.
- [x] **Validado visualmente** con capturas Desktop (1440×900) y Mobile (390×844) vía Playwright headless: tipografía Fraunces se lee con autoridad institucional real, paleta OKLCH se ve fiel al brief (crema/marfil, azul marino profundo, cobalto), footer oscuro responsive se apila correctamente en mobile, menú hamburguesa funcional.

### Bugs encontrados y resueltos en esta fase (ver también RETROSPECTIVA.md)

- `next/font/google` con Fraunces: `axes: ["opsz","SOFT","WONK"]` requiere `weight: "variable"`, no pesos fijos (`["500","600"]`) — causaba 500 en todas las rutas. Corregido.

**Fase 1: CERRADA.**

## 2026-07-31 — Fase 2 completa

### Completado

- [x] `content/seeds/site-texts.ts`: 121 claves bilingües ES/EN completas (hero, quiénes somos/historia, misión, visión, 8 valores, 10 servicios, 4 áreas de especialización global, 10 industrias —Marítimo dentro, Aeroespacial fuera—, garantía, CTA), todas derivadas y despersonalizadas a partir de `URUCHURTU.md`.
- [x] `content/seeds/posts.ts`: 6 posts de ejemplo marcados explícitamente como contenido de desarrollo (no se presentan como reales).
- [x] `scripts/seed-schema.ts`, `seed-config.ts`, `seed-data.ts` — las tres seeds obligatorias de toscaprompt, ejecutadas con éxito contra MongoDB Atlas. **La base `economy-and-fair-competition-db` ya existe y está poblada** (121 site_texts, 6 posts, colecciones con JSON Schema validator).
- [x] `lib/content.ts` (Server-only, lee `site_texts` desde Mongo) y `lib/content-client.ts` (helper puro `t()`, seguro para Client Components).
- [x] Componentes de Fase 2 en `components/marketing/`: `trade-route-motif` (SVG del elemento de firma), `section-eyebrow`, `hero`, `about-summary`, `values-grid`, `services-grid`, `expertise-areas` (con modal Radix Dialog), `industries-carousel` (Framer Motion + modal), `guarantee-section`, `final-cta`.
- [x] Home ensamblada en `app/[locale]/(marketing)/page.tsx` como Server Component, contenido 100% desde Mongo (cero strings hardcodeadas de cara al usuario, verificado con grep de claves faltantes `[[...]]` → 0 resultados).
- [x] `npx tsc --noEmit` y `npm run lint` limpios.
- [x] **Validado visualmente**: capturas desktop (1440×900) y mobile (390×844) de la Home completa, más zoom al modal de Áreas de Especialización — jerarquía, paleta OKLCH, tipografía Fraunces, motivo de "cita de tratado" (ART./CAP. + número) consistente en todas las secciones.

### Bug encontrado y resuelto

- Error 500 / `Module not found: Can't resolve 'tls'` al renderizar Home: `industries-carousel.tsx` y `expertise-areas.tsx` son Client Components que importaban `t` desde `lib/content.ts`, el cual también importa `lib/db.ts` (server-only, usa el driver nativo de MongoDB) — el bundler intentaba llevar `mongodb` al bundle de cliente. Se extrajo `t()` a `lib/content-client.ts` (módulo puro sin dependencias de servidor) y se actualizaron los imports de ambos Client Components.

**Fase 2: CERRADA.**

## 2026-07-31 — Fase 3 completa

### Completado

- [x] `/quienes-somos`: Historia (3 párrafos), Misión/Visión, Valores completos (reutiliza `ValuesGrid`), "Un Equipo Comprometido", "Experiencia Internacional Destacada" (disputas OMC/TLCAN/T-MEC + negociaciones comerciales), "Nuestra Especialización" (sección de cierre oscura) — todo despersonalizado, ninguna mención de nombres individuales.
- [x] `/servicios`: reutiliza `ServicesGrid` y `ExpertiseAreas`, con `showHeader` agregado a `ServicesGrid` para evitar duplicar el H1 cuando la página ya tiene su propio hero.
- [x] `npx tsc --noEmit` y `npm run lint` limpios; verificado sin claves de texto faltantes (`[[...]]`) en `/quienes-somos` y `/servicios`, ES y EN.
- [x] **Validado visualmente**: capturas desktop de ambas páginas — jerarquía clara, alternancia de fondos entre secciones, sin duplicación visual de títulos.

**Fase 3: CERRADA.**

## 2026-07-31 — Fase 4 completa

### Completado

- [x] `lib/posts.ts`: capa de acceso a la colección `posts`, resuelve título/resumen/cuerpo al locale pedido (`PostSummary`/`PostDetail`), `listPublishedPosts()` y `getPostBySlug()`.
- [x] `components/marketing/posts-feed.tsx` (Client Component): grid de tarjetas con thumbnail-placeholder iconográfico (sin imágenes reales aún, coherente con "no images, category-colored icon placeholders"), badge de categoría, fecha localizada con `Intl.DateTimeFormat`, modal de detalle con botones condicionales "Descargar PDF Oficial" / "Leer Artículo Completo" según `pdfUrl`/`externalUrl`, y estado vacío diseñado (no un placeholder gris).
- [x] `/articulos-y-notas` ensamblada como Server Component, datos vía `listPublishedPosts()`.
- [x] Mensajes i18n `articles.*` agregados a `messages/es.json` y `en.json`.
- [x] `npx tsc --noEmit` y `npm run lint` limpios.
- [x] **Validado visualmente**: feed con los 6 posts de seed renderizando correctamente (categoría, título, resumen truncado a 3 líneas, fecha en español), modal de detalle abre y cierra correctamente, sin botones de descarga cuando el post no tiene `pdfUrl`/`externalUrl` (comportamiento condicional correcto).

**Fase 4: CERRADA.**

## 2026-07-31 — Fase 5 completa

### Completado

- [x] **Verificación de documentación oficial Next.js 16** (a petición del usuario, quien preguntó si se había hecho): confirmado contra `nextjs.org/blog/next-16` que `middleware.ts` → `proxy.ts` en Next 16 (deprecado pero funcional), que `next lint` fue removido (ya usábamos `eslint .` directo), que params/cookies/headers async son obligatorios (ya cumplido), y que la remoción de `NextConfig.eslint` (hallada en Fase 0) es comportamiento oficial. Sin cambios de código requeridos — decisiones previas ya alineadas. Detalle completo en `RETROSPECTIVA.md`.
- [x] Backend de auth: `lib/auth.ts` (ya existía de Fase 0) + rutas `/api/auth/request-code`, `/api/auth/verify-code` (código HMAC, timing-safe compare, rate limit, máx. intentos), `/api/auth/session`, `/api/auth/logout`.
- [x] `lib/session.ts` (lectura de sesión en Server Components) y `lib/api-response.ts` (`{ error }` estandarizado).
- [x] `/admin/login`: formulario de dos pasos (email → código 6 dígitos) con `components/admin/login-form.tsx`, mensajes de Mailpit UI en dev.
- [x] `context/GlobalContext.tsx` extendido con `editLocale`/`setEditLocale` para que el toolbar y el editor inline compartan el idioma de edición activo.
- [x] `components/admin/admin-toolbar.tsx`: modo admin, selector ES/EN, "Editar contenido"/"Salir de edición", botón **Asistente IA** (placeholder visible solo en modo edición — implementación real diferida a pedido del usuario, usará Claude API), "Gestión" (abre drawer), logout.
- [x] `components/admin/editable-text.tsx`: texto editable inline vía `contentEditable`, guarda en `onBlur` contra `/api/content/site-texts` (PUT protegido), aplicado al Hero de la Home como demostración end-to-end.
- [x] `/api/content/site-texts` (GET público, PUT protegido con sesión).
- [x] `/api/posts` y `/api/posts/[id]` (CRUD protegido, usados por el drawer — se completan con más detalle en Fase 7).
- [x] `components/admin/management-drawer.tsx`: búsqueda y listado de posts (borrador/publicado), eliminar con confirmación.
- [x] `AdminShell` integrado condicionalmente en el layout `(marketing)`: si hay sesión, el toolbar envuelve la landing pública real (edición ocurre in-place, no en una página aparte).
- [x] Corregidos 2 hallazgos de `react-hooks/set-state-in-effect` (regla nueva del linter de React 19) en `editable-text.tsx` (se eliminó estado/efecto innecesario, se opera directo sobre `e.currentTarget.textContent`) y `management-drawer.tsx` (se modeló `posts: PostRow[] | null` para eliminar el `setState` inicial síncrono, con una excepción `eslint-disable` dirigida y justificada para el fetch en sí).
- [x] `npx tsc --noEmit` y `npm run lint` limpios.
- [x] **Validado E2E de extremo a extremo con Playwright**: login con email → código real leído desde la API de Mailpit (`admin:magiclink123`) → verificación → sesión → toolbar visible en landing → activar modo edición → editar el H1 del hero vía `contentEditable` → toast "Guardado" → **confirmado con `curl` (sin JS de cliente) que el cambio persistió en MongoDB Atlas** → texto restaurado a su valor original vía re-seed.

### Bug encontrado y resuelto (en el script de prueba, no en la app)

- Primera corrida del test E2E leyó un código de Mailpit desactualizado (de una corrida previa) por falta de espera suficiente tras solicitar el código, causando `401 invalid_code`. Se corrigió aumentando el timeout antes de leer Mailpit; el segundo intento confirmó que la aplicación en sí funciona correctamente.

### Pendiente diferido (decisión explícita del usuario)

- Asistente de Redacción IA: botón placeholder ya visible y posicionado en el toolbar. Implementación real (integración con Claude API para reescribir/traducir/perfeccionar párrafos) se construirá en una fase posterior, después de que el usuario revise la landing y confirme la ubicación/diseño del botón.

**Fase 5: CERRADA** (excepto el ítem diferido explícitamente).

## 2026-07-31 — Bugs reportados por el usuario tras revisar Fase 5, corregidos + Fase 6 completa

El usuario probó el sitio y reportó dos problemas reales: (1) el selector ES/EN no cambiaba el idioma estando en modo admin, y (2) la página de Contacto no existía (404). Ambos se investigaron y corrigieron; además se extendió la edición en vivo a toda la landing (pendiente de la Fase 5) y se agregó iconografía a servicios/áreas/industrias.

### Bug 1 — Selector de idioma no funcionaba (causa raíz arquitectónica)

**Diagnóstico:** el nav del header y varios textos de UI seguían en español al navegar a `/en`. Confirmado con `curl` (sin caché de cliente) que el propio HTML servido por el SSR tenía el problema — no era un bug de hidratación en cliente.

**Causa raíz:** este proyecto resolvía el locale inicial con un Server Component en `app/page.tsx` (Accept-Language + `redirect()`), evitando por completo cualquier archivo de intercepción de requests, interpretando la regla toscaprompt "no middleware.tsx, usar proxy en su lugar" de forma demasiado literal. Pero `next-intl` **depende de que algo (su middleware/proxy) pueble `requestLocale`** en cada request; sin él, `i18n/request.ts` no tenía forma confiable de saber el locale real de la URL en Server Components fuera de `[locale]/layout.tsx`, y ningún mensaje de `useTranslations` en Client Components se reevaluaba correctamente al cambiar de idioma.

Se confirmó contra la documentación oficial de next-intl (`next-intl.dev/docs/routing/middleware`) y de Next.js 16 (`nextjs.org/blog/next-16`): la regla toscaprompt no pedía "cero middleware", pedía literalmente usar **`proxy.ts`** — el nombre oficial que Next.js 16 le da al antiguo `middleware.ts`. La interpretación original del proyecto estaba equivocada.

**Corrección:**
- Se creó `proxy.ts` en la raíz con `createMiddleware(routing)` de next-intl (patrón oficial exacto de su documentación), matcher `/((?!api|_next|_vercel|.*\\..*).*)`.
- Se eliminó `app/page.tsx` (la resolución manual de Accept-Language), ahora redundante: `proxy.ts` la reemplaza con el mecanismo nativo y correcto de next-intl.
- Verificado con `curl http://localhost:3001/en` que el nav completo (Home/About Us/Services/Articles & Notes/Contact) y el botón de idioma (ahora "ES" en vez de quedarse en "EN") se sirven correctamente en el HTML del servidor.

### Bug 2 — Textos de UI admin hardcodeados en español (regla toscaprompt #6 violada)

Al revisar el bug del idioma se encontró que **todo el toolbar admin, el drawer de gestión, el formulario de login y el dashboard admin** tenían texto de interfaz hardcodeado en español, sin pasar por el sistema i18n — violación directa de la regla "Prohibido texto hardcodeado de cara al usuario". Se agregó el namespace `admin.*` (`toolbar`, `drawer`, `login`, `dashboard`) completo en `messages/es.json` y `en.json`, y se actualizaron `admin-toolbar.tsx`, `management-drawer.tsx`, `login-form.tsx`, `app/[locale]/admin/page.tsx`, `app/[locale]/admin/login/page.tsx` para usar `useTranslations`/`getTranslations` en vez de strings literales.

### Extensión de edición en vivo a toda la landing (pendiente de Fase 5)

A petición del usuario ("no entiendo cómo probar la edición, solo vi el hero"), se aplicó `EditableText` a **todos** los componentes de marketing restantes: `values-grid`, `about-summary`, `services-grid`, `expertise-areas`, `industries-carousel`, `guarantee-section`, `final-cta`, y la página completa `/quienes-somos`. Se corrigió además un problema de accesibilidad preexistente: `expertise-areas` e `industries-carousel` envolvían tarjetas completas en `<button>`/`motion.button`, lo cual habría anidado `contentEditable` dentro de un elemento interactivo (inválido en HTML) — se cambiaron a `<Card role="button">` / `motion.div role="button"` con manejo de teclado (`Enter`/`Espacio`), deshabilitando el `onClick` de apertura de modal cuando `editMode` está activo para que el clic en el texto no dispare el modal.

### Iconografía conceptual (decisión híbrida del usuario)

Se agregaron íconos distintivos (no genéricos) de `lucide-react` por elemento:
- `components/marketing/service-icons.tsx`: 10 íconos, uno por servicio (ej. `Gavel` para Defensa Comercial/Antidumping, `Stamp` para Certificación de Origen).
- `components/marketing/expertise-icons.tsx`: 4 íconos para las áreas de especialización global.
- `components/marketing/industry-icons.tsx`: 10 íconos para las industrias (ej. `Anchor` para Marítimo, `Car` para Automotriz).

Integrados en `services-grid.tsx`, `expertise-areas.tsx`, `industries-carousel.tsx`.

### Contacto (Fase 6 completa)

- Agregadas 19 claves nuevas `contact.*` a `content/seeds/site-texts.ts` (formulario, datos directos, mapa) — no existían en el seed original, causa del 404 reportado por el usuario (la ruta simplemente no se había construido aún, estaba planificada para esta misma fase).
- `/api/contact`: Route Handler con Zod, rate limiting, HTML-escaping de todos los campos antes de interpolarlos en el correo, registro en `contact_submissions`, envío vía `lib/mailer.ts` (Mailpit dev / Resend prod, ya con circuit breaker de la Fase 0).
- `components/marketing/contact-form.tsx`: formulario completo (Nombre, Empresa, Correo, Teléfono, Área de Interés, Mensaje), estado de éxito inline + toast.
- `components/marketing/styled-map.tsx`: mapa ilustrativo estilizado con la paleta OKLCH de la firma (sin API key de Google Maps — decisión explícita del usuario, ver pregunta en sesión), reemplazable por integración real cuando se confirme la clave.
- `/contacto` ensamblada con `EditableText` en todo el contenido institucional.
- `npx tsc --noEmit` y `npm run lint` limpios en todo momento.
- **Validado E2E real**: formulario llenado y enviado vía Playwright, correo confirmado recibido en Mailpit ("Nuevo contacto: Empresa de Prueba S.A. (Importadora Prueba)"), datos de prueba limpiados de `contact_submissions` tras la validación.

**Fase 6: CERRADA.** Tarea 13 (extender EditableText) y bugs reportados: CERRADOS. Pendientes: imágenes de alto impacto en hero/quienes-somos (tarea 15, en curso).

## 2026-07-31 — Bug del selector de idioma dentro del toolbar admin (segundo reporte) + imágenes de alto impacto

### Bug 3 — Selector ES/EN del toolbar admin no cambiaba el idioma visible (distinto del bug del header ya corregido)

El usuario confirmó que el selector de idioma del **header público** ya funcionaba, pero el selector **dentro de la barra negra "MODO ADMIN"** seguía sin funcionar — mencionó que navegando manualmente a `/admin/en` sí lograba editar en inglés.

**Diagnóstico:** el botón ES/EN del toolbar admin (`components/admin/admin-toolbar.tsx`) solo llamaba `setEditLocale(l)`, actualizando un estado de React (`editLocale` en `GlobalContext`) que determina en qué campo de idioma se guarda una edición — pero **no navegaba a la otra versión de la página**. El contenido visible seguía siendo el del idioma original, así que el clic parecía "no hacer nada". `editLocale` solo se sincronizaba con la URL real al montar el `GlobalProvider` (por eso navegar manualmente a `/admin/en` sí funcionaba: ahí `editLocale` se inicializaba en `"en"` porque `locale` venía de la URL).

**Corrección:** el botón ahora usa `router.push(pathname, { locale: target })` de `next-intl`'s navigation (además de actualizar `editLocale`), replicando exactamente el mismo mecanismo que ya funcionaba en el selector del header público. Verificado con Playwright: clic en "en" dentro del toolbar navega de `/es` a `/en`, con todo el contenido (nav, hero, toolbar) traducido correctamente y el botón "EN" resaltado como activo.

### Imágenes de alto impacto (Fase visual final)

Se aclaró con el usuario que este entorno no tiene herramienta de generación de fotografía real; se acordó construir composiciones editoriales SVG/gradiente de alto impacto en su lugar (coherentes con el elemento de firma ya definido en `DESIGN.md`):

- `components/marketing/hero-visual.tsx`: composición de anillos concéntricos + rutas comerciales + nodos, en la paleta OKLCH de la firma, posicionada como pieza visual grande a la derecha del hero en desktop (antes vacío). Reemplaza `trade-route-motif.tsx` (eliminado, ya no usado).
- `components/marketing/about-visual.tsx`: motivo de "sello institucional" (anillos + marcas radiales tipo timbre) con el dato real "EST. 1998 · OMC · TLCAN · T-MEC" (verificado contra `URUCHURTU.md` línea 19, no inventado), integrado en la sección de Historia de `/quienes-somos`.

**Fase 6 y correcciones post-revisión: CERRADAS.** Tarea 15 (imágenes de alto impacto): CERRADA.

## 2026-07-31 (noche) — Fase 7 redefinida: sistema de plantillas de contenido estructurado

El usuario, al revisar el frontend de lectura de Artículos y Notas (Fase 4 original), pidió un rediseño sustancial antes de continuar con la API/MCP simple que estaba planeada: (1) distinguir Artículo vs Nota como tipo real, (2) categorías fijas + tags + búsqueda con filtros combinables (tipo, categoría, texto en título y/o contenido, rango de fechas), (3) paginación numérica en vez de carrusel, y (4) un **sistema de plantillas de bloques** (hero, texto Markdown, dos columnas texto+imagen, tabla→gráfica automática) editable desde el admin, reutilizable entre ES/EN, con extracción de contenido desde PDF/URL vía IA para el flujo de WhatsApp/MCP.

Esto se documentó como una revisión formal de la Fase 7 en `AGENTS.md` §10 (nueva sección, no se reescribió el documento completo). Se dividió en sub-fases 7A–7F (tareas #16–21 del tracker de esta sesión). **Se pausó la Fase 7 original (API simple + MCP)** porque el modelo de datos de `posts` cambia de raíz.

### Fase 7A — Modelo de datos: COMPLETADA

- `lib/blocks/schema.ts`: tipos Zod discriminados por `type` (`hero`, `richtext`, `twoColumn`, `chart`). Los bloques de **plantilla** solo llevan `{ id, type }` (esqueleto); los bloques de **contenido de un post** llevan el contenido real en ese idioma. El contenido de texto siempre es **Markdown** (nunca HTML ni JSON de editor propietario) — decisión explícita del usuario para que sea legible/editable por humanos, por el MCP de WhatsApp, y generable por IA desde un PDF.
- `lib/posts-taxonomy.ts`: `POST_CATEGORIES` (enum fijo: comercio-exterior, defensa-comercial, cumplimiento-aduanero, propiedad-intelectual, litigio-internacional — formalizado desde las categorías ya usadas en el seed) y `postTypeSchema` (`articulo` | `nota`), con labels ES/EN.
- **Integración de IA con Claude**: a pedido del usuario, se agregó `lib/ai-config.ts` — la API key de Anthropic vive cifrada (AES-256-GCM) en la colección Mongo `ai_config`, editable desde el panel admin en producción (pendiente de construir esa UI en Fase 7B/7C), con **fallback a `ANTHROPIC_API_KEY` de `.env`** cuando el admin no ha configurado la suya. `resolveAiConfig()` es el punto único de resolución. Se generó `AI_CONFIG_ENCRYPTION_KEY` real (AES-256, 32 bytes hex) y se agregó a `.env`.
  - El usuario proporcionó una API key real de Anthropic ("firma-economy-ia-key"), ya cargada en `.env` (protegido en `.gitignore`, nunca se sube a control de versiones). **Se probó la conexión real y la key es válida**, pero la cuenta de la API (console.anthropic.com — separada de la suscripción de Claude Code/Claude.ai por diseño de Anthropic, no hay forma de unificarlas) devolvió `400 credit balance too low`. Se explicó la diferencia entre ambos sistemas de facturación al usuario y se le recomendó cargar ~$5 USD de crédito (estimado generoso para todo el volumen de pruebas de esta fase). **Pendiente: el usuario carga crédito y se revalida la conexión antes de poder probar E2E la conversión Markdown/extracción PDF.**
- Esquema de Mongo actualizado (`scripts/seed-schema.ts`): `posts` ahora requiere `postType`, con `category` como enum (antes texto libre), agrega `tags` (array), reemplaza `bodyEs`/`bodyEn` por `blocksEs`/`blocksEn`, agrega `templateId`. Se aplicó `collMod` sobre la colección ya existente (no solo `createIfMissing`) para actualizar el validator sin perder los documentos. Se agregaron índices: `postType`, `category`, `tags`, texto en `titleEs`/`titleEn`. Nuevas colecciones: `templates`, `ai_config`.
- `lib/posts.ts` reescrito: `listPublishedPosts()` ahora acepta `PostListFilters` (postTypes, categories, tags, query, searchInContent, dateFrom/dateTo, page/pageSize) y devuelve `PostListResult` paginado (antes devolvía un array plano) — **rompe la firma anterior**, ya actualizado en `app/[locale]/(marketing)/articulos-y-notas/page.tsx` (ajuste mínimo temporal: `const { posts } = await listPublishedPosts(locale)`; el ensamblaje completo con filtros/paginación queda para Fase 7E).
- `content/seeds/posts.ts` y `scripts/seed-data.ts` migrados al nuevo esquema. **Los 6 posts de ejemplo existentes se migraron en vivo** (`$set` con los nuevos campos + `$unset` de `bodyEs`/`bodyEn`) vía `npm run seed:data`, confirmado con `migrated: 6` en el log.
- `npx tsc --noEmit` y `npm run lint` limpios en todo el proceso.
- Dependencias nuevas instaladas: `@anthropic-ai/sdk`, `pdf-parse`, `react-markdown`, `remark-gfm`, `recharts`, `@radix-ui/react-checkbox`.

### Siguiente al retomar

Continuar con **Fase 7B** (tarea #17): UI admin para crear/editar plantillas (definir secuencia de bloques). Después 7C (editor de posts que usa una plantilla), 7D (renderizado público de bloques + gráficas con `recharts`), 7E (filtros/búsqueda/paginación reales en `/articulos-y-notas`, reemplazando el ajuste temporal), 7F (MCP con `templateId` + extracción PDF/URL vía IA). El detalle completo de alcance de cada sub-fase está en `AGENTS.md` §10.

## 2026-07-31 (noche, cont.) — Fase 7B completa: editor de plantillas admin

- API `/api/templates` (GET/POST) y `/api/templates/[id]` (GET/PUT/DELETE, protegido, rechaza DELETE con 409 si algún post usa la plantilla).
- `components/admin/template-block-list-editor.tsx`: agregar/quitar/reordenar bloques (hero, richtext, twoColumn, chart) con íconos distintivos por tipo.
- `components/admin/template-form.tsx`: formulario compartido crear/editar (nombre + editor de bloques).
- Páginas admin: `/admin/templates` (listado), `/admin/templates/new`, `/admin/templates/[id]` (editar).
- Enlace "Plantillas" agregado al `AdminToolbar`.
- **Se validó la API key de Anthropic real** (`firma-economy-ia-key`) tras que el usuario cargó crédito en console.anthropic.com — llamada de prueba a `claude-sonnet-5` exitosa. Queda lista para Fase 7C/7F (conversión Markdown, extracción PDF/URL).
- `npx tsc --noEmit` y `npm run lint` limpios.
- **Validado E2E con Playwright**: login → crear plantilla "Análisis extenso con gráfica" con 3 bloques (hero, richtext, chart) → confirmado "Plantilla creada" y persistencia real en Mongo (listado la muestra con su resumen de bloques tras recargar). La plantilla de prueba se dejó en la base de datos intencionalmente para usarla al probar el editor de posts en Fase 7C.
- Reforzada documentación de código a pedido del usuario: encabezados de módulo en `lib/blocks/schema.ts` y `lib/ai-config.ts` que explican quién consume cada pieza y apuntan a los diagramas correspondientes. `SPECIFICATION-SUMMARY.md` reescrito con una tabla "¿dónde está...?" como mapa de navegación del código (MCP, IA, plantillas, edición en vivo, auth), más contratos de API completos incluyendo el contrato MCP planeado. `DIAGRAMAS.md` ampliado con diagrama de clases del sistema de plantillas, secuencia de creación de post con plantilla, secuencia de creación vía WhatsApp/MCP con PDF/URL, y flowchart de resolución de API key de IA. `QUICK-START.md` reescrito con la estructura de carpetas actualizada (incluye `proxy.ts`, `admin/templates`, `lib/blocks/`, `lib/ai-config.ts`) y una sección nueva "Cómo probar cada funcionalidad" con pasos concretos para: login admin, edición en vivo, sistema de plantillas, integración de IA, contacto.

### Siguiente al retomar (actualizado)

Continuar con **Fase 7C** (tarea #18): editor de un Artículo/Nota concreto — elegir plantilla, llenar cada bloque (con autodetección/conversión Markdown vía IA para bloques de texto), asignar tipo/categoría/tags/fecha, subir imágenes. Requiere también construir `lib/ai/markdown.ts` (conversión de texto a Markdown vía Claude) y el endpoint que lo expone al admin.

## 2026-08-01 — Fase 7C completa: editor de posts con plantillas + IA real

- `lib/ai/client.ts`: cliente compartido de Claude (`getAnthropicClient()`), único punto por el que cualquier módulo debe pasar — nunca instanciar `Anthropic()` directo en otro archivo.
- `lib/ai/markdown.ts`: `looksLikeMarkdown()` (heurística por regex, sin costo de IA) + `convertToMarkdown()` (llamada real a Claude con system prompt editorial: no inventa contenido, no agrega H1, usa listas/negrita con moderación).
- `/api/ai/markdown` (POST, protegido, rate-limited): expone la conversión al admin.
- `/api/uploads` (POST, protegido): sube imágenes a disco local (`public/uploads`), valida tipo MIME y tamaño máximo — mismo patrón de almacenamiento decidido en Fase 0 (disco local, no S3).
- Componentes admin nuevos: `markdown-block-editor.tsx` (editar/vista previa con `react-markdown` + `remark-gfm`, botón "Convertir con IA" con sugerencia previa a aplicar — nunca sobreescribe sin confirmación explícita), `image-upload-field.tsx`, `chart-data-editor.tsx` (filas etiqueta/valor + selector de tipo de gráfica), `content-block-editor.tsx` (dispatcher que arma el sub-editor correcto según `block.type`), `post-form.tsx` (orquestador: elegir plantilla → metadata → bloques ES/EN con selector de idioma).
- `/api/posts` y `/api/posts/[id]` migrados al nuevo esquema (`templateId`, `postType`, `category` enum, `tags`, `blocksEs`/`blocksEn` en vez de `bodyEs`/`bodyEn`).
- Páginas admin: `/admin/posts` (listado con badges de tipo/estado/categoría), `/admin/posts/new`, `/admin/posts/[id]` (editar). `ManagementDrawer` actualizado con enlace "Nueva publicación" y botón de editar por fila (antes solo permitía eliminar).
- Dependencia agregada: `@tailwindcss/typography` (necesaria para las clases `prose` del renderizado de Markdown en el admin).
- `npx tsc --noEmit` y `npm run lint` limpios (se corrigió un `setStatus` sin uso real — el formulario terminó usando dos botones explícitos "Guardar borrador"/"Publicar" en vez de un selector de estado, dejando el setter huérfano).
- **Validado E2E con Playwright y la API de Claude real** (crédito ya cargado por el usuario): login → nueva publicación → seleccionar la plantilla de prueba de Fase 7B → llenar metadata → pegar texto plano sin formato en el bloque richtext → clic en "Convertir con IA" → **Claude devolvió Markdown estructurado real** (título, lista numerada con términos en negrita, párrafo de cierre) en la vista previa de sugerencia, sin aplicarse automáticamente (requiere confirmación explícita del admin). No se guardó el post de prueba (el script no llegó al submit), confirmado que no quedó ningún documento huérfano en Mongo.
- Bug encontrado y resuelto **en el script de prueba, no en la app**: el primer intento llenó el `<textarea>` de "Resumen (English)" en vez del bloque richtext (ambos son `<textarea>`, `.first()` capturó el equivocado), dejando el botón "Convertir con IA" deshabilitado (`disabled={!value.trim()}` — correcto, el bloque real seguía vacío). Corregido apuntando por el placeholder específico del bloque.

### Siguiente al retomar (actualizado de nuevo)

Continuar con **Fase 7D** (tarea #19): renderizado público de cada tipo de bloque (`components/marketing/blocks/`) — hero, richtext (Markdown), dos columnas, y las gráficas reales con `recharts` (barras/líneas/pastel) a partir del bloque `chart`. Esto reemplaza el placeholder actual de `/articulos-y-notas/[slug]` (que hoy no existe como página de detalle — se crea en esta fase).

## 2026-08-01 (cont.) — Fase 7D completa: renderizado público + gráficas reales

- `components/marketing/blocks/`: `hero-block.tsx`, `rich-text-block.tsx` (Markdown vía `react-markdown` + `remark-gfm`), `two-column-block.tsx` (imagen izq/der configurable), `chart-block.tsx` (Client Component, `recharts` — barras/líneas/pastel según `block.chartType`, paleta OKLCH de la firma), y `post-block-renderer.tsx` (dispatcher que arma la secuencia completa).
- Nueva página `/articulos-y-notas/[slug]` (antes no existía como página propia — el flujo viejo solo abría un modal con resumen). Muestra badge tipo+categoría, fecha, título, resumen, botones condicionales PDF/enlace externo, y la secuencia completa de bloques renderizados.
- `posts-feed.tsx` reescrito: las tarjetas ahora son enlaces reales (`Link` de next-intl) a la página de detalle en vez de abrir un modal — decisión natural dado que el contenido de un post estructurado en bloques (incluida una gráfica) ya no cabe bien en un modal.
- `/articulos-y-notas` (listado) simplificado para el nuevo `PostsFeed` sin props de modal.
- `npx tsc --noEmit` y `npm run lint` limpios.
- **Validado E2E con Playwright de punta a punta y datos reales**: login → crear post con la plantilla de prueba → llenar hero + richtext (Markdown directo, sin pasar por IA esta vez) + tabla de datos (2023/120, 2024/180, 2025/250) → Publicar → navegar a la página pública de detalle → **confirmado visualmente que la gráfica de barras se renderiza correctamente con `recharts`** (ejes, valores, colores de la paleta OKLCH), el Markdown se ve con su encabezado/lista/negrita, y el post aparece primero en el listado de `/articulos-y-notas`. Post de prueba eliminado de Mongo tras la validación.

### Siguiente al retomar (Fase 7E)

Continuar con **Fase 7E** (tarea #20): filtros reales en `/articulos-y-notas` — checkboxes de tipo (Artículo/Nota), selector de categoría, campo de tags, búsqueda de texto (título, con opción de ampliar a contenido), rango de fechas (inicio obligatorio una vez activado el filtro, fin opcional pero nunca menor a inicio), y paginación numérica. El backend (`lib/posts.ts` → `listPublishedPosts(locale, filters)`) ya soporta todos estos filtros desde la Fase 7A — falta construir la UI que los use (hoy la página solo llama `listPublishedPosts(locale)` sin filtros, como placeholder).

## 2026-08-01 (cont.) — Fase 7E completa: filtros, búsqueda y paginación reales

- `components/ui/checkbox.tsx`: primitivo Radix nuevo, faltaba en el sistema de diseño.
- `components/marketing/posts-filters.tsx`: panel de filtros sincronizado con query params de la URL (compartible/guardable) — búsqueda por título con checkbox "Buscar también en el contenido", checkboxes independientes Artículo/Nota, selector de categoría (enum fijo), campo de tags, rango de fechas con validación en cliente (fin < inicio bloquea el submit con mensaje de error visible, sin llegar a enviar la petición).
- `components/marketing/posts-pagination.tsx`: paginación numérica clásica (no "cargar más", decisión ya registrada en `AGENTS.md` §10.6), botones anterior/siguiente deshabilitados en los extremos, página activa resaltada.
- `/articulos-y-notas` reescrita como Server Component que lee `searchParams`, valida con Zod (`postTypeSchema`, `postCategorySchema`) antes de pasar a `listPublishedPosts`, y aplica la regla de negocio del rango de fechas también en el servidor (si `dateTo < dateFrom` llega manipulado a mano en la URL, se ignora `dateTo` en vez de producir un rango vacío o un 500).
- Mensajes i18n `articles.filters.*` agregados a ES/EN.
- `npx tsc --noEmit` y `npm run lint` limpios.
- **Validado E2E con Playwright y los 6 posts reales de seed**: (1) desmarcar "Nota" y aplicar → URL `?types=articulo`, resultado: exactamente las 4 tarjetas que son Artículo, ninguna Nota: filtro de tipo confirmado funcionando en el backend, no solo cosmético. (2) Seleccionar categoría "Cumplimiento Aduanero" → URL `?category=cumplimiento-aduanero`, resultado: exactamente los 2 posts de esa categoría (ambos "Nota", coincide con los datos reales de seed). (3) Fecha "Hasta" anterior a "Desde" → mensaje de error visible en rojo, filtro no se aplicó (no navegó), confirmando que la validación de cliente bloqueó el envío antes de tocar el servidor.
- Bug encontrado y resuelto **en el script de prueba, no en la app**: el primer intento usó `getByText("Nota", { exact: true })`, que resolvía a 3 elementos (el checkbox más 2 badges "Nota" en las tarjetas del feed) — Playwright lo rechazó por ambigüedad (`strict mode violation`). Corregido apuntando específicamente al `<label>` que envuelve el checkbox.

### Siguiente al retomar (Fase 7F, última sub-fase de la Fase 7)

Continuar con **Fase 7F** (tarea #21): servidor MCP para WhatsApp (`app/api/mcp/route.ts`) con las herramientas `list_templates`, `list_posts`, `get_post_detail`, `create_post_from_media`, `update_post`, `delete_post`. La pieza nueva de mayor riesgo técnico es `lib/ai/extract.ts`: extracción de contenido desde PDF (`pdf-parse`, ya instalado) o URL (fetch + strip HTML) y estructuración a bloques Markdown vía Claude (reutilizando `lib/ai/client.ts` y el patrón de `lib/ai/markdown.ts` ya construido y validado en Fase 7C). El editor de plantillas NO se expone vía MCP (decisión de producto ya confirmada, ver `AGENTS.md` §10.5) — el flujo de WhatsApp solo puede *elegir* un `templateId` existente, nunca crear uno.

## 2026-08-01 (cont.) — Fase 7F completa: servidor MCP + extracción PDF/URL vía IA — **Fase 7 CERRADA por completo**

A petición explícita del usuario, se difirió la conexión con un proveedor real de WhatsApp (Meta Cloud API / Twilio) — el servidor MCP se construyó completo y se prueba vía HTTP directo (curl/Postman); la conexión con WhatsApp se agrega después sin rehacer el servidor.

- `lib/env.ts`: nueva variable `MCP_ADMIN_PHONES` (E.164 separados por coma) + `getMcpAdminPhones()`. Generado y agregado a `.env`: `MCP_WEBHOOK_SECRET` real (32 bytes hex) y un teléfono de prueba en `MCP_ADMIN_PHONES`.
- `lib/mcp-auth.ts`: `isValidWebhookSecret()` (comparación del header `Authorization: Bearer <secret>`) e `isAuthorizedAdminPhone()` (lista blanca de teléfonos, análoga a `ADMIN_ALLOWED_EMAILS` pero para el canal WhatsApp) — cumple el requisito del brief original ("`update_post` y `delete_post`: protegidas mediante validación de JWT/teléfono de administrador").
- `lib/ai/extract.ts`: `extractFromPdf()` (vía `pdf-parse` — API v2, usa la clase `PDFParse` con `.getText()`, distinta a la función que exportaban versiones anteriores del paquete) y `extractFromUrl()` (fetch + strip HTML manual, sin librería de scraping). Ambas reenvían el texto extraído a Claude con un prompt de extracción dedicado (título + resumen + cuerpo Markdown, nunca inventa contenido no presente en la fuente).
- `app/api/mcp/route.ts`: endpoint único `POST /api/mcp` con protocolo `{ tool, params, callerPhone? }`. Las 6 herramientas: `list_templates` y `list_posts`/`get_post_detail` (solo lectura, sin teléfono); `create_post_from_media`, `update_post`, `delete_post` (mutación, requieren `callerPhone` autorizado). `create_post_from_media` acepta exactamente una fuente (`markdown` directo, `pdfBase64`, o `externalUrl`) y **siempre crea el post como borrador** (`status: draft`) — nunca publica automáticamente, requiere revisión humana en `/admin/posts` antes de salir al público.
- `npx tsc --noEmit` y `npm run lint` limpios.
- **Validado E2E con curl real contra el servidor corriendo, cubriendo las 6 herramientas y los 2 niveles de autorización**:
  1. Sin `Authorization` → 401 "Secreto de webhook MCP inválido o ausente."
  2. Con secreto válido, `list_templates` → 200, devuelve la plantilla de prueba con sus tipos de bloque.
  3. `create_post_from_media` con teléfono NO autorizado → 403 "Teléfono no autorizado para crear publicaciones."
  4. `create_post_from_media` con teléfono autorizado + `markdown` directo → 201 equivalente, post creado como `draft`.
  5. `create_post_from_media` con `externalUrl` real → **extracción vía Claude real** ejecutada de punta a punta; la URL de prueba resultó ser una página 404 de la OMC, y Claude generó honestamente un título/resumen reflejando eso ("Página no encontrada: el enlace de la OMC no está disponible") en vez de inventar contenido — confirma que el prompt de extracción no alucina.
  6. `list_posts` con `status: draft` → devuelve ambos posts creados.
  7. `update_post` → título actualizado correctamente.
  8. `delete_post` (x2) → ambos posts de prueba eliminados, limpieza confirmada.

### Fase 7 completa — resumen

Las 6 sub-fases (7A modelo de datos, 7B editor de plantillas, 7C editor de posts con IA, 7D renderizado público + gráficas, 7E filtros/búsqueda/paginación, 7F servidor MCP) quedaron cerradas y validadas de extremo a extremo con datos reales (incluida la API de Claude real, no simulada). El sistema completo de "Artículos y Notas" pedido originalmente por el usuario —con la observación de que necesitaba categorización, plantillas visuales, gráficas automáticas, e integración con WhatsApp— está construido.

## 2026-07-31 — Fase 8 completa: Vitest + Playwright + k6 + Postman — **Fase 8 CERRADA**

### Vitest (unitarias)

- 4 archivos de spec, **35/35 tests pasan**: `rate-limit.test.ts` (7), `blocks-schema.test.ts` (13), `posts-taxonomy.test.ts` (6), `ai-markdown.test.ts` (9).
- Reporte HTML en `tests/reports/vitest/index.html`.

### Playwright (E2E)

- Se investigó y resolvió el test intermitente pendiente de la sesión anterior (`admin-inline-editing.spec.ts`, edición del eyebrow del hero): un script de diagnóstico standalone (Playwright headful contra el dev server) confirmó que el guardado (`PUT /api/content/site-texts`) funcionaba correctamente en todo momento — el fallo previo fue causado por un dato de prueba corrupto dejado en Mongo por una corrida anterior que no había completado su limpieza, no por un bug del componente ni del test. Tras restaurar el valor institucional real del eyebrow (`COMERCIO EXTERIOR · ADUANAS · PROPIEDAD INTELECTUAL`) vía la API admin, el test pasa de forma consistente.
- Suite completa: **16/16 tests pasan** (`admin-auth`, `admin-inline-editing`, `public-navigation`, `templates-and-posts`), reporte HTML en `tests/reports/playwright/index.html`.

### k6 (carga)

- `tests/load/public-load.js`: flujo público (home, listado, listado filtrado, detalle de post, `/api/posts`). Dos escenarios (`spike`: rampa a 500 VUs en 10s sostenida 20s; `sustained`: rampa a 500 VUs sostenida 15 min), seleccionables con `--env SCENARIO=spike|sustained|both`.
- `tests/load/mcp-load.js`: flujo del endpoint MCP, limitado a herramientas de lectura y a baja concurrencia (5 VUs) porque el propio endpoint aplica rate limiting de 30 req/min por IP — de otro modo, correr con IP única (como cualquier ejecución local de k6) dispara el 429 legítimamente y contamina las métricas de error. Los 429 se cuentan como éxito esperado, no como fallo.
- **Hallazgo real importante**: contra `next dev` con Turbopack, 500 VUs instantáneos no llegan a completar ninguna iteración en 45s (el dev server no está pensado para carga). Se repitió la prueba contra `next start` (build de producción real): **0% de errores HTTP** en ambos escenarios — pico instantáneo (2093 requests, p95 ~10.9s) y sostenido abreviado de ~4 min a 300 VUs (11700 requests, p95 ~6.2s, sin degradación progresiva). La latencia alta bajo pico es esperada y documentada en INFRA.md: es una sola instancia Node sin réplicas ni CDN delante, no un bug de la aplicación. El SLA de los thresholds del script se ajustó a un valor realista para ese despliegue (p95 < 12s) en vez de forzar un número irreal.
- Reportes HTML en `tests/reports/k6/public-load.html` y `mcp-load.html` (vía `k6-reporter`).

### Postman + Newman

- `postman/Economy-and-Fair-Competition.postman_collection.json` (8 carpetas: Auth, Textos institucionales, Contacto, Plantillas, Publicaciones, IA+Uploads, MCP, Limpieza) + `postman/Economy-and-Fair-Competition.postman_environment.json` (con UUID de environment).
- El login por magic link **no se pudo automatizar de forma confiable dentro del propio script de Postman**: se intentó leer Mailpit vía `pm.sendRequest` encadenado, pero el sandbox de prerequest de Newman no espera correctamente callbacks async anidados (el step avanza antes de que la respuesta llegue). Tras varios intentos fallidos, se optó por un flujo de **dos corridas documentado explícitamente en la descripción de la colección**: 1ª corrida ejecuta solo "Solicitar código"; el usuario copia manualmente el código de 6 dígitos desde Mailpit (`localhost:8025`) a la variable `magicLinkCode`; 2ª corrida ejecuta el resto de la colección. Decisión validada explícitamente con el usuario (más simple y 100% confiable que una automatización frágil).
- **Bug real encontrado y corregido durante la validación**: `create_post_from_media` (servidor MCP) generaba el slug del post de forma determinística a partir del título sin verificar colisión, y la inserción en Mongo no capturaba el error de índice duplicado (`E11000`) — un segundo mensaje de WhatsApp con el mismo título (p. ej. reenvíos, plantillas de texto repetidas) causaba un **500 Internal Server Error** en vez de una respuesta controlada. Corregido en `app/api/mcp/route.ts`: el slug ahora se desambigua automáticamente con sufijo numérico (`-2`, `-3`, ...) en vez de rechazar — decisión correcta porque el remitente de WhatsApp no elige el slug, a diferencia de `/api/posts` (POST), que sí lo recibe explícito del admin y por eso responde 409 ante duplicado.
- Segundo hallazgo (menor, de la propia colección, no del sistema): la propiedad para desactivar el envío de cookies del Cookie Jar en una request puntual (usada en las 2 pruebas negativas de "sin sesión") va anidada en `protocolProfileBehavior.disableCookies` a nivel de `item`, no como `disableCookies` suelto dentro de `request` — corregido.
- **Validación final: 75/75 aserciones pasan** (29 requests, 56 test-scripts) contra el servidor real, con datos reales de Mongo Atlas, incluyendo las 6 herramientas MCP, el flujo completo de auth, CRUD de templates/posts, y los casos negativos de seguridad (401 sin sesión, 401 sin `Authorization` en MCP, 409 slug duplicado, 409 plantilla en uso).

### Cierre de Fase 8

- `npx tsc --noEmit` y `npm run lint` limpios (0 errores, 0 warnings) tras el fix del bug de slug y el ajuste de nombre de función en `mcp-load.js`.
- Testing formal completo: **35 Vitest + 16 Playwright + 75 Postman/Newman + 2 escenarios k6**, todos verdes, con reportes HTML generados para cada herramienta.

## 2026-07-31 — Generación de imágenes con IA (pollinations.ai) en el editor de posts

A petición del usuario, se agregó la opción de generar imágenes con IA directamente desde el editor de posts (bloques hero y twoColumn), usando **pollinations.ai** (`https://image.pollinations.ai/prompt/{prompt}`) — API pública, sin API key, sin costo.

- `lib/uploads.ts`: se extrajo `saveImageBuffer()` de `app/api/uploads/route.ts` para compartir la lógica de guardado en disco entre la subida manual y la generación por IA.
- `lib/ai/image-generation.ts`: `generateImageFromPrompt()` llama a pollinations.ai envuelta en `withCircuitBreaker()` (mismo patrón ya usado para Resend en `lib/mailer.ts`). Decisión explícita del usuario sobre el comportamiento de fallo: **sin reintento automático ni cola** — si el servicio no responde, se lanza `ImageGenerationUnavailableError`, el post se guarda igual sin esa imagen, y el admin puede volver a pulsar "Generar imagen con IA" en cualquier momento posterior desde el mismo editor ("esperar a que pase el tiempo, se desahogue, y reintentar").
- `app/api/ai/generate-image/route.ts`: `POST { prompt }` → `{ url }` (201) o `503` controlado si el circuito está abierto/la llamada falla. Protegido por sesión admin + rate limit (10/min/IP).
- `components/admin/image-upload-field.tsx`: nuevo botón "Generar imagen con IA" (junto al de "Subir imagen"), visible solo si se le pasa la prop `promptSource`. El prompt se autogenera a partir del texto ya escrito en el bloque (decisión del usuario: sin campo de texto libre) — `block.title` en el bloque hero, `block.markdown` en twoColumn — vía `buildPromptFromSource()`, que limpia sintaxis Markdown básica antes de enviarlo.
- **Validado E2E con llamadas reales**: generación exitosa (imagen real de 78KB descargada y servida desde `/uploads/`), y caso de resiliencia (circuito forzado a `OPEN` en Mongo → endpoint responde 503 controlado sin afectar el resto del admin, que sigue respondiendo con normalidad — confirmado con `GET /api/templates` en paralelo).
- `npx tsc --noEmit` y `npm run lint` limpios.

## 2026-07-31 — Navegación del panel admin (bug reportado por el usuario)

El usuario reportó que al entrar a `/admin/templates` no tenía forma de volver atrás ni de saber cómo "usar" una plantilla. Se confirmó que ninguna página bajo `/admin/*` tenía navegación cruzada entre secciones (el layout de esa ruta era un pass-through vacío), y que el dashboard tampoco enlazaba a Plantillas ni a Publicaciones.

- `components/admin/admin-nav.tsx`: nueva barra fija (Client Component) con enlaces a Panel/Publicaciones/Plantillas (resaltando la sección activa vía `usePathname`), "Ver sitio público" y cerrar sesión. Se auto-oculta en `/admin/login`.
- `app/[locale]/admin/layout.tsx`: ahora resuelve el locale y renderiza `<AdminNav>` antes de `children`.
- `messages/es.json` y `messages/en.json`: nuevo namespace `admin.nav`.
- Se aclaró al usuario el flujo real: una plantilla es solo el esqueleto de bloques (sin contenido); se "usa" desde `/admin/posts/new`, donde se elige la plantilla en un desplegable y ahí se llena cada bloque.
- `npx tsc --noEmit` y `npm run lint` limpios; confirmado en el HTML servido real (`curl` a `/es/admin/templates`) que la barra aparece.

## 2026-07-31 — Bug: bloques vacíos en /admin/posts/new con una sola plantilla (reportado por el usuario)

El usuario reportó que al elegir la única plantilla existente ("Análisis extenso con gráfica", con bloques hero+twoColumn+richtext+chart) en `/admin/posts/new`, no aparecía ningún botón de imagen. Causa: `components/admin/post-form.tsx` inicializaba `templateId` con `templates[0]?.id` cuando no hay `initial` (post nuevo) — el `<select>` HTML ya mostraba esa plantilla preseleccionada por defecto del navegador — pero `blocksEs`/`blocksEn` se inicializaban buscando por `initial?.templateId`, que es `undefined` en ese caso. El único código que llena los bloques desde una plantilla (`handleTemplateChange`) solo se dispara en el evento `onChange` del `<select>`, nunca al montar el componente, así que con una sola plantilla el usuario nunca disparaba ese evento (no había nada más que elegir) y la sección de bloques quedaba vacía indefinidamente.

Corregido: `initialTemplate` ahora busca por `initial?.templateId ?? templates[0]?.id`, igual que el propio `templateId`. `npx tsc --noEmit` y `npm run lint` limpios.

## 2026-07-31 — Segundo reporte del usuario: `<select>` de plantilla engañoso en modo edición + migración de datos de la seed

El usuario reportó que en `/admin/posts/[id]` (editar), el desplegable de plantilla mostraba "Análisis extenso con gráfica" en TODOS los posts, incluso los que no debían tenerla, sin poder cambiarla (el `<select>` está deshabilitado a propósito una vez creado el post) — sospechaba que el valor estaba hardcodeado.

- **Causa raíz**: en `components/admin/post-form.tsx`, `React.useState(initial?.templateId ?? templates[0]?.id ?? "")` trata `null` igual que `undefined` con `??`, así que el fallback a `templates[0]` (pensado solo para el caso "post nuevo, ninguna plantilla elegida todavía") también se aplicaba en modo edición cuando `initial.templateId` era legítimamente `null` en la base de datos. Con una única plantilla existente, el efecto visual era indistinguible de un hardcode.
- Corregido: el fallback a `templates[0]` ahora solo aplica cuando `!isEditing`. En modo edición, el `<select>` refleja el `templateId` real del post.
- Al confirmar el estado real de los datos, se descubrió que los 6 posts de `content/seeds/posts.ts` (datos de ejemplo) solo tenían el bloque `richtext`, y solo 1 de los 6 tenía `templateId` vinculado a la plantilla completa de 4 bloques — el resto tenía `templateId: null`. El editor de posts nunca regenera los bloques de un post existente a partir de cambios posteriores en la plantilla (por diseño, para no perder contenido ya escrito), así que ninguno de los 6 mostraba el bloque Hero ni el botón de generar imagen.
- A pedido explícito del usuario ("todas las publicaciones deben usar la plantilla"), se migraron los 6 posts vía script puntual (ejecutado una sola vez, no forma parte del código de la aplicación): se vinculó `templateId` a la única plantilla existente y se agregaron los bloques `hero`/`twoColumn`/`chart` vacíos, conservando el contenido real del bloque `richtext` existente (solo se renombró su `id` al que define la plantilla, para que el editor lo reconozca en la posición correcta).
- Confirmado tras la migración: `npx tsc --noEmit` y `npm run lint` limpios; el listado público (`/es/articulos-y-notas`) y la página de detalle del post reportado siguen respondiendo 200.

## 2026-07-31 — Tercer reporte del usuario: imagen "cacheada" al regenerar + sugerencia de prompt con IA

El usuario reportó que al quitar una imagen generada y pedir una nueva (mismo texto de bloque), volvía a aparecer la MISMA imagen — confirmado con datos reales: las 3 imágenes generadas por el usuario en el navegador antes del fix tenían exactamente el mismo tamaño en bytes (87070), es decir, eran idénticas.

- **Causa**: `fetchFromPollinations()` no incluía el parámetro `seed` en la URL de pollinations.ai — sin él, el mismo prompt produce la misma imagen. Corregido agregando `seed=<entero aleatorio>` en cada llamada (`lib/ai/image-generation.ts`). Validado con dos llamadas reales seguidas al mismo prompt: URLs y tamaños de archivo distintos (85049 vs 77301 bytes).
- El usuario pidió además una forma de pedirle a la IA (Claude, no pollinations) un prompt más detallado antes de generar la imagen, mostrado momentáneamente para revisar/editar antes de usarlo. Se rediseñó `components/admin/image-upload-field.tsx`: el botón "Generar imagen con IA" ahora abre un editor de prompt (textarea prellenado con el prompt autogenerado desde el título/texto del bloque), con un botón "Sugerir prompt con IA" que llama a `lib/ai/image-generation.ts` → `suggestImagePrompt()` (Claude, vía `POST /api/ai/suggest-image-prompt`) y reemplaza el contenido del textarea con la sugerencia — el admin puede seguir editándolo antes de pulsar "Generar con este prompt". Nunca se genera la imagen automáticamente con la sugerencia.
- Validado E2E con llamadas reales: sugerencia de prompt real y detallada obtenida de Claude (432 caracteres describiendo escena, composición e iluminación), y confirmación de imágenes distintas tras el fix del seed.
- `npx tsc --noEmit`, `npm run lint` y Vitest (35/35) limpios tras los cambios.

## 2026-07-31 — Cuarto y quinto pedido del usuario: miniatura (thumbnail) elegible + buscador en /admin/posts

- **Miniatura**: `thumbnailUrl` ya existía en el schema de Mongo pero nunca se exponía en los endpoints ni se podía asignar — el listado público (`components/marketing/posts-feed.tsx`) siempre mostraba un ícono genérico. Se agregó `thumbnailUrl` a los schemas Zod de `POST`/`PUT /api/posts` y al `GET` de detalle/listado; se creó `components/admin/thumbnail-selector.tsx` (recopila las imágenes ya usadas en los bloques hero/twoColumn del post — sin duplicados — y permite marcar una con un clic); conectado en `post-form.tsx` como una tarjeta "Miniatura" antes de los botones de guardar. `PostsFeed` ahora renderiza la imagen real vía `next/image` cuando `thumbnailUrl` existe.
- **Buscador en /admin/posts**: el listado admin no pagina (a diferencia del público), así que se optó por filtrado en cliente en vez de ir y volver al servidor. Se extrajo la lista a un nuevo Client Component `components/admin/admin-posts-list.tsx`, que filtra por título (`titleEs`) y por el contenido de texto de cada bloque (`hero.title`, `richtext.markdown`, `twoColumn.markdown`, `chart.title`) del array `blocksEs` que ya viaja con cada post desde el servidor.
- Validado con datos reales: `PUT /api/posts/{id}` con `thumbnailUrl` persiste y se refleja tanto en `GET /api/posts/{id}` como en `GET /api/posts` (listado); revertido tras la prueba (era una URL ficticia, no un archivo real).
- `npx tsc --noEmit`, `npm run lint`, Vitest (35/35) y Playwright (16/16) limpios tras ambos cambios.

## 2026-07-31 — Extracción de PDF/Word/PowerPoint/URL con IA en el editor de bloques de texto

El usuario pidió que el bloque de texto enriquecido permita subir un PDF (local o vía URL, que también podía ser HTML, Word o PowerPoint), leerlo completo y generar automáticamente un resumen estructurado en Markdown (títulos, listas, tablas) vía Claude, mostrado como sugerencia antes de aplicarlo.

- Ya existía `lib/ai/extract.ts` para el servidor MCP, limitado a PDF (vía `pdf-parse`) y URL/HTML (stripHtml casero). Se investigó y adoptó `officeparser@7.5.1` — un solo paquete que cubre PDF/DOCX/PPTX/HTML/ODT/etc. de forma unificada, con tipos TypeScript nativos y sin dependencias de servicios cloud de pago — reemplazando ambas implementaciones anteriores. Se desinstaló `pdf-parse` (ya sin uso).
- `lib/ai/extract.ts` reescrito: `extractFromDocument(buffer, fileType)` es la función base (usa `parseOffice()` + `ast.to("text")` de officeparser); `extractFromPdf()` y `extractFromUrl()` quedan como wrappers de compatibilidad para el servidor MCP (`app/api/mcp/route.ts`, sin cambios de contrato ahí). `extractFromUrl()` ahora detecta el `Content-Type` real de la respuesta para elegir el `fileType` correcto (HTML vs. un archivo servido directo, ej. enlaces "Descargar PDF").
- El prompt de estructuración (`EXTRACTION_SYSTEM_PROMPT`) se amplió explícitamente para pedir tablas Markdown cuando el documento fuente tenga datos comparables o tabulares, además de títulos/listas/negrita ya existentes.
- Nuevo endpoint `app/api/ai/extract-document/route.ts`: acepta `multipart/form-data` (campo `file`, PDF/.docx/.pptx) o JSON `{ url }`, distinguiendo por `Content-Type` del request. Rate limit 10/min/IP, requiere sesión admin.
- `components/admin/markdown-block-editor.tsx`: nuevo botón "Extraer de PDF/URL" que abre un panel con opción de subir archivo o pegar una URL. El resultado (título, resumen, Markdown) se muestra en un panel de sugerencia con vista previa renderizada — el admin debe pulsar "Aplicar al bloque" explícitamente, igual que el patrón ya existente de "Convertir con IA"; nunca sobreescribe solo.
- **Validado E2E con llamadas reales**: extracción de una URL real (`example.com`, con la IA señalando honestamente que el contenido fuente era mínimo/genérico en vez de inventar información) y extracción de un PDF real generado para la prueba (con datos de ejemplo sobre T-MEC), ambas devolviendo Markdown bien estructurado con encabezados, listas y negritas. Confirmado que `create_post_from_media` del servidor MCP sigue funcionando tras la reescritura de `extract.ts` (creación y limpieza de un post de prueba real vía `externalUrl`).
- `npx tsc --noEmit`, `npm run lint`, Vitest (35/35) y Playwright (16/16) limpios tras los cambios.
- **Pendiente**: soporte de Word/PowerPoint fue implementado en el backend (`officeparser` ya los soporta) pero no se validó con archivos `.docx`/`.pptx` reales en esta sesión — solo PDF y URL/HTML se probaron end-to-end con documentos reales. Validar con un `.docx`/`.pptx` real antes de considerar esos dos formatos completamente cerrados.

## 2026-07-31 — MCP público (protocolo real) + JWT de sesión admin para el MCP privado

El usuario instaló una extensión de Chrome que detecta si un sitio ofrece herramientas MCP, y reportó que la landing "no tiene MCP". Se explicó la diferencia: el `/api/mcp` construido en Fase 7F es un protocolo propio privado (`{tool, params}`, protegido por secreto), no el protocolo MCP real ni algo descubrible públicamente — nunca se diseñó para eso. El usuario pidió explícitamente ampliar esto: un MCP público de solo lectura, y reforzar el MCP privado con JWT o usuario/contraseña, y/o validación de número de WhatsApp con código.

- **Investigación previa**: se confirmó (vía agentes de investigación, verificado luego leyendo el código fuente instalado del SDK) que el descubrimiento pasivo de MCP en sitios web NO es un estándar oficial cerrado — solo un borrador (SEP-2127, `/.well-known/mcp/server-cards.json`). Lo que sí es estable es el protocolo de transporte (JSON-RPC 2.0 sobre Streamable HTTP), soportado oficialmente por `@modelcontextprotocol/sdk` (instalado, v1.30.0) vía la clase `WebStandardStreamableHTTPServerTransport`, compatible de forma nativa con `Request`/`Response` de Web API — encaja sin adaptadores en un route handler de Next.js App Router. Se confirmó la API real leyendo los `.d.ts` del paquete instalado, no solo confiando en el reporte de investigación.
- **`app/api/mcp-public/route.ts`** (nuevo): servidor MCP real, sin autenticación, **stateless** (`sessionIdGenerator: undefined` — una instancia de `McpServer` + transporte nueva por cada request, sin estado compartido entre invocaciones, acorde al modelo serverless). Tres herramientas de solo lectura: `list_posts` (Artículos/Notas publicados), `get_post_detail` (por slug o id, solo publicados), `list_services` (las 10 áreas de práctica, leídas de `site_texts` vía `getSiteTexts()`).
- **`app/.well-known/mcp/server-cards.json/route.ts`** (nuevo): manifest de descubrimiento siguiendo el borrador SEP-2127, documentado explícitamente como experimental/sin garantías en el propio comentario del archivo.
- **`lib/mcp-auth.ts`**: nueva función `verifyMcpAuthorization()` que acepta el `Authorization: Bearer <token>` del MCP privado (`app/api/mcp/route.ts`) como el secreto de webhook fijo **o** un JWT de sesión admin real (el mismo `verifySessionToken()` que usa todo el panel `/admin`) — un admin autenticado puede invocar el MCP privado directamente sin depender del secreto compartido estático. Cuando la autorización fue vía JWT, se registra en el log el email del admin que invocó la herramienta.
- **Validado E2E con llamadas reales**: handshake `initialize` JSON-RPC 2.0 real (200, capabilities correctas), `tools/list` (3 herramientas con JSON Schema válido), `tools/call` de las 3 herramientas con datos reales de Mongo (10 servicios reales, posts reales con sus slugs/categorías/tags). MCP privado probado con JWT real extraído de una sesión admin activa (200 OK) y confirmada retrocompatibilidad con el secreto de webhook fijo (200 OK) y rechazo sin token (401). Manifest de descubrimiento responde 200 con el JSON esperado.
- `npx tsc --noEmit`, `npm run lint`, Vitest (35/35) y Playwright (16/16) limpios.
- **Nota para el usuario**: el manifest de descubrimiento devuelve la URL configurada en `NEXT_PUBLIC_SITE_URL` del `.env` (actualmente `http://localhost:3000`), que no coincide con el puerto real usado en esta sesión de desarrollo (`:3100`, elegido para evitar conflictos). Es solo un detalle de configuración de entorno, no un bug — ajustar esa variable al puerto real (o a la URL de producción al desplegar) antes de que un cliente MCP externo intente conectarse usando el manifest.
- **Pendiente explícitamente diferido**: la verificación de número de WhatsApp Business con código de un solo uso (mencionada por el usuario como alternativa/complemento al JWT) no se implementó en esta pasada — el usuario priorizó JWT de sesión admin como mecanismo principal. Documentado aquí como pendiente si se retoma.

## 2026-08-01 — Fase 9 completa: Seguridad (Semgrep + revisión manual OWASP) — **Fase 9 CERRADA**

- **Semgrep (SAST)**: sin Python/pip disponibles y sin paquete npm oficial mantenido, se corrió vía Docker (`semgrep/semgrep`). Se agregó `.semgrepignore` (excluye `node_modules`, `.next`, reportes de test, uploads, logs). Una corrida completa exitosa escaneó 174 archivos (247 reglas del ruleset `auto`) y encontró 4 hallazgos: 1 real (GCM sin `authTagLength` explícito en `lib/ai-config.ts`, corregido y validado con cifrado/descifrado real) y 3 falsos positivos esperados (secretos de desarrollo en `.env` y un JWT de prueba en `tests/e2e/.auth/admin.json`, ambos correctamente en `.gitignore`, sin repo git siquiera inicializado todavía). Corridas posteriores para re-confirmar "cero hallazgos nuevos" resultaron poco confiables por la dependencia de red de `--config auto` (confirmado que requiere contactar el backend de Semgrep Cloud); se priorizó no bloquear el resto del trabajo y se conservó el reporte JSON/HTML de la corrida válida.
- Se corrigió el script `security:semgrep` de `package.json`: el CLI de Semgrep no tiene formato `--html` nativo — se escribió `scripts/semgrep-html-report.mjs` para generar la tabla HTML a partir del JSON.
- **Revisión manual OWASP** (vía agente especializado, complementaria a Semgrep): encontró y se corrigieron 2 hallazgos reales de severidad Alta —
  1. Sin límite de tamaño en la subida de documentos para extracción con IA (`/api/ai/extract-document` y `pdfBase64` del MCP privado), a diferencia de `/api/uploads` que sí lo tenía — agregado `MAX_DOCUMENT_SIZE_MB` y validación en ambos puntos.
  2. Validación de tipo de archivo basada solo en `Content-Type` del cliente (falsificable) — agregada verificación de magic bytes reales vía `file-type` (`lib/file-signature.ts`), validada con un PNG legítimo (aceptado) y un script disfrazado de imagen (rechazado con 400).
  - Se documentó (sin cambio de código, es un asunto de infraestructura de despliegue) el riesgo de `X-Forwarded-For` falsificable en `lib/rate-limit.ts` si no hay un proxy inverso confiable delante.
  - Confirmado correcto sin cambios: protección contra inyección Mongo, autorización antes de side-effects en todas las rutas mutantes, comparación timing-safe del código OTP, ausencia de XSS vía `dangerouslySetInnerHTML`, generación segura de nombres de archivo, ausencia de secretos hardcodeados.
- Confirmado (`git status`) que el proyecto no tiene repositorio git inicializado todavía — no hay riesgo de secretos ya commiteados; `.gitignore` ya cubre `.env` y las credenciales de test.
- **Validado tras todos los fixes**: `npx tsc --noEmit`, `npm run lint`, Vitest (35/35), Playwright (16/16) limpios; pruebas HTTP reales de ambos fixes de Alto (tamaño de documento, magic bytes) confirmadas con datos reales.

## 2026-08-01 — Link de fuente en Markdown extraído, gestión de archivos, logo/favicon, imagen editable del hero

El usuario confirmó que la extracción de PDF ya funcionaba bien, y pidió cuatro cosas relacionadas: 1) que el Markdown generado incluya al final un link a la fuente (URL externa, o el documento subido); 2) que el documento subido quede como archivo descargable (antes se procesaba solo en memoria y se descartaba); 3) una pantalla en el admin para ver/eliminar archivos subidos viejos; 4) que los links a documentos eliminados muestren un aviso de "depurado" en vez de romperse.

- **`lib/uploads.ts` reescrito**: `saveImageBuffer()`/nuevo `saveDocumentBuffer()` (carpeta separada `public/documents/`, decisión del usuario) registran cada archivo en la nueva colección Mongo `uploaded_files` (`kind`, `originalName`, `sizeBytes`, `createdBy`, `createdAt`). Nuevas funciones `listUploadedFiles()` (confirma `existsOnDisk` por archivo consultando el filesystem), `isFileMissing()` y `deleteUploadedFile()`.
- **`lib/ai/extract.ts` reescrito**: `structureText()` ahora recibe una fuente opcional `{ url, label }` y agrega automáticamente `\n\n---\n\nLabel: [url](url)` al final del Markdown. `extractFromDocument()` acepta `persistOriginal` — cuando es true (subida directa, no HTML de URL), guarda el documento vía `saveDocumentBuffer()` y usa esa URL como fuente ("Documento original"); `extractFromUrl()` siempre enlaza la URL externa tal cual ("Para más detalle, consulta la fuente original"). `extractFromPdf()` (usado por MCP) ahora persiste el PDF real, corrigiendo un comentario desactualizado que decía lo contrario.
- **`/admin/files` (nuevo)**: `components/admin/files-manager.tsx` — grid con miniatura/ícono, búsqueda por nombre, filtro Todos/Imágenes/Documentos, selección múltiple (checkbox) y botón "Eliminar N seleccionado(s)", leyenda roja "Depurado" cuando `existsOnDisk` es false. Nuevo endpoint `app/api/uploaded-files/route.ts` (GET) y `[id]/route.ts` (DELETE). Agregado a la barra de navegación admin (`admin-nav.tsx`, nuevo namespace i18n `admin.nav.files`).
- **Aviso "documento depurado" en el render público**: `components/marketing/blocks/rich-text-block.tsx` se convirtió en Server Component **async** con un componente `a` custom pasado a `react-markdown` (`components={{ a: MarkdownLink }}`), que también es async y llama a `isFileMissing()` antes de decidir si renderiza el link real o el aviso.
- **Validado E2E con datos reales**: PDF de prueba generado manualmente, extraído vía `/api/ai/extract-document` (confirmado el link "Documento original: [...]" en la respuesta y `sourceUrl`), post real creado con ese Markdown, confirmado que el link se renderiza en la página pública real; luego se eliminó el archivo desde `/api/uploaded-files/{id}` y se confirmó que el mismo post ahora muestra "documento depurado" en vez del link — todo con `curl` contra el servidor real, sin mocks.

El usuario además pidió, en mensajes intercalados durante este trabajo: usar `Logo-eafc.png` como logo del header (a la izquierda del título) y como favicon, y usar `home-eafc.png` como imagen real del hero en vez del círculo vectorial SVG, con la imagen editable en modo admin igual que los textos (pero sin distinción de idioma).

- **Logo y favicon**: `public/logo-eafc.png` agregado al `<Link>` del título en `components/shared/site-header.tsx`; `app/icon.png` (Next.js App Router genera el `<link rel="icon">` automáticamente al detectar ese archivo, sin tocar metadata a mano).
- **Imagen editable del hero**: nuevo componente `components/admin/editable-image.tsx`, análogo a `EditableText` pero para imágenes — en modo edición, un overlay "Cambiar imagen" cubre la imagen; al elegir un archivo, se sube (`POST /api/uploads`) y la URL resultante se guarda con el mismo valor en `es` y `en` de una nueva clave `site_texts`, `home.hero.image` (agregada a `content/seeds/site-texts.ts`, sembrada con `npm run seed:config`). `components/marketing/hero-visual.tsx` (el círculo SVG) se eliminó por completo, ya sin ningún uso.
- **Bug real encontrado y corregido durante la prueba**: el overlay de edición de imagen no recibía clics — el contenedor de texto del hero (`flex-col` de ancho completo con `position: relative`) se apilaba por encima del área de la imagen superpuesta y absorbía los eventos de puntero, aunque visualmente no hubiera texto ahí. Corregido aplicando `pointer-events-none` al contenedor de texto exterior y `pointer-events-auto` selectivamente a sus hijos directos (`[&>*]:pointer-events-auto`), dejando pasar los clics en las zonas vacías hacia la imagen debajo. Confirmado con Playwright real: sin el fix, `hover()` sobre el botón de edición fallaba por timeout ("intercepts pointer events"); con el fix, funciona y el flujo completo de cambiar la imagen (subir → guardar en Mongo con ambos idiomas) se validó con una imagen real.
- `npx tsc --noEmit`, `npm run lint`, Vitest (35/35) y Playwright (16/16) limpios tras todos los cambios de esta entrada.

## 2026-08-01 — Migración de Especialización/Servicios/Industrias de site_texts a content_items administrable

Continuación de un trabajo que había quedado a medias por un colapso de sesión anterior: el usuario había reportado que en las ventanas modales de "Áreas de Especialización Global", "Nuestros Servicios" e "Industrias que Atendemos" el botón de edición desaparecía al hacer scroll dentro de la modal, y pidió además que el contenido de esas 3 secciones fuera administrable (agregar/eliminar items) desde el panel admin, descartando la edición inline directa sobre la landing para esas 3 secciones en particular. Al recuperar el contexto se encontró que el backend ya existía (`lib/content-items.ts`, API `app/api/content-items/*`, script `scripts/migrate-content-items.ts`, todos ya completos) pero el frontend (los 3 componentes de grilla, el modal, y la UI admin) seguía en el modelo viejo (`site_texts` con claves fijas tipo `expertise.a.title`).

- **Migración de datos**: se corrió `scripts/migrate-content-items.ts` (ya escrito en la sesión anterior) contra Mongo — 24 items migrados (4 expertise + 10 services + 10 industries) a la colección `content_items`. Se ajustó el script para usar `/uploads/home-hero-default.png` como imagen por defecto cuando `site_texts` no tenía la clave `.image` sembrada (era el caso real de esta base de datos — ninguna de las 24 tenía imagen previa). Se agregó `npm run migrate:content-items` a `package.json`.
- **`components/marketing/detail-dialog.tsx` reescrito por completo**: ya no recibe `itemKey`/`texts` (site_texts) sino un `ContentItemSummary` completo. Causa raíz del bug de scroll confirmada: `DialogContent` (`components/ui/dialog.tsx`) es en sí mismo el contenedor `overflow-y-auto`, y en la versión vieja los controles de edición vivían dentro de ese contenedor scrolleable. Ahora el header con "Editar contenido"/"Eliminar" (en modo edición) es un bloque `shrink-0` **fuera** del área con scroll — queda fijo siempre visible. En modo edición, el modal reemplaza la vista de lectura por un formulario (título, resumen, detalle Markdown, cambiar imagen) con botones Guardar/Cancelar, que persiste vía `PUT/DELETE /api/content-items/{id}`.
- **`expertise-areas.tsx`, `services-grid.tsx`, `industries-carousel.tsx` reescritos**: ahora reciben `items: ContentItemSummary[]` desde el Server Component padre (ya no leen títulos/resúmenes de `texts` vía `EditableText`, solo el eyebrow/título/subtítulo de sección siguen en `site_texts`, sin cambios ahí). Cada grilla agrega una tarjeta "Agregar item" en modo edición (visible solo con `adminSession`), que crea el item vía `POST /api/content-items` y abre la modal para completarlo de inmediato. `EXPERTISE_ICONS` se convirtió de `Record<"a"|"b"|"c"|"d", LucideIcon>` a un arreglo simple, asignado por índice módulo el tamaño del arreglo — necesario porque ahora el número de items es dinámico, no fijo en 4/10.
- **`app/[locale]/(marketing)/page.tsx` y `.../servicios/page.tsx`**: ahora llaman `listContentItems(section, locale)` (Server Component, lectura directa a Mongo) y pasan `items` a cada grilla.
- **Nueva UI admin `/admin/content`**: página índice (`app/[locale]/admin/content/page.tsx`) con las 3 secciones y su conteo de items; página por sección (`.../content/[section]/page.tsx`) con `components/admin/content-items-manager.tsx` — lista con miniatura/título/resumen, mover arriba/abajo (persiste vía `POST /api/content-items/reorder`), editar inline (mismo patrón de formulario que la modal pública) y eliminar. Agregado enlace "Secciones" a `admin-nav.tsx` y namespace i18n `admin.nav.content` (es/en).
- **Componente huérfano eliminado**: `components/admin/editable-markdown-text.tsx` quedó sin ningún uso tras la migración (era exclusivo del `DetailDialog` viejo) — se eliminó; `lib/markdown-detect.ts` se conserva (sigue usado por el nuevo `DetailDialog` y por `content-items-manager` indirectamente vía el patrón de detección) y se actualizó su comentario de cabecera.
- **Corrección de lint**: se eliminaron `useEffect` que sincronizaban `rows`/`draft` desde props (`react-hooks/set-state-in-effect`) en las 3 grillas y en `DetailDialog` — en las grillas, `items` no necesita re-sincronizarse tras el montaje inicial (solo cambia por navegación completa); en `DetailDialog`, se usa inicialización perezosa de `useState` desde `item` más `key={openId}` en el `<DetailDialog>` de cada grilla para forzar remount al cambiar de item abierto, en vez de un efecto.
- **Validado E2E con datos y sesión reales** (Playwright vía script ad hoc, sin mocks): confirmado que el header de controles de la modal permanece visible tras hacer scroll dentro de la modal (capturas antes/después del scroll); flujo completo de crear → editar título → guardar → eliminar un item desde `/admin/content/industries` confirmado contra Mongo real, sin errores de consola ni HTTP.
- **Suite completa tras los cambios**: `npx tsc --noEmit` y `npm run lint` limpios; Vitest 35/35; Playwright 16/16 (se encontró y corrigió de paso un test preexistente frágil en `templates-and-posts.spec.ts` que asumía que `editMode`, estado de React en memoria, seguía activo tras un `page.goto` — no relacionado con esta migración, pero rompía la corrida completa; se corrigió activando edición explícitamente antes de usar el drawer de "Gestión").
- **Pendiente**: ninguno de los 24 items migrados tenía imagen propia en `site_texts` (todas usan el placeholder `home-hero-default.png` ahora) — reemplazar por imágenes reales es trabajo de contenido, no de código, y puede hacerse directamente desde `/admin/content/[section]` o desde la modal pública en modo edición.

## 2026-08-01 — Fase 8 completa: k6 (spike + sostenido 15 min) y Postman/Newman — **Fase 8 CERRADA**

El usuario confirmó que Vitest y Playwright ya corrían en verde de sesiones anteriores, pero faltaba ejecutar k6 y Postman/Newman contra el proyecto real y documentar los números en `INFRA.md` — el checklist de `AGENTS.md` seguía sin marcar pese a que ambas herramientas ya tenían scripts listos de sesiones previas.

- **Build de producción real para k6**: se corrió `npm run build && npm run start -p 3100` en vez de `next dev` — el modo dev dispara latencias varias veces mayores por compilación en caliente y no habría sido representativo. El build incluyó sin errores las rutas nuevas de la migración de `content_items` de la sesión anterior.
- **k6 escenario A (pico instantáneo, 0→500 VUs)**: 1197 requests, 0% de error HTTP, 100% de los checks de negocio en verde. Latencia p95 20.6s bajo el pico — degradación esperada de una instancia Node única sin réplicas (documentada como limitación conocida, no un bug).
- **k6 escenario B (sostenido, 500 VUs constantes durante 15 min, ~17 min totales con rampas)**: corrido en background mientras se avanzaba con Postman en paralelo. 41,496 requests HTTP (~40.5 req/s sostenido), 0% de error de negocio, 100% de los 41,496 checks en verde durante todo el periodo, sin degradación creciente de latencia a lo largo del tiempo (p95 estable ~22s).
- **Postman/Newman**: se encontraron y resolvieron dos problemas de entorno, no del código de la aplicación —
  1. El mailer (`lib/mailer.ts`) cambia de proveedor según `NODE_ENV`: el servidor de producción usado para k6 usa Resend (que falló por falta de credenciales reales, activando el circuit breaker), así que el flujo de magic link de Postman —diseñado para Mailpit— requiere correr contra un servidor en modo `next dev` aparte. Se levantó un segundo servidor de desarrollo en el puerto 3101 sin interferir con la prueba de carga en curso en el 3100.
  2. **Hallazgo real de compatibilidad**: Newman (Node 20.9+ en Windows) resuelve `http://localhost:PORT` de forma intermitente a una dirección inválida (`Invalid IP address: undefined`) en todas las requests de una corrida completa, aunque `curl` y el navegador conectan sin problema al mismo puerto. Workaround aplicado y documentado: usar `127.0.0.1` explícito en vez de `localhost` como `baseUrl` del environment.
  3. Se confirmó además que cada código de magic link es de un solo uso y que `verifyMagicLinkCode` toma el registro más reciente no consumido por `createdAt` — si se dispara `request-code` más de una vez antes de leer el código en Mailpit, el código leído puede no corresponder al último registro; hay que pedir y verificar en la misma pasada.
  4. Con ambos problemas resueltos: **29 requests, 75/75 assertions en verde, 0 fallos** — cubre auth, site-texts, contacto, plantillas, publicaciones (incluye caso 409 de slug duplicado), IA (Markdown + subida de imagen) y las 3 herramientas de lectura + escritura + rechazo 401 del servidor MCP.
- `newman` (v6.2.2) y `newman-reporter-html` se agregaron como `devDependencies` reales (antes solo se usaban vía `npx` bajo demanda); nuevo script `npm run test:api`.
- Documentado en `INFRA.md` §Capacidad (tabla de k6 con hardware de referencia real de la máquina de pruebas) y nueva sección §Colección Postman/Newman (UUID del environment, hallazgo de `localhost` vs `127.0.0.1`, instrucciones del paso manual de Mailpit).
- **Fase 8 cerrada en `AGENTS.md`** — los 4 puntos de su checklist (Vitest, Playwright, k6, Postman) marcados con sus resultados reales.

## 2026-08-01 — Fase 10 en curso: Markdown en resumen, asistencia de IA (traducción + conversión) en Secciones, filtros colapsables

Durante el audit de Fase 10, el usuario reportó tres problemas puntuales sobre el trabajo de la sesión anterior (migración de Especialización/Servicios/Industrias a `content_items`), atendidos en esta pasada:

1. **El resumen de las tarjetas no interpretaba Markdown**: `expertise-areas.tsx`/`services-grid.tsx` mostraban `item.summary` como texto plano (`<span>`), mientras que `detail` en el `DetailDialog` sí lo interpretaba. Se extrajo `components/marketing/markdown-text.tsx` (auto-detección vía `looksLikeMarkdown` + render con `react-markdown`), usado ahora por ambos campos en las 3 grillas y en el modal — un solo componente, un solo comportamiento consistente.
2. **Título duplicado en la modal**: varios `detail` migrados desde `site_texts` incluían su propio encabezado `# Título...` (contenido generado por IA en una sesión previa), que se repetía visualmente debajo del `item.title` ya mostrado por el `DetailDialog`. `MarkdownText` ganó una prop `stripLeadingH1` (quita un único `# ...` inicial vía regex antes de renderizar), activada solo en el `DetailDialog` — las tarjetas de grilla no la necesitan porque su `summary` no trae encabezado propio.
3. **Asistencia de IA para Secciones (Especialización/Servicios/Industrias), a pedido explícito del usuario**: en `/admin/content/[section]`, cada item ahora tiene (a) botón "Convertir con IA" en Detalle ES/EN (reutiliza `POST /api/ai/markdown`, mismo patrón de sugerencia-editable-nunca-automática que el editor de bloques de posts) y (b) **auto-traducción ES↔EN al perder el foco** de título/resumen/detalle: si el campo del idioma contrario está vacío, se traduce automáticamente vía Claude; si ya tiene contenido, nunca se sobreescribe (solo rellena huecos, no reemplaza texto ya escrito). Nuevo `lib/ai/translate.ts` (`translateContentItemFields`, una sola llamada a Claude con los 3 campos delimitados por texto plano en vez de JSON, para no romper con Markdown en el detalle) y endpoint `POST /api/ai/translate-content-item`.
   - Para que el admin pudiera editar cada idioma por separado (antes `ContentItemSummary` solo resolvía a un locale, causando que `startEdit` pusiera el mismo texto resuelto en ambos campos ES/EN al abrir edición — bug preexistente corregido de paso), se agregó `ContentItemBilingual` + `listContentItemsBilingual()` en `lib/content-items.ts`, usado por la página Server Component de `/admin/content/[section]` en vez de `listContentItems`.
   - Se relajó la validación Zod de `titleEs`/`titleEn` (`min(1)` → opcional) en `POST`/`PUT /api/content-items` — necesario porque el flujo real ahora permite que uno de los dos quede momentáneamente vacío mientras la traducción automática lo completa.
   - **Validado E2E con llamadas reales a Claude** (sin mocks): traducción real de "Cumplimiento Normativo Aduanero" → "Customs Regulatory Compliance" (no una copia literal), y conversión a Markdown de un párrafo plano a lista con negritas, ambas confirmadas visualmente con capturas.
4. **Filtros de `/articulos-y-notas` colapsables** (pedido explícito, no relacionado con Secciones): `components/marketing/posts-filters.tsx` ahora tiene un header clickeable ("Mostrar/Ocultar filtros" + contador de filtros activos vía `Badge` + chevron animado) que expande/colapsa el panel con una transición de `grid-template-rows` (permite animar de/hacia altura automática sin JS de medición). Colapsado por defecto; se expande automáticamente si la URL ya trae algún filtro aplicado (para no ocultar filtros de un enlace compartido). Nuevas claves i18n `filters.showFilters`/`hideFilters`/`activeCount` (es/en).
- `npx tsc --noEmit`, `npm run lint`, Vitest (35/35) y Playwright (16/16) limpios tras todos los cambios de esta entrada. Items de prueba creados durante la validación manual (traducción/conversión) eliminados de Mongo antes de cerrar.
- **Pase de `/impeccable polish` sobre el sitio completo**: se encontró y corrigió un daño de datos real causado por los propios scripts de verificación de esta sesión — al hacer clic en la tarjeta real "Comercio Exterior, Aduanas y Cumplimiento Transfronterizo" para confirmar visualmente el fix del título duplicado, el navegador conservaba sesión admin activa y el clic disparó guardados no intencionados sobre el item real (visible en los logs: 8 `PUT /api/content-items/...` al mismo ID). El `title`/`summary` quedaron sobreescritos con contenido de otro campo. Restaurado desde `content/seeds/site-texts.ts` (fuente de verdad del contenido original). Al restaurar vía `curl -d` con acentos inline, la shell bash de Windows corrompió el UTF-8 (mojibake tipo "Asesor�a"); corregido reenviando con `--data-binary @archivo.json` en vez de texto inline en el comando — lección para cualquier corrección futura de datos con acentos vía curl en este entorno.
- No se encontraron otros hallazgos de tipografía/espaciado/micro-interacción que ameritaran cambio — el sistema de diseño ya quedó coherente tras las correcciones de contraste de la pasada de audit.

## **Fase 10 — Pulido final — CERRADA (2026-08-01)**

Checklist de `AGENTS.md` completado:
- [x] `/impeccable audit`: score 19/20. 4 hallazgos reales de accesibilidad corregidos (contraste `accent-deep`/`ink-faint`/`accent-soft` bajo WCAG AA, estructura `<dl>`/`<dt>`/`<dd>` inválida en Contacto).
- [x] `/impeccable polish`: sin hallazgos de diseño nuevos; se corrigió daño de datos accidental de la propia sesión de verificación (ver entrada anterior).
- [x] `prefers-reduced-motion`: confirmado correcto (reduce a 0.01ms preservando el estado final, no un "kill" que rompa feedback).
- [x] Foco de teclado: anillo de 2px visible en todo elemento interactivo, confirmado con Playwright.
- [x] Contraste AAA en texto legal largo: `ink` 16.96:1, `ink-soft` 7.05:1 (ambos ≥7:1).
- [x] Paridad ES/EN: 0 claves de traducción faltantes en ningún sentido; confirmado visualmente en capturas.
- [x] Un solo batch de capturas desktop+mobile (páginas públicas + panel admin), defectos corregidos en un lote, una ronda adicional de confirmación — sin loop abierto de auto-QA.

**Con esto se cierran las Fases 8, 9 y 10 — las 11 fases planificadas en `AGENTS.md` quedan completas.**

## 2026-08-01 — Título con soporte de Markdown en Especialización/Servicios/Industrias

El usuario pidió que, además de resumen y detalle, el campo **título** de cada item (en las 3 grillas y en el `DetailDialog`) también admita Markdown — para poder controlar tamaño de letra u otro énfasis directamente desde el texto del título, interpretado en la vista final.

- `components/marketing/markdown-text.tsx`: nueva prop `plainClassName` — aplicada solo cuando el texto **no** parece Markdown (el caso más común, un título simple), ya que en ese camino el componente devuelve un `<span>` plano y las clases `prose-*` no tienen efecto sobre él. Sin esta prop, un título sin formato explícito habría perdido su tamaño tipográfico grande.
- Los 4 lugares que renderizaban `item.title` como texto plano ahora usan `MarkdownText` con `plainClassName` igual al estilo tipográfico original de cada uno (preserva el look exacto cuando no hay Markdown) y `className` con `prose-headings:*` para cuando sí lo hay: `expertise-areas.tsx`, `services-grid.tsx`, `industries-carousel.tsx` (tarjetas) y `detail-dialog.tsx` (título de la modal).
- **`components/ui/card.tsx`**: `CardTitle` no soportaba `asChild` (era un `<h3>` fijo) — necesario para que `services-grid.tsx` pudiera delegar el renderizado del título a `MarkdownText` sin anidar incorrectamente un `<div>` dentro de otro heading. Se agregó soporte `asChild` vía `@radix-ui/react-slot`, mismo patrón que `Button` en este proyecto; los otros 2 usos existentes de `CardTitle` (`post-form.tsx`, `app/admin/page.tsx`) no pasan `asChild` y siguen funcionando sin cambios.
- **`detail-dialog.tsx`**: el `eyebrow` se movió fuera de `DialogTitle` (antes eran hermanos dentro del mismo Title, lo cual rompía el uso de `asChild` de Radix, que exige un único hijo clonable) — mismo resultado visual, estructura corregida.
- **Validado E2E con datos reales**: item de prueba aislado (creado y eliminado vía API, sin tocar contenido real) con título `## Título **con** Markdown de prueba` — confirmado que se interpreta como encabezado en negrita tanto en la tarjeta de industrias como en el modal; confirmado en paralelo que un título sin Markdown ("Automotriz") se sigue viendo exactamente igual que antes.
- `npx tsc --noEmit`, `npm run lint`, Vitest (35/35) y Playwright (16/16) limpios.

## 2026-08-01 — Orden corregido en el modal: título antes que la imagen

El usuario reportó (con captura) que en el `DetailDialog` el título aparecía **después** de la imagen — el formato acordado es título arriba, imagen debajo, contenido al final.

- `components/marketing/detail-dialog.tsx`: el bloque de `eyebrow` + `DialogTitle` se movió antes del bloque de imagen (antes estaban invertidos: imagen primero, luego título dentro del mismo `<div className="p-8">` que envolvía también resumen/detalle). Ahora son 3 bloques secuenciales dentro del área con scroll: título (`p-8 pb-0`), imagen (`mt-6`), contenido (`p-8`).
- Validado visualmente con captura real del modal ("Comercio Exterior, Aduanas y Cumplimiento Transfronterizo"): título con eyebrow "A" arriba, imagen del puerto debajo, párrafo de detalle al final — orden correcto confirmado.
- `npx tsc --noEmit`, `npm run lint`, Vitest (35/35) y Playwright (16/16) limpios.

## 2026-08-06 — Imágenes recortadas en los modales de Especialización/Servicios/Industrias

El usuario reportó (con dos capturas) que las imágenes dentro de los modales de detalle de las 3 secciones se veían incompletas — recortadas, sin ajustarse al tamaño del modal (p. ej. el logo y parte de la escena de fondo de una imagen quedaban fuera del encuadre).

- Causa: `components/marketing/detail-dialog.tsx` usaba `object-cover` en la imagen del modal — al forzar que la imagen llene el contenedor `aspect-[16/9]`, cualquier imagen que no tuviera exactamente esa proporción quedaba recortada por los lados o arriba/abajo.
- Corregido a `object-contain`: la imagen completa siempre es visible dentro del recuadro, con relleno (`bg-ink/5`) en los espacios sobrantes cuando la proporción no coincide exactamente con 16:9. Un solo cambio de clase, mismo comportamiento en los 3 usos (Especialización, Servicios, Industrias) porque comparten el mismo `DetailDialog`.
- `npx tsc --noEmit` y `npm run lint` limpios.
- Validado visualmente con capturas reales (sin sesión admin activa, para evitar el tipo de mutación accidental de datos ya documentada arriba): modal de Especialización ("Servicios de Comercio Exterior...") y de Industrias ("Automotriz") — en ambos la imagen se ve completa, sin recortes.
- **Nota de entorno descubierta durante la validación**: probar contra `http://127.0.0.1:3100` (en vez de `http://localhost:3100`) hace que Next.js bloquee las conexiones del HMR por CORS (`Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr`), lo cual impide que React hidrate del todo — cualquier clic en la página deja de funcionar (ni siquiera abre el modal), aunque el HTML se sirve con 200 y sin errores visibles. Para pruebas de Playwright/manuales que dependen de interactividad del cliente, usar siempre `localhost`, no `127.0.0.1` (la recomendación de usar `127.0.0.1` en `INFRA.md` aplica solo a Newman/Postman, que no depende de hidratación de React).
- Vitest (35/35) y Playwright (16/16) verificados en verde tras el cambio, en un dev server reiniciado limpio (se detectó y descartó un runtime error transitorio de Turbopack — "Missing `<html>` and `<body>` tags" — causado por caché `.next` obsoleta tras el reinicio; se resolvió borrando `.next` y reiniciando).

## 2026-08-06 — Imágenes organizadas por sección + seeds con contenido/imágenes reales (previo a subir el repo a GitHub)

El usuario pidió preparar el proyecto para subirlo a GitHub (`https://github.com/ftoscanomarquez/economy-and-fair-competition`) y agregar CI/CD. Antes de eso, pidió corregir cómo se guardan las imágenes: hasta ahora todas vivían planas en `public/uploads/*.ext`; el pedido fue organizarlas en subcarpetas por origen, y que el contenido/imágenes reales actuales (ya cargados vía admin) sean el estado de arranque de cualquier instalación desde cero, no placeholders genéricos.

**Reorganización de almacenamiento (`public/uploads/<carpeta>/`):**
- `lib/uploads.ts`: `IMAGE_FOLDERS` (whitelist cerrada: `home`, `especializacion`, `servicios`, `industrias`, `articulos-y-notas`, `generado-ia`, `otros`) — un `folder` fuera de esta lista cae en `"otros"`, evitando path traversal vía un valor de cliente arbitrario. `saveImageBuffer()` ahora acepta `folder` y guarda/registra la URL como `/uploads/<folder>/archivo.ext`.
- `app/api/uploads/route.ts`: acepta un campo `folder` en el `FormData` y lo pasa a `saveImageBuffer`.
- `lib/content-items-shared.ts` (nuevo): se extrajeron `CONTENT_SECTIONS`, `ContentSection`, `SECTION_LABELS` y el nuevo `SECTION_UPLOAD_FOLDER` (mapeo `expertise→especializacion`, `services→servicios`, `industries→industrias`) a un módulo sin dependencias de servidor. `lib/content-items.ts` los re-exporta para no romper a los consumidores existentes.
  - **Por qué un archivo aparte**: `detail-dialog.tsx` y `content-items-manager.tsx` son `"use client"` y necesitaban `SECTION_UPLOAD_FOLDER` para saber a qué carpeta subir la imagen editada. Importarlo directamente desde `lib/content-items.ts` (que hace `import { ObjectId } from "mongodb"`) arrastró el driver de Mongo al bundle del navegador y rompió Turbopack con `500` en toda la Home (`the chunking context (unknown) does not support external modules (request: node:fs)`) — descubierto en la validación visual post-cambio, no en tsc/lint (ambos pasaban limpio porque el problema es de bundling, no de tipos). Resuelto separando las constantes puras a `content-items-shared.ts`.
  - Cada componente que sube imágenes ahora manda su `folder`: `content-items-manager.tsx` y `detail-dialog.tsx` vía `SECTION_UPLOAD_FOLDER[section]`; `editable-image.tsx` (hero de Home) con `"home"` fijo; `image-upload-field.tsx` (bloques de posts en Artículos y Notas) con `"articulos-y-notas"` fijo; `lib/ai/image-generation.ts` (generación con IA) con `"generado-ia"` fijo.
- **Migración de las 39 imágenes ya existentes** (`scripts/migrate-uploads-to-folders.ts`, ejecutado una vez contra Mongo Atlas real): movió cada archivo físico a su subcarpeta y actualizó la URL en `content_items.imageUrl`, `site_texts["home.hero.image"]` y `posts.thumbnailUrl`/bloques `hero`/`twoColumn`. 30 archivos tenían referencia activa y se migraron; 9 eran huérfanos (subidos en pruebas manuales previas, sin ninguna referencia en `content_items`/`posts`/`uploaded_files`) y se archivaron en `otros/` sin borrarlos.

**Seeds de arranque con contenido real (no placeholders):**
- `content/seed-images/<carpeta>/`: copia versionada en git de las 30 imágenes reales (título/resumen/detalle de Especialización, Servicios, Industrias, más el hero de Home y las imágenes de bloques de posts). `public/uploads/` sigue en `.gitignore` (es la zona runtime del admin) — `content/seed-images/` es la fuente versionada de la que se reconstruye.
- `scripts/seed-images.ts` (nuevo, sin dependencia de Mongo): copia `content/seed-images/<carpeta>/*` → `public/uploads/<carpeta>/`, idempotente (si el destino ya existe no lo sobreescribe, para no pisar una imagen que el admin ya reemplazó en producción).
- `content/seeds/content-items.ts` (nuevo): las 24 entradas reales de `content_items` (título/resumen/detalle ES+EN + `imageUrl` ya apuntando a la ruta con subcarpeta), exportadas directamente desde Mongo Atlas de producción.
- `scripts/seed-content-items.ts` (nuevo): siembra `content_items` desde ese archivo vía upsert por `section+order` (mismo patrón que `seed-config.ts`) — reemplaza la dependencia de `migrate-content-items.ts` (que solo tenía placeholders genéricos desde `site_texts`) como fuente de arranque real.
- `package.json`: nuevo script `seed:images` y `seed:content-items`; `seed:all` ahora corre `seed:schema → seed:images → seed:config → seed:content-items → seed:data` (las imágenes deben existir en disco antes de que cualquier documento las referencie).
- `content/seeds/site-texts.ts` y `scripts/migrate-content-items.ts`: el placeholder legacy `/uploads/home-hero-default.png` (40 ocurrencias) actualizado a `/uploads/home/home-hero-default.png`.

**Validado:**
- `npx tsc --noEmit` y `npm run lint` limpios tras cada cambio.
- Vitest 35/35 y Playwright 16/16 verdes con el dev server reiniciado limpio.
- Verificación con Playwright real: cero requests fallidos (`4xx`/`5xx`) a `/uploads/*` en la Home tras la reorganización.
- `scripts/seed-content-items.ts` probado contra Mongo Atlas real: `0 insertados, 24 actualizados` (mismo contenido, confirma que el upsert es estable y no duplica).
- Confirmado con consultas directas a Mongo que los 9 archivos huérfanos movidos a `otros/` no tienen ninguna referencia activa en `content_items`, `posts` ni `uploaded_files`.

**Pendiente / anotado para después:** en Vercel el filesystem no persiste entre despliegues — cualquier imagen que un admin suba en producción a `public/uploads/` desaparecerá en el siguiente deploy si no se resuelve almacenamiento persistente (S3/Blob storage) antes de ese lanzamiento. No bloqueante para el CI/CD que se implementa a continuación, pero es una decisión pendiente antes de un deploy de producción real en Vercel.

## 2026-08-06 — Repo subido a GitHub + CI/CD (build, lint, Vitest, Playwright, Semgrep, k6 manual)

Primer push del proyecto a `https://github.com/ftoscanomarquez/economy-and-fair-competition` (no era repo git hasta ahora), con GitHub Actions configurado.

**Repositorio:**
- `git init` + `git remote add origin` + primer commit (237 archivos, incluyendo las 30 imágenes reales de `content/seed-images/`, ~59MB, versionadas deliberadamente para que un clon nuevo arranque con contenido real).
- Se eliminó un directorio artefacto `C:/` vacío (creado por un comando bash anterior en esta sesión que interpretó mal una ruta absoluta de Windows) — git en Windows no puede ignorar ni versionar un directorio con ese nombre literal (lo trata como prefijo de unidad), así que se borró en vez de excluirlo por patrón.
- Se excluyeron del repo `.claude/`, `.codex/`, `.impeccable/` (config local de asistentes de IA con rutas absolutas de esta máquina, sin secretos pero no portable).
- El repo remoto ya tenía un commit inicial autogenerado por GitHub (`README.md` de una línea) — se resolvió con `git merge --allow-unrelated-histories`, conservando el `README.md` real del proyecto sobre el placeholder.

**GitHub Actions (`.github/workflows/`):**
- `ci.yml`, dispara en push a `main` y en todo Pull Request hacia `main`:
  - `build-and-unit-tests`: `npm ci` → `typecheck` → `lint` → `test` (Vitest) → `build` (Next.js). No depende de servicios externos, es el gate rápido.
  - `e2e`: Playwright completo, con **Mongo (`mongo:7`) y Mailpit (`axllent/mailpit`) como servicios Docker efímeros del propio job** — se destruyen al terminar, nunca tocan el Atlas ni el Mailpit reales de desarrollo. Corre `npm run seed:all` (schema + imágenes + content_items reales + posts) antes de los tests, igual que un entorno de desarrollo nuevo. Requiere el repository secret `CI_JWT_SECRET` (valor de prueba, generado con el mismo comando que documenta `.env.example`, sin relación con el `JWT_SECRET` real de producción en Vercel).
  - `semgrep`: SAST vía la imagen oficial `semgrep/semgrep`, en paralelo, `continue-on-error: true` (no bloquea el pipeline por hallazgos, el reporte HTML queda como artefacto para revisión humana — mismo criterio que el flujo local ya documentado en `QUICK-START.md`).
  - Los 3 jobs suben sus reportes (Vitest/Playwright/Semgrep HTML) como artifacts de la corrida (14 días de retención).
- `load-test.yml` (nuevo, **disparo manual únicamente** vía `workflow_dispatch`, con un selector de escenario spike/sustained/both): no corre en cada push — k6 es pesado y no aporta valor en cada commit. Levanta Mongo efímero, siembra, hace `next build` + `next start`, espera con `wait-on`, instala k6 desde su repositorio APT oficial, y corre `tests/load/public-load.js` contra el servidor real recién levantado.

**Decisiones explicadas al usuario durante esta tarea** (por qué Playwright necesita Mongo/JWT/Mailpit en CI, qué es un "runner", por qué el filesystem de Vercel no persiste): confirmado que el usuario entendió el modelo antes de aprobarlo, no se asumió.

**Pendiente de acción manual del usuario:** crear el repository secret `CI_JWT_SECRET` en GitHub (Settings → Secrets and variables → Actions) con el valor de prueba generado en esta sesión — confirmado por el usuario como ya hecho antes del push.

**Validado:** `npx tsc --noEmit`, `npm run lint`, `npm run build` (producción, contra el `.env` real) y ambos YAML (`ci.yml`, `load-test.yml`) verificados sintácticamente válidos con `js-yaml` antes del push. La ejecución real del pipeline en GitHub Actions queda pendiente de observar en la pestaña Actions del repo tras este push.

**Primer run real de CI (post-push), dos fallos corregidos:**
1. `npm ci` fallaba con `ERESOLVE` — `newman-reporter-html@1.0.5` declara `peer newman@"4"`, pero el proyecto usa `newman@6.2.2`. Localmente pasaba desapercibido porque `npm install` (a diferencia de `npm ci`, más estricto) tolera ese conflicto sin fallar. Corregido agregando `.npmrc` con `legacy-peer-deps=true` (aplica tanto en CI como en cualquier instalación local futura) y regenerando `package-lock.json` en consecuencia.
2. El job de Semgrep fallaba con `node: not found` — corría dentro de `container: image: semgrep/semgrep`, una imagen sin Node preinstalado; `actions/setup-node@v4` no puede instalar Node dentro de un contenedor de job (solo prepara el runner host). Corregido: el job vuelve a un `ubuntu-latest` normal (con Node ya disponible vía `setup-node`) y Semgrep se invoca con `docker run --rm -v "$PWD:/src" semgrep/semgrep semgrep scan ...` en vez de como contenedor del job completo.

Ambos corregidos y verificados localmente (`npm ci`, `tsc`, `lint`, Vitest limpios con el lockfile regenerado) antes de un segundo push con la corrección.

**Segundo run real, tercer fallo corregido:** `npm ci`/lint/typecheck ya pasaban, pero `Vitest` fallaba con `Variables de entorno inválidas` (`NEXT_PUBLIC_SITE_URL`, `MONGODB_URI`, etc. requeridas) — `tests/unit/setup.ts` lee `.env` del disco solo como fallback (nunca sobreescribe variables ya presentes en `process.env`), pero yo había puesto esas variables de prueba solo en el paso `Build (Next.js)` del `ci.yml`, no a nivel de todo el job — el paso `Vitest` corre antes y no las veía. Corregido moviendo el bloque `env:` al nivel del job `build-and-unit-tests` completo, para que tanto `Vitest` como `Build` las hereden.

**Tercer run real, cuarto fallo corregido:** con las env vars ya resueltas, `Typecheck` falló con `TypeError [ERR_UNKNOWN_FILE_EXTENSION]` al cargar el binario `tsc` — un bug conocido de Node 20.9.0 exacto (el patch mínimo que fijaba `ci.yml`/`load-test.yml`) al cargar un binario sin extensión de archivo desde un paquete `"type":"module"`. Corregido cambiando `node-version` de `"20.9.0"` a `"20"` en ambos workflows, que resuelve siempre al último release de la línea 20.x LTS disponible en el runner (sigue cumpliendo el mínimo `>=20.9.0` de `package.json`, pero evita este bug de un patch viejo específico).

**Cuarto run real, quinto fallo corregido (causa raíz real, no otro síntoma):** `Typecheck` volvió a fallar, ahora con `TS7016: Could not find a declaration file for module 'react/jsx-runtime'` en decenas de archivos — no reproducible localmente (Node 25 en esta máquina). El log de instalación mostró la pista real: `npm warn EBADENGINE` para `file-type@22.0.1` (usado activamente en `lib/file-signature.ts`, valida la firma binaria de archivos subidos) y `pdfjs-dist@6.1.200` (dependencia transitiva de `officeparser`), ambos con `required: { node: '>=22' }` — Node 20 (v20.20.2 exacto que resolvió `node-version: "20"`) los instala igual gracias a `legacy-peer-deps=true`, pero algo en esa instalación bajo una versión de Node no soportada rompe silenciosamente la resolución de tipos de TypeScript aguas abajo (no el `npm ci` en sí, que "tiene éxito" con solo un warning). Corregido subiendo `node-version` a `"22"` en ambos workflows y actualizando el mínimo real en `package.json` de `>=20.9.0` a `>=22` (ya no era honesto — el proyecto dejó de soportar Node 20 en algún punto al agregar estas dependencias, sin que nadie actualizara el `engines`).

**Quinto run real, mismo error persiste con Node 22 — causa raíz distinta identificada:** el fix de Node 22 no resolvió nada; el mismo `TS7016` apareció idéntico. Se reprodujo el ambiente exacto de CI en un contenedor Docker Linux (`node:22`, clon fresco del repo real desde GitHub, `npm ci` + `tsc --noEmit`) y ahí **sí pasó limpio** (exit 0) — descartando tanto la versión de Node como el propio código/lockfile como causa. Comparando el log real del runner de GitHub contra la reproducción Docker: el runner instaló **419 paquetes**, la reproducción Docker (y el entorno local) instalaron **1002 paquetes** — el `cache: npm` de `actions/setup-node@v4` estaba sirviendo un caché obsoleto/parcial (probablemente de uno de los primeros intentos fallidos, antes de que `package-lock.json` se regenerara con `legacy-peer-deps`), dejando el `node_modules` del runner con menos de la mitad de las dependencias reales — entre ellas, aparentemente, una copia completa y correcta de `@types/react`. Corregido eliminando `cache: npm` de `actions/setup-node` en los 3 usos (dos en `ci.yml`, uno en `load-test.yml`) — cada run instala desde cero (costo aceptado: unos 30-60s más por run) a cambio de eliminar esta clase de bug de raíz.

**Sexto run real, mismo error persiste sin caché — causa raíz encontrada y confirmada:** quitar el caché no cambió nada (seguían siendo 419 paquetes). Se agregó un paso de diagnóstico temporal al workflow (`npm config list`, conteo de `node_modules`, existencia de `@types/react`) y confirmó: `@types/react` **no existía en absoluto** en `node_modules` del runner, pese a que `react` sí. La pista fue que 1002 − 419 = 583, y localmente `NODE_ENV=production npm ci --dry-run` reportó exactamente `removed 583 packages` — coincidencia exacta. Causa real: `NODE_ENV: production` estaba definido en el bloque `env:` a **nivel del job completo** (agregado para que `next build` tuviera las variables de `lib/env.ts`), y `npm ci` respeta `NODE_ENV=production` del entorno **omitiendo todas las `devDependencies`** durante la instalación — incluyendo `typescript`, `@types/react`, `vitest`, etc. `npm ci` no reporta ni advierte sobre esto, simplemente instala menos paquetes en silencio; por eso costó 6 intentos aislarlo (los síntomas — Node 20 vs 22, caché de npm — eran pistas falsas, coincidencias de timing con otros fixes reales que sí eran necesarios pero no resolvían este problema específico). Corregido moviendo `NODE_ENV: production` del nivel del job al paso `Build (Next.js)` únicamente — es el único paso que realmente lo necesita; `Instalar dependencias`, `Typecheck`, `Lint` y `Vitest` corren sin él y ahora instalan/ven las 1002 dependencias completas. Eliminado también el paso de diagnóstico temporal. Verificado localmente: `npm ci` sin `NODE_ENV` instala `@types/react` correctamente y `tsc --noEmit` pasa limpio.

**Séptimo run real — causa raíz de Node.js confirmada, `build-and-unit-tests` y `semgrep` en verde por primera vez.** Solo quedó fallando `Playwright E2E`, en el paso "Sembrar base de datos": `node: .env: not found`. Los scripts `scripts/seed-*.ts` usan `tsx --env-file=.env` (mismo patrón que en desarrollo local, no leen `process.env` directamente) — en CI no existe un archivo `.env` físico (correcto, nunca se versiona), aunque las variables ya estén inyectadas por el `env:` del job. Corregido agregando un paso "Generar .env para los scripts de seed" que escribe un `.env` temporal a partir de esas mismas variables antes de correr `npm run seed:all`, exclusivo del job de Playwright (el job `build-and-unit-tests` no lo necesita porque no llama a ningún script `seed:*`).

**`ci.yml` verificado en verde de punta a punta** (3 jobs, run real en GitHub): `Build, lint, typecheck y Vitest` ✓, `Semgrep (SAST)` ✓, `Playwright E2E` ✓ (con Mongo+Mailpit efímeros, seed de contenido real, 16 tests). El pipeline automático de CI queda cerrado.

## 2026-08-07 — Primera corrida real de `load-test.yml` (k6), mismos dos bugs ya corregidos en `ci.yml` pero replicados sin querer

El usuario pidió correr el workflow manual de k6 para confirmarlo end-to-end. Se disparó vía `gh workflow run load-test.yml -f scenario=spike`. Falló con `sh: 1: tsx: not found` en el paso de seed — exactamente el mismo bug de `NODE_ENV: production` a nivel de job completo (`npm ci` omite `devDependencies`, incluyendo `tsx`) que ya se había diagnosticado y corregido en `ci.yml`, pero que no se replicó a `load-test.yml` en su momento porque ambos workflows se escribieron en paralelo antes de encontrar el bug. Corregido con el mismo patrón ya validado: `NODE_ENV: production` movido del nivel de job al paso `Build` únicamente, y agregado el mismo paso "Generar .env para los scripts de seed" antes de `npm run seed:all` (`tsx --env-file=.env`, no lee `process.env` directamente).

**Segundo intento de `load-test.yml`, avanzó mucho más — dos problemas nuevos y reales, no repetición de bugs anteriores:** con el fix de `.env`/`NODE_ENV` aplicado, el job llegó hasta ejecutar k6 de verdad (seed, build, servidor levantado, k6 instalado, 3291 requests HTTP procesadas con **0% de fallos reales**). Falló el job igual (exit 99) por dos causas:
1. `handleSummary()` en `tests/load/public-load.js` escribe `tests/reports/k6/public-load.html`, pero ese directorio no existe en un checkout limpio (`tests/reports/` completo está en `.gitignore`, correcto) y `k6` no lo crea automáticamente — error `could not open ... no such file or directory` al final de la corrida. Corregido con `mkdir -p tests/reports/k6` antes de `k6 run` en `load-test.yml`.
2. El único threshold real que se cruzó fue `http_req_duration: p(95)<12000` (el SLA de referencia, documentado en `INFRA.md`, medido contra el hardware dedicado del entorno de desarrollo) — bajo 500 VUs instantáneos en el runner compartido de GitHub Actions (2 vCPU, sin réplicas), el p95 real fue de ~31s. No es una regresión de la app: `http_req_failed` fue `rate: 0` (cero errores). Corregido haciendo el umbral de latencia configurable vía `LATENCY_THRESHOLD_MS` (nueva env var opcional en `tests/load/public-load.js`, default `12000` sin cambios para uso local); `load-test.yml` lo pasa como `25000` específicamente para el contexto de CI, dejando intacto el SLA real para cualquier corrida local contra hardware de referencia.

**Tercer intento de `load-test.yml`: éxito completo.** `k6 (spike)` en verde en 2m12s, reporte HTML subido correctamente como artifact `k6-report`. Los dos workflows de GitHub Actions (`ci.yml` automático en push/PR, `load-test.yml` manual bajo demanda) quedan verificados en verde de punta a punta con corridas reales.

## 2026-08-07 — Primer deploy real a Vercel (producción)

El usuario pidió configurar el correo real de producción (Resend, hasta ahora solo probado vía Mailpit en dev) — al revisar `lib/mailer.ts` se confirmó que el switch Mailpit/Resend por `NODE_ENV` ya estaba implementado correctamente y no necesitaba cambios de código, solo faltaba: (a) una `RESEND_API_KEY` real (vacía en `.env` local) y (b) desplegar el sitio a algún lado donde `NODE_ENV=production` sea real. El usuario decidió primero desplegar a Vercel y configurar Resend después.

**Vinculación del proyecto:**
- `vercel link` creó el proyecto `vercel-toscano-team/economy-and-fair-competition`, pero la conexión automática a GitHub falló la primera vez — la GitHub App de Vercel no tenía autorizado el repo (solo tenía `ftoscanomarquez/meli-projects` en su lista de "Only select repositories"). El usuario lo agregó manualmente desde `github.com/settings/installations` (Select repositories → agregar `economy-and-fair-competition` → Save), tras resolver un `sudo mode` de GitHub que pedía un código de verificación por correo (tardó unos minutos en llegar, nada anómalo). Con eso, `vercel git connect` conectó correctamente.

**Variables de entorno de producción** (`vercel env add ... production`, vía stdin para no exponer valores sensibles en el historial de shell):
- `MONGODB_URI`/`MONGODB_DB`: el mismo Atlas real ya usado en desarrollo (mismo cluster, mismos datos — no se creó un cluster de producción separado).
- `JWT_SECRET`: generado nuevo (`crypto.randomBytes(32).toString('hex')`), distinto al de dev — nunca reusar secretos de sesión entre entornos.
- `AI_CONFIG_ENCRYPTION_KEY`: generado nuevo también, mismo criterio.
- `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL`: reusados tal cual del `.env` local (decisión del usuario — más simple, el gasto se comparte entre dev y producción).
- `CONTACT_NOTIFICATION_EMAIL`, `ADMIN_ALLOWED_EMAILS`, `MAIL_FROM`: trasladados tal cual.
- `NEXT_PUBLIC_SITE_URL`: configurado con la URL esperada de Vercel (`https://economy-and-fair-competition.vercel.app`) antes del primer deploy — coincidió exactamente con la URL real asignada.
- `RESEND_API_KEY`: dejada sin configurar intencionalmente — el correo en producción no funcionará hasta que el usuario cree cuenta en Resend, verifique el dominio, y agregue la key real (tarea pendiente aparte).

**Primer deploy (`vercel deploy --prod`): build exitoso pero sitio caído en producción (500 en todas las rutas).** Log de runtime (`vercel logs`) mostró la causa exacta: `EROFS: read-only file system, open '/var/task/logs/app.log'` — `lib/logger.ts` siempre escribía Pino a un archivo físico en producción (`pino.destination({ dest: logFilePath })`, sin importar la plataforma), pero Vercel usa un filesystem de solo lectura para el código desplegado (mismo tipo de restricción de disco no persistente ya identificado para `public/uploads/`, pero aquí sí bloqueante — tumbaba cada request, no solo perdía archivos). Corregido: el logger ahora detecta `process.env.VERCEL` (variable que la plataforma inyecta automáticamente en runtime) y, si está presente en producción, escribe a `stdout` (`pino.destination(1)`) en vez de a archivo — Vercel captura stdout/stderr como logs sin configuración adicional. El comportamiento de archivo físico se mantiene intacto para desarrollo local y para cualquier despliegue propio con disco persistente (Docker, VPS).

**Segundo deploy: éxito.** `https://economy-and-fair-competition.vercel.app/es` responde 200, contenido real de Mongo Atlas (título, hero, imágenes) confirmado visualmente con captura — idéntico a local.

**Pendientes explícitos, no bloqueantes para este deploy:**
- Configurar Resend (cuenta + dominio verificado + `RESEND_API_KEY` real en Vercel) — el formulario de contacto y el login por magic link no funcionarán en producción hasta entonces.
- Migrar `lib/uploads.ts` a Vercel Blob (o similar) antes de que alguien suba contenido nuevo desde el admin en producción — el filesystem de Vercel no persiste entre deploys, cualquier imagen subida ahí se perdería en el siguiente deploy. Se detectó también un warning de build de Turbopack (no bloqueante) sobre tracing de todo el filesystem por los `path.resolve`/`fs` dinámicos de `lib/uploads.ts` — revisar junto con la migración a Blob.

## 2026-08-07 — Dominio propio conectado: economyandfaircompetition.com apuntando a Vercel

El dominio real de la firma (`economyandfaircompetition.com`) vivía en WordPress.com, con WordPress.com administrando también el DNS completo (nameservers `ns1/ns2/ns3.wordpress.com`) — confirmado con `nslookup -type=NS`. El usuario también tiene un dominio propio en Cloudflare (`minegocito.app`, fuera del alcance de esta sesión) que se reserva para el tema de correo (Resend) en un paso posterior, no para el sitio.

**Decisión de estrategia**: en vez de mover la gestión DNS completa a Cloudflare como paso intermedio, se conectó `economyandfaircompetition.com` **directo** a Vercel — menos capas, un solo cambio. WordPress.com permite editar registros DNS individuales del dominio sin cambiar los nameservers, así que no fue necesario mover el dominio entero.

- `vercel domains add economyandfaircompetition.com` (a nivel de team) + `vercel domains add economyandfaircompetition.com economy-and-fair-competition` (vinculado al proyecto).
- `vercel domains inspect` devolvió el registro exacto requerido: `A economyandfaircompetition.com → 76.76.21.21` (IP anycast estándar de Vercel para dominios raíz, confirmada dos veces antes de que el usuario la aplicara).
- El usuario, guiado paso a paso en `my.wordpress.com/domains/economyandfaircompetition.com/dns`, eliminó el registro `A` gestionado por WordPress (apuntaba al hosting de WordPress) y agregó uno nuevo: tipo `A`, nombre vacío (dominio raíz), valor `76.76.21.21`. Editó también el `CNAME www` existente para apuntar a `cname.vercel-dns.com` en vez de al propio `economyandfaircompetition.com`.
- Se dejaron intactos, deliberadamente, todos los registros de correo/autenticación de WordPress (`CNAME wpcloud1/2._domainkey`, `TXT _dmarc`, `TXT @ v=spf1`, `TXT _domainconnect`) — no relacionados con el sitio, y se reemplazarán solo si el correo termina configurándose en este mismo dominio más adelante.
- Propagación casi instantánea: `nslookup economyandfaircompetition.com` → `76.76.21.21`; `nslookup www.economyandfaircompetition.com` → `cname.vercel-dns.com`. `vercel domains inspect` dejó de mostrar el warning de configuración incorrecta.
- `NEXT_PUBLIC_SITE_URL` en Vercel actualizado de la URL placeholder (`economy-and-fair-competition.vercel.app`) al dominio real (`https://economyandfaircompetition.com`), seguido de un redeploy para que el build lo recoja.
- **Confirmado con curl real**: `https://economyandfaircompetition.com/es` responde `200`, con SSL válido (certificado emitido automáticamente por Vercel tras la verificación DNS).

**Pendiente explícito**: el correo (Resend) sigue sin resolverse — decisión del usuario de posponerlo hasta que el dominio del sitio quedara funcionando. Cuando se retome, evaluar si el dominio técnico de envío será un subdominio de `minegocito.app` (Cloudflare, más simple de verificar) o `economyandfaircompetition.com` (ahora que su DNS es editable vía WordPress.com, aunque con más riesgo de tocar registros ya usados por el correo actual de WordPress).

## 2026-08-07 — Imágenes rotas en producción: migración a Vercel Blob

Tras conectar el dominio propio, el usuario reportó que las imágenes no cargaban en ningún dominio de Vercel (ni el custom ni `*.vercel.app`) — confirmado con `curl` que todas las rutas `/uploads/...` devolvían 404 reales. Causa raíz: `public/uploads/` está en `.gitignore` (correctamente, es zona de trabajo del admin) y solo tiene `.gitkeep` versionado — el deploy de Vercel nunca tuvo las imágenes reales, que solo existían en el disco local donde se había corrido `npm run seed:images`. Esto es exactamente el escenario de storage no persistente ya anticipado y documentado como pendiente en la entrada del primer deploy, ahora confirmado en producción real.

**Migración a Vercel Blob** (`@vercel/blob`, instalado):
- `vercel blob create-store economy-and-fair-competition-uploads --access public --yes` creó el store y lo conectó automáticamente al proyecto, inyectando `BLOB_READ_WRITE_TOKEN` en producción y descargándolo a `.env.local` (gitignored) para uso local.
- `lib/uploads.ts` reescrito: `saveBuffer()` ahora sube a Blob (`put()`, acceso público) cuando `process.env.BLOB_READ_WRITE_TOKEN` está presente, con fallback a disco local sin cambios de comportamiento cuando no lo está (desarrollo local, despliegues propios con filesystem persistente). `fileExistsForUrl()`/`deleteUploadedFile()` distinguen URLs de Blob (absolutas, `https://...`) de rutas locales (`/uploads/...`) para usar `head()`/`del()` de Blob o `fs.access()`/`fs.unlink()` según corresponda. El contrato público (`{ url }` devuelto por `/api/uploads`) no cambió — ningún componente cliente necesitó modificarse.
- `next.config.ts`: `images.remotePatterns` ahora permite `*.public.blob.vercel-storage.com` (`next/image` bloquea por defecto cualquier origen no listado).
- `scripts/migrate-uploads-to-blob.ts` (nuevo, corrido una vez): sube a Blob cada archivo referenciado desde `content_items.imageUrl`, `site_texts["home.hero.image"]`, `posts.thumbnailUrl` y bloques `hero`/`twoColumn`, y actualiza cada URL en Mongo de la ruta relativa (`/uploads/<seccion>/archivo.ext`) a la URL absoluta de Blob. Corrido contra Mongo Atlas real: 34 archivos subidos, 28 documentos actualizados.
- `.env.example` documentado con `BLOB_READ_WRITE_TOKEN` y su procedencia.

**Validado**: tras el deploy con estos cambios, verificación real con Playwright (`page.on("response")` filtrando por `blob.vercel-storage.com`/`/_next/image`) — cero requests fallidos, captura de pantalla confirma la imagen del hero y el resto del contenido cargando correctamente en `https://economyandfaircompetition.com/es`.

**Confirmado con el usuario**: cualquier imagen que se suba desde el admin en producción (items de contenido, hero, bloques de posts, generación con IA) ahora se sube automáticamente a Vercel Blob sin cambio alguno en el flujo de la interfaz — el mismo endpoint `/api/uploads`, la bifurcación es interna a `lib/uploads.ts`.

## 2026-08-08 — Correo real de producción configurado (Resend)

**Contexto de la cuenta de Resend**: el usuario ya tenía una cuenta de Resend en uso para otro proyecto (`planet-scape`). El plan gratuito de Resend limita a **1 dominio verificado por cuenta**, no por volumen de correos como se asumía inicialmente — al intentar agregar `economyandfaircompetition.com` a esa cuenta existente, Resend exigió upgrade al plan Pro (de pago). Con el volumen de `planet-scape` confirmado como bajo, se optó por crear una **segunda cuenta de Resend gratuita**, exclusiva para este proyecto, en vez de pagar el plan Pro o migrar de proveedor.

**Verificación del dominio** (cuenta nueva de Resend → Domains → Add Domain → `economyandfaircompetition.com`), 3 registros DNS agregados en WordPress.com (mismo panel usado para conectar el dominio a Vercel):
- `TXT resend._domainkey` → clave pública DKIM.
- `MX send` → `feedback-smtp.us-east-1.amazonses.com`, prioridad 10.
- `TXT send` → `v=spf1 include:amazonses.com ~all`.

Los tres usan el subdominio `send.economyandfaircompetition.com` o un nombre específico (`resend._domainkey`) — **no chocan** con el SPF/DKIM ya existentes de WordPress en el dominio raíz (`@`), verificado antes de guiar al usuario a agregarlos (no fue necesario fusionar registros, a diferencia de lo anticipado). Propagación confirmada con `nslookup` en minutos; Resend verificó el dominio de inmediato tras eso.

**Configuración final en Vercel** (`vercel env add ... production` + redeploy):
- `RESEND_API_KEY`: la key real generada en la cuenta nueva de Resend (`economy-and-fair-competition-prod`).
- `MAIL_FROM`: sin cambios (`no-reply@economyandfaircompetition.com`, ya configurado en el primer deploy) — confirmado que el dominio raíz completo queda autorizado para enviar una vez verificado el DKIM, no solo el subdominio `send.`.
- `CONTACT_NOTIFICATION_EMAIL`: corregido de `contacto@economyandfaircompetition.com` (placeholder usado solo para no bloquear el deploy inicial, nunca fue el correo real) a `economyandfaircompetition@gmail.com` — el correo real de la firma para recibir consultas del formulario de contacto, confirmado explícitamente por el usuario en esta sesión.
- `ADMIN_ALLOWED_EMAILS`: de un solo correo placeholder (`admin@economyandfaircompetition.com`) a los dos correos admin productivos reales: `francisco.alberto.tm@gmail.com` y `economyandfaircompetition@gmail.com` (separados por coma, formato que ya espera `lib/env.ts`).
- `.env` local: `CONTACT_NOTIFICATION_EMAIL` actualizado a `francisco.alberto.tm@gmail.com` (correo real del usuario, para que las pruebas locales del formulario de contacto —vía Mailpit— también reflejen el destinatario real). `ADMIN_ALLOWED_EMAILS` local se dejó intacto (`admin@economyandfaircompetition.com`) — es el correo hardcodeado en `tests/e2e/helpers/auth.ts` para el login automático de Playwright; cambiarlo ahí habría requerido actualizar también la suite de pruebas, fuera de alcance de este cambio.

**Validado de punta a punta con una prueba real** (no simulada): `CONTACT_NOTIFICATION_EMAIL` se cambió temporalmente a `francisco.alberto.tm@gmail.com`, se hizo un redeploy, y se disparó un `POST /api/contact` real contra `https://economyandfaircompetition.com` vía `curl`. Log de Vercel (`vercel logs`) confirmó la cadena completa: conexión a Mongo → circuit breaker de Resend pasa de `HALF_OPEN` a `CLOSED` tras la llamada exitosa → `"Correo enviado vía Resend"` con el `id` real de Resend → `emailDelivered: true`. El usuario confirmó la recepción real en su bandeja. Tras la confirmación, se restauró `CONTACT_NOTIFICATION_EMAIL` al valor real de producción y se hizo el redeploy final con `ADMIN_ALLOWED_EMAILS` ya con ambos correos admin.

**Pendiente inmediato, ya sin bloqueantes de infraestructura**: el usuario probará a continuación el flujo de login por magic link en producción real, con ambos correos admin ya autorizados.

## 2026-08-08 — Datos de contacto reales (dirección, mapa, correo) + textos no editables corregidos

**Corrección de datos de contacto**: el sitio nunca tuvo dirección física ni un mapa real — el "mapa" (`components/marketing/styled-map.tsx`) era un SVG decorativo con el texto fijo "Ciudad de México, México", sin integración real de Google Maps. El correo mostrado (`contacto@economyandfaircompetition.com`) tampoco era el real.

- Nueva clave `contact.direct.address` en `site_texts`: "Bosque de Cipreses Sur 51, Bosques de las Lomas, Miguel Hidalgo, CDMX, 11700" (sin teléfono — la firma no tiene uno público).
- `contact.direct.email` corregido a `economyandfaircompetition@gmail.com` (el correo real, distinto del `CONTACT_NOTIFICATION_EMAIL` de Resend que ya se había corregido en la entrada anterior — son dos cosas separadas: uno es el destinatario técnico del formulario, el otro es el correo que se le muestra al visitante).
- `components/marketing/map-embed.tsx` (nuevo) reemplaza `styled-map.tsx` (eliminado): iframe de Google Maps vía `https://www.google.com/maps?q=<dirección>&output=embed` — **sin API key ni cuenta de Google Cloud**, es el mismo mecanismo que genera el botón "Compartir → Insertar un mapa" de Google Maps. Usa la misma clave `contact.direct.address`, así que se actualiza solo si se edita esa clave (admin o seed), sin tocar el componente. Documentado en `QUICK-START.md` § Contacto.

**Textos no editables encontrados y corregidos** (dos rondas, ambas reportadas por el usuario tras notar que no podía corregirlos en modo edición):
1. **Footer completo** (`components/shared/site-footer.tsx`): nombre de marca, tagline y correo estaban hardcodeados directamente en el componente, sin pasar por `site_texts`/`EditableText` — era la razón por la que el correo viejo seguía apareciendo ahí después del primer fix (ese fix solo tocó el valor hardcodeado, no lo hizo editable). Convertido de `"use client"` con `next-intl` a Server Component async (mismo patrón que las páginas de contenido: `getSiteTexts()` + `t()` + `EditableText`), recibe `locale` desde `app/[locale]/(marketing)/layout.tsx`. Nuevas claves: `footer.brand`, `footer.tagline`, `footer.contactLabel`; el correo reutiliza `contact.direct.email` (una sola fuente para footer y página de contacto).
2. **Estadísticas del hero de Home** (`+28 años`/`Presencia internacional`/`Confianza institucional` y sus descripciones, en `components/marketing/hero.tsx`) y **las etiquetas de la sección de contacto directo** (Dirección/Correo Electrónico/Horario en `app/[locale]/(marketing)/contacto/page.tsx`): ambos usaban `<dt>`/`<dd>` con `t(texts, ...)` en texto plano — `EditableText` nunca soportó esas dos variantes de tag (`as?: "span" | "p" | "h1" | "h2" | "h3"`), así que estos campos jamás fueron editables pese a que sus valores sí vivían en `site_texts`. Corregido agregando `"dt" | "dd"` al union type de `as` en `components/admin/editable-text.tsx`, y usando `EditableText` en ambos lugares. El correo de contacto (dentro de un `<a mailto:>`) se dejó deliberadamente sin `EditableText` para no interferir con el enlace clicable — sigue siendo editable vía la misma clave central.

**Validado**: `npx tsc --noEmit`, `npm run lint`, Vitest (35/35) y Playwright (16/16) limpios tras cada cambio (un fallo de Playwright fue el mismo glitch transitorio de Turbopack por caché `.next` obsoleta ya documentado antes en esta bitácora — resuelto limpiando `.next` y reintentando). Verificación funcional del contenido renderizado vía `curl` (dirección, correo, y URL de `google.com/maps` presentes en el HTML) en vez de capturas de pantalla, porque el límite de tamaño de imagen del canal de esta sesión rechazó reiteradamente las capturas de Playwright durante esta entrada. 3 deploys a producción durante esta entrada (uno por cada fix), todos confirmados con `curl` respondiendo 200 tras cada uno.

## Cómo retomar si se interrumpe el trabajo

1. Leer esta sección "Estado actual" para saber la fase activa.
2. Revisar la última entrada fechada para ver qué se completó y qué falta.
3. Consultar `AGENTS.md` para el detalle completo de la fase activa y sus criterios de validación de salida.
4. Antes de escribir código nuevo, correr `npm run dev` y `npx tsc --noEmit` para confirmar que el estado actual sigue siendo válido.
