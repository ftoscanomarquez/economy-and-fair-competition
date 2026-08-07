# AGENTS.md — Economy and Fair Competition

> Archivo de gobernanza del proyecto. Define la planificación estricta por fases, las reglas técnicas obligatorias y los criterios de validación que deben cumplirse antes de avanzar de un hito al siguiente. Basado en `PROMPT.md`, `ECONOMY-AND-FAIR-COMPETITION.md`, `URUCHURTU.md`, la skill `toscaprompt` y la skill `frontend-design`.
>
> **Regla de oro:** no se avanza de fase sin marcar como completadas las validaciones de la fase anterior en `HISTORY.md`. Si "se va la luz" o se interrumpe el trabajo, `HISTORY.md` es la fuente de verdad para saber exactamente dónde retomar.

---

## 0. Resumen ejecutivo del producto

**Economy and Fair Competition** es el sitio web corporativo de una firma legal internacional de alto prestigio especializada en **Comercio Exterior, Derecho Aduanero y Propiedad Intelectual e Industrial**, con más de 28 años de trayectoria (heredada institucionalmente, sin atribuir a personas).

Fuente de contenido base: el sitio real de **Uruchurtu & Abogados Consultores, S.C.** (`https://uruchurtuabogados.com`, contenido capturado en `URUCHURTU.md`), reescrito y despersonalizado según las reglas obligatorias de `ECONOMY-AND-FAIR-COMPETITION.md`:

- **Sin nombres de personas.** Toda mención individual de socios (Gustavo A. Uruchurtu, César Hernández, Héctor García López) se convierte en experiencia institucional colectiva de la firma.
- Los **perfiles individuales** (experiencia profesional, áreas de especialización personales) se transforman en **servicios y experiencia global de Economy and Fair Competition**.
- Misión y Visión se conservan y mejoran (ver redacción mejorada en PROMPT.md).
- Áreas de práctica llevan texto propio basado en la experiencia agregada del equipo (sin atribución individual).
- Servicios: se conservan y se amplían a **10 servicios integrales** (ver §7.3).
- Industrias: se conserva el listado, se **quita Aeroespacial** y se agrega **Marítimo**.
- "Noticias" se renombra a **"Artículos y Notas"**.
- Se agrega una **4ª área de especialización global**: Consultoría Financiera y Regulación Bancaria (basada en el perfil de Héctor García López, pero despersonalizada).

El sitio debe sostener una experiencia bilingüe (ES/EN) editable en vivo por administradores autenticados, con un backend de publicaciones (posts/artículos) gestionable también vía WhatsApp a través de un servidor MCP.

---

## 1. Alcance y decisiones de gobernanza (confirmadas con el usuario)

Estas decisiones son vinculantes para todo el proyecto. Cambiarlas requiere actualizar esta sección y `HISTORY.md`.

| Área | Decisión |
|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript, según PROMPT.md literal |
| **Gestor de paquetes** | npm |
| **Base de datos** | MongoDB Atlas (cluster `cluster-economy`, DB `economy-and-fair-competition-db`). **Credenciales validadas** — conexión, listado y escritura/borrado de prueba confirmados. La base de datos aún no existe en el cluster; se crea automáticamente en Fase 0 con la primera seed. |
| **Correo (dev)** | Mailpit ya corriendo en el entorno (`localhost:8025` UI, `localhost:1025` SMTP) — contenedor `magic-link-mailpit` |
| **Correo (prod)** | Resend API |
| **Login admin** | Magic Link con código de 6 dígitos, sesión JWT. En dev, el correo se sirve vía Mailpit. Acceso en `/admin` |
| **Almacenamiento de archivos** | Disco local del servidor Next.js (PDFs de artículos, thumbnails). Migrable a S3/RustFS en el futuro; no se implementa RustFS en este MVP |
| **Estilos** | Tailwind CSS con tokens en espacio **OKLCH** |
| **Componentes UI** | Radix UI / Shadcn UI + Framer Motion |
| **i18n** | Soporte nativo ES (default) / EN, cliente y servidor |
| **Testing unitario/integración** | Vitest, con **reporte HTML** |
| **Testing E2E** | Playwright, con **reporte HTML** |
| **Pruebas de carga** | k6 — medir (a) máximo de usuarios concurrentes instantáneos soportados y (b) máximo de usuarios sostenidos durante 15 minutos sin degradación |
| **Análisis de seguridad estático (SAST)** | Semgrep, con **reporte HTML** |
| **Observabilidad / Logs** | Pino, formato **JSON estructurado**, con archivo de log físico persistente |
| **Vault, Traefik+SSL, SonarQube, Elasticsearch/Kibana** | **No se implementan en este MVP.** Se documentan como referencia activable a futuro (`docker-compose.yml` de referencia + menciones en `INFRA.md`/`CERTIFICADOS.md`), conforme a la garantía agnóstica de `toscaprompt` |
| **Rate limiting / Circuit breaker** | Implementados en el backend Next.js (Route Handlers), documentados en `INFRA.md` |
| **Middleware** | Prohibido `middleware.ts`; usar patrón de proxy/handlers explícitos en su lugar |
| **Money** | N/A — este proyecto no maneja pagos ni Stripe (regla de exclusión de tecnologías de toscaprompt: no se documenta lo que no aplica) |

### 1.1 Pendientes bloqueantes antes de iniciar Fase 1

- [x] **Credenciales válidas de MongoDB Atlas.** Corregidas y validadas: conexión, autenticación y permisos de lectura/escritura confirmados contra el cluster `cluster-economy`. La base `economy-and-fair-competition-db` se crea en Fase 0 al ejecutar la primera seed.
- [ ] Confirmar dominio real de producción y credenciales de Resend (API key) cuando se aborde la Fase 6 (Contacto y Magic Link en producción).
- [ ] Confirmar número(s) de WhatsApp Business / proveedor (ej. Meta Cloud API, Twilio) para el servidor MCP de la Fase 7, si no se ha decidido aún.

---

## 2. Dirección de diseño (frontend-design + impeccable)

### 2.1 Brief interpretado

Firma legal internacional de alto prestigio en comercio exterior, aduanas y propiedad intelectual. El registro visual debe transmitir: **autoridad institucional, precisión técnica, calidez profesional** (no frialdad corporativa genérica) y **peso internacional** (OMC, TLCAN, T-MEC). Modo: **Persuade** en Home/Servicios/Contacto (el visitante decide contactar a la firma), **Read** en Artículos y Notas, **Operate** en el panel admin.

### 2.2 Sistema de tokens (fijado por el usuario en PROMPT.md — no renegociable)

**Color (OKLCH):**
| Token | Uso | Valor |
|---|---|---|
| `--color-bg` | Fondo base | Crema/Marfil — `oklch(0.98 0.01 85)` (~#FAF9F6) |
| `--color-accent` | Acentos, CTAs secundarios, hover | Azul Cielo/Cobalto tenue — `oklch(0.70 0.12 230)` (~#38BDF8) |
| `--color-ink` | Texto principal, contraste, fondos oscuros | Azul Marino Profundo/Noche — `oklch(0.22 0.04 250)` (~#0F172A) |

A completar en Fase 1 (no inventar antes de codificar, derivar matemáticamente en OKLCH desde estos tres anclas):
- `--color-ink-soft` (variante de texto secundario sobre crema, ~L 0.45)
- `--color-accent-deep` (cobalto saturado para CTA primario, ~L 0.55 mismo hue 230)
- `--color-surface` (blanco puro o casi, para tarjetas sobre crema)
- `--color-border` (línea sutil, derivada de ink a baja opacidad/alta luminosidad)

**Tipografía:**
- Display (encabezados, hero, títulos de sección): Serif moderna de exhibición — **Instrument Serif** o **Playfair Display**. Uso restringido: tamaños grandes, peso variable, tracking ajustado. Decisión final y justificación en Fase 1 tras probar ambas con el contenido real.
- Cuerpo/UI: Sans-serif técnica — candidata: **Inter** o **IBM Plex Sans** (buena legibilidad en textos legales largos, soporte de números tabulares para datos).
- Utilitaria (captions, metadatos de artículos, fechas): la misma sans en peso/tamaño reducido, con tracking amplio para eyebrows.

**Retícula y movimiento:**
- Sistema de espaciado en múltiplos de 8px, sin excepciones.
- Animaciones fluidas, **sin rebotes** (easing tipo `ease-out`/`cubic-bezier` custom, nunca `spring` con overshoot). Respetar `prefers-reduced-motion`.
- Border-radius: a definir en Fase 1 como parte del signature element (candidato: esquinas suaves pero no pill-shaped, coherente con el peso institucional).

### 2.3 Elemento de firma (a resolver y confirmar en Fase 1)

Candidatos a evaluar contra el brief antes de construir (no elegir el default genérico "hero con gradiente y stat grande"):
1. **Mapa de rutas comerciales / fronteras** como motivo visual recurrente (línea fina animada tipo trade route, conectando puntos OMC/TLCAN/T-MEC) — coherente con "comercio exterior" y con el mapa de contacto.
2. **Sello/sceau institucional reinterpretado** (marca de agua geométrica sutil basada en un sello aduanero, sin caer en cliché de balanza de la justicia).
3. **Tipografía como arquitectura**: números de artículo/sección de tratado (Art. XIX, Cap. 10) como motivo tipográfico recurrente en headers de sección, aprovechando que la firma realmente cita capítulos de tratados (esto es información real del contenido, no decoración inventada).

Decisión final se toma y documenta en Fase 1 antes de tocar código de producción, con captura de pantalla de validación.

### 2.4 Restricciones de escritura (UX copy)

- Todo texto institucional se redacta en voz de la firma, nunca de un individuo ("nuestro equipo", "la firma", jamás "yo" ni nombres propios).
- CTAs en voz activa y específica ("Agende una consulta", no "Enviar").
- Mensajes de error explican qué ocurrió y cómo resolverlo, sin tono de disculpa informal.
- Ningún dato inventado: cifras, casos o clientes no mencionados en `URUCHURTU.md`/`ECONOMY-AND-FAIR-COMPETITION.md` no se fabrican.

---

## 3. Arquitectura técnica

### 3.1 Stack

```
Next.js 16 (App Router) + TypeScript
├── Tailwind CSS (tokens OKLCH)
├── Radix UI / Shadcn UI (Dialogs, Drawer, Toast)
├── Framer Motion (carrusel, reveals, transiciones)
├── next-intl o solución i18n nativa App Router (ES/EN)
├── MongoDB Atlas + driver nativo `mongodb` (NUNCA mongoose salvo decisión explícita)
├── Pino (logs JSON) + rotación a archivo físico
├── Resend (prod) / Mailpit SMTP (dev) para correo
├── JWT (jose o jsonwebtoken) para sesión admin
└── Zod para validación de esquemas (API + formularios)
```

### 3.2 Reglas de código obligatorias (toscaprompt § Coding rules)

1. Leer documentación oficial antes de integrar cualquier API externa (Resend, MongoDB Atlas, Radix, MCP).
2. Todo acceso a datos pasa por el singleton `lib/db.ts`. Prohibidas las conexiones inline.
3. No aplica manejo de dinero (sin Stripe en este proyecto).
4. Rutas API devuelven `{ error: string }` estandarizado + código HTTP correcto. Documentar bajo OpenAPI/Swagger UI (`/api/docs` o archivo `openapi.yaml`).
5. Prohibido `any` en TypeScript. ESLint obligatorio y en verde antes de cerrar cada fase.
6. Prohibido texto hardcodeado de cara al usuario — todo pasa por el sistema i18n (ES/EN), incluyendo mensajes de error de API.
7. Criptografía y tokens: solo `node:crypto` / librerías JWT estándar auditadas. Nunca hashing casero.
8. Server Components obtienen datos directo de `lib/db.ts`; Client Components llaman a rutas `/api/*`.
9. Toda página/componente nuevo pasa por la skill `frontend-design` — cero HTML sin estilo intencional.
10. Secretos en `.env` local + `.env.example` documentado. Vault queda documentado pero no activo (ver §1).
11. Logging estructurado con Pino JSON, con archivo físico en `logs/app.log` (rotación diaria simple).
12. Resiliencia mínima nativa:
    - **Rate limiting** por IP en rutas sensibles (`/api/contact`, `/api/auth/*`, `/api/mcp/*`) implementado en el propio Route Handler de Next.js (in-memory store con ventana deslizante para MVP; documentar upgrade a Redis si el tráfico lo exige).
    - **Circuit breaker** alrededor de llamadas externas críticas (Resend, futura integración MCP/WhatsApp): si N fallos consecutivos, el circuito se abre y cae a fallback controlado (ej. cola local / reintento diferido), documentado en `INFRA.md` con ubicación exacta en código.
13. Errores de cliente: Toast/Modal minimalista con código de error, botón "Ver detalle técnico" y cierre explícito.

### 3.3 Estructura de carpetas propuesta

```
economy-and-fair-competition/
├── AGENTS.md
├── HISTORY.md
├── QUICK-START.md
├── SPECIFICATION-SUMMARY.md
├── INFRA.md
├── OBSERVABILIDAD.md
├── CERTIFICADOS.md
├── DEPLOYMENT.md
├── DIAGRAMAS.md
├── RETROSPECTIVA.md
├── MEJORAS.md
├── README.md
├── docker-compose.yml          # referencia completa (Mongo local opcional, Mailpit, Vault, Traefik, ELK, SonarQube) aunque Atlas/Mailpit-compartido/disco-local sean lo activo
├── .env.example
├── PRODUCT.md                  # generado por impeccable (init)
├── DESIGN.md                   # generado por impeccable (new-work), tokens OKLCH confirmados
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Home
│   │   ├── quienes-somos/page.tsx
│   │   ├── servicios/page.tsx
│   │   ├── industrias/page.tsx
│   │   ├── articulos-y-notas/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── contacto/page.tsx
│   │   └── admin/
│   │       ├── login/page.tsx
│   │       ├── posts/page.tsx
│   │       └── page.tsx                # dashboard
│   └── api/
│       ├── contact/route.ts
│       ├── auth/
│       │   ├── request-code/route.ts
│       │   └── verify-code/route.ts
│       ├── posts/route.ts
│       ├── posts/[id]/route.ts
│       ├── content/site-texts/route.ts
│       └── mcp/route.ts
├── components/
│   ├── ui/                     # shadcn primitives
│   ├── admin/                  # drawer, editor inline, toolbar ES/EN
│   ├── marketing/               # hero, servicios grid, modales de especialización, carrusel industrias
│   └── shared/
├── lib/
│   ├── db.ts                   # singleton MongoDB
│   ├── auth.ts                 # JWT + magic link
│   ├── mailer.ts                # Resend/Mailpit switch por NODE_ENV
│   ├── logger.ts                # Pino
│   ├── rate-limit.ts
│   ├── circuit-breaker.ts
│   └── i18n.ts
├── context/
│   └── GlobalContext.tsx        # estado global (usuario admin, idioma, preferencias)
├── content/
│   └── seeds/                   # copy ES/EN fuente, derivado de URUCHURTU.md + reglas de despersonalización
├── scripts/
│   ├── seed-schema.ts
│   ├── seed-config.ts
│   └── seed-data.ts
├── tests/
│   ├── unit/                    # Vitest
│   ├── e2e/                     # Playwright
│   └── load/                    # k6
├── postman/
│   ├── economy-fair-competition.postman_collection.json
│   └── economy-fair-competition.postman_environment.json
└── logs/
    └── app.log
```

### 3.4 Base de datos — colecciones MongoDB

| Colección | Propósito |
|---|---|
| `site_texts` | Textos bilingües editables de la landing (clave, `es`, `en`, `updatedAt`, `updatedBy`) |
| `posts` | Artículos y Notas (título, slug, resumen, categoría, thumbnail, pdfUrl, externalUrl, bodyEs, bodyEn, publishedAt, status) |
| `admin_users` | Administradores autorizados (teléfono/email, rol) — sin exponer en frontend |
| `auth_codes` | Códigos de 6 dígitos de magic link (hash, expiración, intentos) |
| `contact_submissions` | Registro de envíos del formulario de contacto (auditoría, no marketing) |
| `circuit_breaker_state` | Persistencia temporal de estado CLOSED/OPEN por servicio externo |
| `rate_limit_events` (opcional si no in-memory) | Ventanas de rate limiting si se decide persistir en vez de memoria |

### 3.5 Seeds obligatorias (regla toscaprompt)

1. **Semilla de Esquema**: crea las colecciones anteriores con validación JSON Schema de MongoDB (`db.createCollection` con `validator`).
2. **Semilla de Configuración**: `site_texts` inicial con todas las claves ES/EN extraídas y adaptadas de `URUCHURTU.md`/`ECONOMY-AND-FAIR-COMPETITION.md` (Misión, Visión, Valores, textos de secciones, los 10 servicios, las 4 áreas, las industrias, textos de contacto), más parámetros de negocio (idiomas soportados, roles admin).
3. **Semilla de Datos**: 6–10 posts de ejemplo en `posts` (mock realista: títulos plausibles sobre comercio exterior/aduanas/PI, sin inventar hechos falsos como reales — marcados claramente como contenido de prueba en entorno dev).

---

## 4. Mapa de contenido (derivado de URUCHURTU.md + reglas de despersonalización)

| Sección Uruchurtu (origen) | Sección Economy (destino) | Transformación aplicada |
|---|---|---|
| Quiénes Somos | `/quienes-somos` + resumen en Home | Reescrito en voz institucional, +28 años, mismo mensaje OMC/TLCAN/T-MEC |
| Nuestra Historia | `/quienes-somos` | Se conserva la narrativa de fundación como firma, sin nombre de fundador individual |
| Nuestra Misión | Home + `/quienes-somos` | Versión mejorada ya redactada en PROMPT.md |
| Nuestra Visión | Home + `/quienes-somos` | Versión mejorada ya redactada en PROMPT.md |
| Nuestros Valores (8) | Grid de tarjetas interactivas | Se conservan los 8 valores tal cual (Integridad, Responsabilidad, Experiencia, Excelencia, Compromiso, Calidad, Profesionalismo, Respuesta Proactiva) |
| Nuestro Equipo (3 perfiles con nombre) | "Nuestro Equipo" institucional, sin nombres | Se sustituye por descripción agregada de capacidades del equipo |
| Áreas de Práctica (Comercio Internacional, PI) | `/servicios` o sección propia | Texto ampliado con base en experiencia agregada del equipo |
| Nuestros Servicios (10 listados) | Módulo interactivo Home + `/servicios` | Se conservan y mapean 1:1 a los 10 servicios ya redactados en PROMPT.md §3 |
| Industrias que Atendemos (10, incluye Aeroespacial) | Carrusel de Industrias | Se quita Aeroespacial, se agrega Marítimo → 10 industrias finales |
| Artículos y Publicaciones | "Artículos y Notas" | Renombrado, mismo propósito, ahora con backend real (posts) |
| Nuestra Garantía | Home | Se conserva el mensaje de garantía institucional |
| Forma de Contacto | `/contacto` | Formulario ampliado (Nombre, Empresa, Correo, Teléfono, Área de Interés, Mensaje) + Resend |
| Perfiles individuales (Gustavo, César, Héctor) | Eliminados como páginas de persona | Su "Experiencia Profesional" y "Áreas de Especialización" se funden en: (a) los 10 servicios, (b) las 4 áreas de especialización global, (c) copy de "Quiénes Somos" |
| — (nuevo) | 4ª Área: Consultoría Financiera y Regulación Bancaria | Generada institucionalmente a partir del perfil de Héctor García López, sin atribución personal |

### 4.1 Las 10 industrias finales

Automotriz, Energía, Minería, Textil, Electrónica, Farmacéutica, Manufactura, Alimentos, Logística y Transporte, **Marítimo** (Aeroespacial excluida).

### 4.2 Las 4 áreas de especialización global

A) Comercio Exterior, Aduanas y Cumplimiento Transfronterizo
B) Defensa Comercial, Antidumping y Prácticas Desleales
C) Propiedad Intelectual e Industrial
D) Consultoría Financiera y Regulación Bancaria

---

## 5. Fases del proyecto

Cada fase termina con una **checklist de validación** que debe quedar marcada en `HISTORY.md` (con fecha) antes de iniciar la siguiente. Ninguna fase de código empieza sin que la Fase 0 esté cerrada.

### **Fase 0 — Gobernanza, infraestructura y arranque**
**Objetivo:** dejar el proyecto listo para codificar con cero ambigüedad de infraestructura.

- [ ] Resolver credenciales MongoDB Atlas y validar conexión real (script de prueba ya usado en scratchpad, repetir contra credenciales corregidas).
- [ ] Crear base `economy-and-fair-competition-db` si no existe.
- [ ] Inicializar proyecto Next.js 16 + TypeScript + npm.
- [ ] Configurar Tailwind CSS, ESLint, Prettier (o el linter que fije ESLint), tsconfig estricto (`strict: true`, sin `any`).
- [ ] Crear `.env.example` y `.env` local con todas las variables (ver §6).
- [ ] Configurar `lib/db.ts`, `lib/logger.ts` (Pino JSON + archivo físico `logs/app.log`).
- [ ] Ejecutar `impeccable init` → generar `PRODUCT.md`. Ejecutar `impeccable new-work`/flujo de diseño → generar `DESIGN.md` con los tokens OKLCH confirmados y el elemento de firma elegido (§2.3).
- [ ] Crear `docker-compose.yml` de referencia (Mongo local opcional, Mailpit —ya activo compartido—, Vault, Traefik, SonarQube, Elasticsearch+Kibana) aunque no se levanten todos.
- [ ] Redactar `CERTIFICADOS.md`, `INFRA.md`, `OBSERVABILIDAD.md`, `QUICK-START.md`, `SPECIFICATION-SUMMARY.md`, `DEPLOYMENT.md`, `DIAGRAMAS.md`, `RETROSPECTIVA.md`, `MEJORAS.md`, `README.md` (esqueletos con secciones obligatorias, se completan progresivamente en cada fase).
- [ ] `HISTORY.md` creado y con entrada inicial.

**Validación de salida:** `npm run dev` levanta sin errores; conexión a Mongo Atlas confirmada con script de humo; `npm run lint` en verde.

---

### **Fase 1 — Sistema de diseño y fundaciones visuales**
**Objetivo:** fijar el lenguaje visual antes de construir páginas reales (frontend-design: brainstorm → crítica → build).

- [ ] Confirmar/derivar tokens OKLCH completos (§2.2) en `DESIGN.md` y `tailwind.config`.
- [ ] Decidir tipografía display definitiva (Instrument Serif vs Playfair Display) probada contra el copy real de Home.
- [ ] Resolver y documentar el elemento de firma (§2.3) con justificación escrita.
- [ ] Construir librería base de componentes UI (botones, cards, badges, inputs, modal/dialog, drawer) sobre Radix/Shadcn con los tokens aplicados.
- [ ] Layout base: `app/[locale]/layout.tsx` con header, footer, navegación, selector de idioma.
- [ ] Configurar i18n (rutas `[locale]`, diccionarios ES/EN base de navegación/footer/errores comunes).
- [ ] Capturas de pantalla desktop + mobile de los componentes base para autocrítica (impeccable hook corre automáticamente tras cada edición UI).

**Validación de salida:** Storybook-like page o ruta `/design-preview` (dev-only) mostrando todos los componentes base; `node .claude/skills/impeccable/scripts/detect.mjs --json` sin hallazgos críticos.

---

### **Fase 2 — Home institucional**
- [ ] Hero (thesis-driven, no template genérico) con el elemento de firma integrado.
- [ ] Resumen Quiénes Somos + Misión/Visión.
- [ ] Grid de Valores (8 tarjetas interactivas).
- [ ] Módulo de 10 Servicios (cards con íconos conceptuales, sin imágenes fotográficas — coherente con guía de "no imágenes, iconos por categoría" salvo que el usuario apruebe fotografía real para esta firma).
- [ ] Grid interactivo de las 4 Áreas de Especialización Global con modales de detalle.
- [ ] Carrusel de Industrias (10, con Marítimo) con Framer Motion, cada una con modal de retos/soluciones.
- [ ] Sección Nuestra Garantía.
- [ ] CTA final hacia Contacto.
- [ ] Contenido cargado desde `site_texts` (no hardcodeado) vía Server Components.

**Validación de salida:** Home responsive (mobile→desktop), Lighthouse a11y ≥ 95, sin texto hardcodeado (grep de strings ES sueltos fuera de diccionarios/`site_texts`), captura desktop+mobile revisada.

---

### **Fase 3 — Páginas institucionales secundarias**
- [ ] `/quienes-somos`: Historia, Misión, Visión, Valores (versión extendida), Experiencia Global e Internacional (OMC/TLCAN/T-MEC), Nuestra Especialización, Participación en Negociaciones Comerciales — todo despersonalizado.
- [ ] `/servicios`: los 10 servicios con detalle ampliado.
- [ ] `/industrias`: si se decide página propia además del carrusel de Home (evaluar en Fase 1/2 si el carrusel de Home basta o se requiere listado completo).
- [ ] Navegación y breadcrumbs coherentes en ambos idiomas.

**Validación de salida:** paridad de contenido ES/EN verificada campo a campo; enlaces internos sin 404.

---

### **Fase 4 — Artículos y Notas (frontend de lectura)**
- [ ] Listado con feed: thumbnail, título, fecha, categoría.
- [ ] Modal/página de detalle con resumen ejecutivo estructurado.
- [ ] Botón "Descargar PDF Oficial" (condicional a `pdfUrl`).
- [ ] Botón "Leer Artículo Completo" (condicional a `externalUrl`).
- [ ] Paginación/filtro por categoría.
- [ ] Datos servidos desde `posts` (Server Component + `lib/db.ts`).

**Validación de salida:** flujo completo de lectura probado con datos de seed; estado vacío (sin publicaciones) diseñado, no solo un placeholder gris.

---

### **Fase 5 — Backend Admin: autenticación y edición en vivo bilingüe**
- [ ] Magic Link con código de 6 dígitos: `/api/auth/request-code`, `/api/auth/verify-code`, sesión JWT en cookie httpOnly.
- [ ] En dev: envío de correo vía Mailpit (SMTP `localhost:1025`), verificable en UI `localhost:8025`.
- [ ] `/admin/login` (o modal desde footer) con rate limiting aplicado.
- [ ] Modo Admin: toolbar con interruptor ES/EN y controles de edición inline sobre los textos de la landing.
- [ ] Botón "Asistente de Redacción IA" (reescribir/traducir/perfeccionar párrafo) — definir en esta fase si usa API de Anthropic u otro proveedor, y documentarlo.
- [ ] Drawer lateral de gestión: buscar, agregar, modificar, eliminar posts y textos globales.
- [ ] `/api/content/site-texts` (GET público, PUT protegido).
- [ ] `GlobalContext` para sesión admin/idioma (evitar prop drilling).

**Validación de salida:** flujo E2E de login completo (Playwright) contra Mailpit real; edición de un texto se refleja inmediatamente en la landing pública; intento de acceso sin sesión a rutas protegidas rechazado con 401 estandarizado.

---

### **Fase 6 — Contacto, formularios y correo**
- [ ] `/contacto`: formulario (Nombre, Empresa, Correo, Teléfono, Área de Interés, Mensaje) con validación Zod cliente+servidor.
- [ ] `/api/contact` Route Handler: Resend en producción, Mailpit en dev, rate limiting, circuit breaker hacia Resend.
- [ ] Registro de envíos en `contact_submissions`.
- [ ] Datos directos de atención (teléfonos, `contacto@economyandfaircompetition.com`, horarios) desde `site_texts`.
- [ ] Google Maps interactivo estilizado con paleta crema/cobalto de la firma.

**Validación de salida:** correo de prueba visible en Mailpit tras submit en dev; manejo de error de envío mostrando Toast con detalle técnico expandible.

---

### **Fase 7 — Backend de Posts, API pública y servidor MCP + WhatsApp**
- [ ] `/api/posts` (GET público, POST protegido), `/api/posts/[id]` (GET/PUT/DELETE protegidos).
- [ ] Documentación OpenAPI/Swagger de todas las rutas.
- [ ] `/api/mcp/route`: endpoint receptor de llamadas MCP.
- [ ] Herramientas MCP: `list_posts`, `get_post_detail`, `create_post_from_media`, `update_post`, `delete_post` — validación JWT/teléfono de administrador en las mutaciones.
- [ ] `create_post_from_media`: procesamiento de texto, imágenes (thumbnail), PDF (guardado en disco local por decisión §1) o enlaces externos.
- [ ] Definir y confirmar con el usuario el proveedor de WhatsApp Business antes de integrar (bloqueante puntual de esta fase, no de todo el proyecto).
- [ ] Circuit breaker sobre la integración WhatsApp/proveedor MCP externo.

**Validación de salida:** colección Postman con todos los endpoints (incluye MCP) y tests de esquema/HTTP en verde; flujo simulado de creación de post vía payload tipo WhatsApp probado localmente.

---

### **Fase 8 — Calidad: pruebas automatizadas** — ✅ CERRADA (2026-08-01)
- [x] **Vitest**: 35/35 unitarias en verde (`lib/*.ts`, validadores Zod, rate-limit/circuit-breaker, bloques, Markdown). Reporte HTML en `tests/reports/vitest/`.
- [x] **Playwright**: 16/16 E2E en verde — navegación pública ES/EN, login magic link, edición inline admin, plantillas+posts con gráfica, drawer de gestión. Reporte HTML en `tests/reports/playwright/`.
- [x] **k6**: ambos escenarios ejecutados contra un build de producción real (`next start`, no `next dev`) —
  - Escenario A (pico instantáneo, 0→500 VUs): 1197 requests, 0% error HTTP, p95 20.6s.
  - Escenario B (sostenido 15 min, 500 VUs constantes): 41,496 requests, 0% error de negocio, 100% checks en verde, p95 22.0s estable sin degradación creciente.
  - Resultados completos con hardware de referencia en `INFRA.md` §Capacidad.
- [x] Postman + Newman: 29 requests / 75 assertions en verde vía CLI (`npm run test:api`), UUID de environment válido (`755ba005-b877-4dcb-9215-57c9f7a4d36a`). Solo environment local (Mailpit) — el de producción (Resend) requiere credenciales reales de despliegue, documentado como pendiente de esa fase.

**Validación de salida:** los tres reportes HTML (Vitest, Playwright, Postman) generados y revisados; resultados de k6 documentados con números concretos en `INFRA.md`.

---

### **Fase 9 — Seguridad** — ✅ CERRADA (2026-08-01)
- [x] **Semgrep**: análisis SAST del código (vía Docker, ya que no hay Python/pip ni paquete npm oficial), reporte JSON+HTML en `tests/reports/semgrep/`; 4 hallazgos — 1 real (GCM sin `authTagLength`, corregido) + 3 falsos positivos esperados (secretos de dev en `.env`/JWT de test, ambos en `.gitignore`), todos documentados en `RETROSPECTIVA.md`.
- [x] Revisión manual de OWASP Top 10 aplicable — 2 hallazgos Altos reales corregidos (límite de tamaño en subida de documentos, validación de magic bytes reales vs. `Content-Type` falsificable), 1 hallazgo Medio documentado (dependencia de proxy confiable para `X-Forwarded-For`), resto confirmado correcto sin cambios.
- [x] Confirmado que ningún secreto está commiteado — el proyecto no tiene repositorio git inicializado todavía; `.env` y las credenciales de test ya están en `.gitignore`.
- [x] Rate limiting y circuit breaker verificados con pruebas dirigidas — comportamiento observado extensamente en Fase 8 (k6: 500 VUs con 0% de error HTTP, rate limiter de MCP interceptando el 91.7% de tráfico excesivo tal como está diseñado) y en Fase 9 (circuit breaker de generación de imágenes forzado a `OPEN` en Mongo para confirmar el fallback 503 controlado).

**Validación de salida:** reporte Semgrep JSON+HTML con el único hallazgo real resuelto (los 3 restantes son falsos positivos documentados); checklist OWASP documentado en `RETROSPECTIVA.md` §Fase 9.

---

### **Fase 10 — Pulido final (impeccable: polish + audit)** — ✅ CERRADA (2026-08-01)
- [x] `/impeccable audit` sobre el sitio completo (a11y, performance, responsive) — score 19/20; 4 hallazgos reales de accesibilidad corregidos (contraste `accent-deep`/`ink-faint`/`accent-soft` bajo WCAG AA en `tailwind.config.ts`, estructura `<dl>`/`<dt>`/`<dd>` inválida en Contacto).
- [x] `/impeccable polish` como pase final de calidad visual — sin hallazgos de diseño nuevos; corregido un daño de datos accidental introducido por los propios scripts de verificación de la sesión (título/resumen de un item de Especialización sobreescritos por un clic con sesión admin activa), restaurado desde la seed original.
- [x] Verificación de `prefers-reduced-motion` (correcto: reduce a 0.01ms preservando estado final), foco de teclado visible (anillo 2px confirmado con Playwright), contraste AA/AAA en textos legales largos (`ink` 16.96:1, `ink-soft` 7.05:1).
- [x] Revisión de paridad ES/EN final — 0 claves de traducción faltantes en ningún sentido.
- [x] Un solo batch de capturas desktop+mobile, defectos corregidos en un solo lote, máximo una ronda adicional de confirmación (regla del skill impeccable: no loop abierto de auto-QA).

**Validación de salida:** checklist de audit sin hallazgos críticos; capturas finales y detalle completo en `HISTORY.md` (entradas del 2026-08-01).

---

### **Fase 11 — Documentación final y entrega**
- [ ] Completar `README.md` con credenciales de administración por defecto de la infraestructura externa (Mailpit, Mongo si aplica) para pruebas rápidas.
- [ ] Completar `DEPLOYMENT.md` con pasos reales de despliegue a producción (incluye variables de entorno de producción, Resend, dominio).
- [ ] Completar `DIAGRAMAS.md` (clases, máquina de estados de magic-link/circuit-breaker, secuencia de creación de post vía MCP, modelo de persistencia Mongo).
- [ ] `MEJORAS.md` con backlog de mejoras futuras (ej. activar Vault/Traefik/ELK/SonarQube si el tráfico o el cliente lo requieren).
- [ ] `RETROSPECTIVA.md` cerrada con registro completo de errores y soluciones de todas las fases.

**Validación de salida:** revisión final cruzada de que todos los `.md` obligatorios de toscaprompt existen y están completos.

---

## 6. Variables de entorno (`.env.example`)

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster-economy.mbwszze.mongodb.net/?retryWrites=true&w=majority&appName=cluster-economy
MONGODB_DB=economy-and-fair-competition-db

# Correo
NODE_ENV=development
MAILPIT_HOST=localhost
MAILPIT_PORT=1025
RESEND_API_KEY=<solo produccion>
CONTACT_NOTIFICATION_EMAIL=contacto@economyandfaircompetition.com

# Autenticación
JWT_SECRET=<generar con node:crypto>
MAGIC_LINK_CODE_TTL_MINUTES=10
ADMIN_ALLOWED_EMAILS=<lista separada por comas>

# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=es
NEXT_PUBLIC_LOCALES=es,en

# Logging
PINO_LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Almacenamiento (disco local)
UPLOADS_DIR=./public/uploads

# MCP / WhatsApp (a confirmar en Fase 7)
MCP_WEBHOOK_SECRET=<pendiente>
WHATSAPP_PROVIDER=<pendiente>

# Referencia (no activo en MVP, documentado para futuro)
VAULT_ADDR=http://127.0.0.1:8200
VAULT_TOKEN=root
VAULT_SECRET_PATH=economy-fair-competition
TRAEFIK_DASHBOARD_PORT=8080
TRAEFIK_ACME_EMAIL=admin@economyandfaircompetition.com
ELASTICSEARCH_URL=http://localhost:9200
KIBANA_URL=http://localhost:5601
```

---

## 7. Reglas de contenido — no negociables

1. **Cero nombres propios de abogados** en cualquier página o texto público de Economy and Fair Competition.
2. Toda cifra de años de experiencia, participación en OMC/TLCAN/T-MEC y logros institucionales debe rastrearse a una afirmación existente en `URUCHURTU.md` o `ECONOMY-AND-FAIR-COMPETITION.md` — no se inventan nuevas cifras ni casos.
3. Los 10 servicios y las 4 áreas de especialización global son fijos según PROMPT.md; no se agregan ni quitan sin aprobación explícita del usuario.
4. Industrias finales: exactamente las 10 listadas en §4.1 (Marítimo dentro, Aeroespacial fuera).
5. Todo copy nuevo (no derivado directamente de las fuentes) debe marcarse explícitamente como redactado por el equipo de diseño y aprobarse antes de publicarse como definitivo — no se inventan testimonios, clientes o casos de estudio.

---

## 8. Artefactos de gobernanza a mantener (obligatorios por toscaprompt)

- `HISTORY.md` — bitácora de fases/checkpoints (crear en Fase 0, actualizar en cada sesión de trabajo).
- `QUICK-START.md`, `SPECIFICATION-SUMMARY.md`, `INFRA.md`, `OBSERVABILIDAD.md`, `CERTIFICADOS.md`, `DEPLOYMENT.md`, `DIAGRAMAS.md`, `RETROSPECTIVA.md`, `MEJORAS.md`, `README.md` — ver §3.3 y contenido esperado de cada uno según la definición de `toscaprompt`.
- `PRODUCT.md` y `DESIGN.md` — generados por la skill `impeccable` (Fase 0/1).

---

## 9. Próximo paso inmediato

1. ~~Usuario resuelve y entrega credenciales válidas de MongoDB Atlas.~~ **Completado** — conexión validada (auth + lectura/escritura confirmadas contra `cluster-economy`).
2. Iniciar formalmente la **Fase 0**: scaffold del proyecto Next.js 16, configuración base, y creación de `HISTORY.md`.
3. No se escribe código de producción de páginas/features antes de cerrar Fase 0 y Fase 1 (fundaciones + sistema de diseño).

---

## 10. Fase 7 (revisada) — Sistema de plantillas, bloques y filtros de Artículos y Notas

Redefinida a partir de feedback del usuario tras revisar la Fase 4 original (posts como texto simple). Reemplaza el modelo de datos de `posts` descrito en §3.4 para el campo de contenido.

### 10.1 Tipo de contenido: Artículo vs Nota

- `postType`: `"articulo" | "nota"` — campo obligatorio, distinto de `category`.
- Artículo = análisis extenso/editorial. Nota = aviso breve/actualización puntual. Ambos pueden usar cualquier plantilla (una Nota puede ser visualmente compleja si el admin lo decide), pero por defecto las plantillas más simples se sugieren para Notas.
- `category`: taxonomía temática fija (no texto libre) compartida entre Artículos y Notas — ej. Comercio Exterior, Defensa Comercial, Cumplimiento Aduanero, Propiedad Intelectual, Litigio Internacional (misma lista ya usada en `content/seeds/posts.ts`, formalizada como enum).
- `tags`: etiquetas libres adicionales, muchos-a-uno con posts, también filtrables.

### 10.2 Plantillas (`templates`) y bloques

Una plantilla es una **secuencia ordenada de bloques** reutilizable. Es la misma estructura para ES/EN — solo el contenido de cada bloque varía por idioma, nunca la plantilla en sí.

Tipos de bloque en el MVP de este sistema:
1. **Hero**: título de impacto + imagen de alto impacto visual.
2. **Texto enriquecido (Markdown)**: subtítulos (H2/H3), listas, negrita/itálica, párrafos. El admin escribe libremente; el sistema detecta si ya es Markdown válido o, si no, ofrece convertirlo automáticamente vía asistente IA (Claude) antes de guardar. Incluye vista previa renderizada.
3. **Dos columnas (texto + imagen)**: columna izquierda de texto Markdown, columna derecha con imagen.
4. **Tabla de datos → gráfica automática**: el admin captura una tabla numérica simple (categoría/etiqueta + valor(es)); el sistema genera automáticamente una gráfica (barras, líneas o pastel/dona, a elección del admin por bloque) a partir de esos datos, mostrada junto a o en vez de la tabla.

Cada bloque de texto (`hero`, `richtext`, `twoColumn`) almacena su contenido en **Markdown**, nunca HTML crudo ni JSON de editor propietario — decisión explícita para que el mismo contenido sea legible/editable por humanos, por el MCP de WhatsApp, y fácil de generar por IA a partir de un PDF o URL.

### 10.3 Editor de plantillas (admin, solo desde computadora — no vía MCP/WhatsApp)

- Ruta admin dedicada para crear/editar plantillas: definir el nombre, y la secuencia de bloques (agregar/quitar/reordenar tipos de bloque).
- Una plantilla no lleva contenido — es solo el esqueleto de bloques. El contenido se llena al crear un Artículo/Nota concreto que la usa.
- El editor de contenido dentro de cada bloque de texto: auto-detecta Markdown; si el texto pegado no parece Markdown, ofrece "Convertir con IA" (Claude) para reestructurarlo automáticamente, con vista previa antes de aceptar.

### 10.4 Creación de un Artículo/Nota (flujo admin)

1. El admin elige una plantilla existente.
2. Llena cada bloque de esa plantilla (texto Markdown, imágenes, tabla de datos según corresponda).
3. Asigna: tipo (Artículo/Nota), categoría (de la lista fija), tags libres, fecha de publicación.
4. Alternativa: si el admin solo provee un **PDF o una URL** en vez de llenar bloques manualmente, el sistema extrae el contenido clave del PDF/página HTML y genera automáticamente el bloque de texto en Markdown vía IA, dejando en el post una referencia visible al PDF/URL de origen usado.

### 10.5 MCP / WhatsApp — alcance del `templateId`

El editor de plantillas **no está disponible vía MCP/WhatsApp** (solo desde el panel admin en computadora). El servidor MCP sí puede:
- Listar las plantillas existentes (`list_templates` o extensión de `list_posts`) para que el usuario de WhatsApp elija un `templateId` antes de crear contenido.
- Recibir en `create_post_from_media`: `templateId` + imágenes + (texto Markdown directo, o un PDF, o una URL). Si se manda PDF/URL, el servidor ejecuta la misma extracción-a-Markdown vía IA que el flujo admin, y referencia la fuente en el post resultante.

### 10.6 Filtros, búsqueda y paginación en `/articulos-y-notas`

- Filtro por tipo: checkboxes independientes "Artículos" y "Notas" (ambos activables a la vez = sin filtro de tipo).
- Filtro por categoría (de la lista fija) y por tags.
- Búsqueda de texto libre con checkbox para ampliar el alcance: por título (default) y, si se activa, también por contenido de los bloques de texto.
- Filtro por rango de fechas: fecha de inicio **obligatoria** una vez que el filtro de fecha se usa, fecha de fin **opcional**; si se especifica fin, debe ser ≥ inicio (validado en cliente y servidor).
- Resultados en grilla con **paginación numérica** (no carrusel, no "cargar más") — decisión explícita: un carrusel no combina bien con filtros/búsqueda activa, y la paginación numérica permite compartir/guardar el estado de una página de resultados específica, coherente con el registro institucional del resto del sitio.

### 10.7 Impacto en el modelo de datos existente

Esto reemplaza `bodyEs`/`bodyEn` (texto plano) de la colección `posts` (definida en Fase 0/§3.4) por `blocksEs`/`blocksEn` (arrays de bloques con referencia a `templateId`), agrega `postType`, `category` (ahora enum, no texto libre) y `tags`. Se documenta el detalle técnico exacto (esquemas Zod, colecciones Mongo) en `SPECIFICATION-SUMMARY.md` conforme se construye.
