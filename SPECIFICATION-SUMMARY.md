# SPECIFICATION-SUMMARY.md

> Mapa de arquitectura y contratos de API. Es el documento a consultar cuando la pregunta es **"¿dónde vive X funcionalidad?"** — para el historial cronológico de qué se construyó y cuándo, ver `HISTORY.md`; para errores encontrados y su causa raíz, ver `RETROSPECTIVA.md`.
>
> Se actualiza en cada sub-fase que agrega o mueve funcionalidad — nunca debe quedar desalineado con el código real.

---

## 1. Mapa rápido: "¿dónde está...?"

| Busco... | Vive en |
|---|---|
| El modelo de datos de un bloque de contenido (hero, texto, dos columnas, gráfica) | `lib/blocks/schema.ts` — tipos Zod discriminados por `type`, fuente de verdad tanto para validación como para tipos TS |
| Las categorías fijas de Artículos/Notas y el enum Artículo/Nota | `lib/posts-taxonomy.ts` |
| La resolución de qué API key de Claude usar (admin en Mongo vs. `.env`) | `lib/ai-config.ts` — `resolveAiConfig()` es el único punto de entrada, todo lo demás debe llamarlo, nunca leer `ANTHROPIC_API_KEY` directo |
| El cifrado de la API key de IA guardada por el admin | `lib/ai-config.ts` (AES-256-GCM), colección Mongo `ai_config` |
| El cliente compartido de la API de Claude | `lib/ai/client.ts` — `getAnthropicClient()` es el único punto de instanciación de `Anthropic()` en todo el proyecto |
| La lógica de conversión de texto libre → Markdown vía IA | `lib/ai/markdown.ts` (`looksLikeMarkdown()` heurística sin costo + `convertToMarkdown()` llamada real a Claude) + `/api/ai/markdown` — **construido y validado E2E con la API real en Fase 7C** |
| El editor de bloque de texto con detección/conversión/vista previa Markdown | `components/admin/markdown-block-editor.tsx` |
| La subida de imágenes (bloques hero/twoColumn) | `/api/uploads` (disco local, `public/uploads`) + `components/admin/image-upload-field.tsx` |
| El guardado compartido de imágenes a disco (subida manual y generadas por IA) | `lib/uploads.ts` (`saveImageBuffer()`) |
| La generación de imágenes con IA (pollinations.ai) | `lib/ai/image-generation.ts` (`generateImageFromPrompt()`, envuelto en circuit breaker, con `seed` aleatorio en cada llamada para no repetir la misma imagen) + `/api/ai/generate-image` + editor de prompt en `components/admin/image-upload-field.tsx` — **construido en Fase 8**; si el servicio no responde, el post se guarda igual sin imagen y el admin puede reintentar generar en cualquier momento posterior desde el mismo editor |
| La sugerencia de prompt de imagen más detallado (vía Claude) | `lib/ai/image-generation.ts` (`suggestImagePrompt()`) + `/api/ai/suggest-image-prompt` + botón "Sugerir prompt con IA" dentro del editor de prompt de `image-upload-field.tsx` — el prompt sugerido reemplaza momentáneamente el campo editable, nunca se aplica ni genera la imagen automáticamente |
| La miniatura (thumbnail) de un post en el listado público | `thumbnailUrl` en el documento `posts` (Mongo) + `components/admin/thumbnail-selector.tsx` (elige entre las imágenes ya usadas en los bloques hero/twoColumn del post) + `components/marketing/posts-feed.tsx` (renderiza la imagen real en la tarjeta en vez del ícono placeholder cuando existe) |
| La búsqueda por título/contenido en `/admin/posts` | `components/admin/admin-posts-list.tsx` — filtrado en cliente (la lista admin no pagina, a diferencia del listado público) |
| El editor de datos de gráfica (tabla → filas etiqueta/valor + tipo de gráfica) | `components/admin/chart-data-editor.tsx` |
| La extracción de contenido desde documentos (PDF/DOCX/PPTX) y URLs vía IA | `lib/ai/extract.ts` — usa `officeparser` (un solo paquete que cubre PDF/DOCX/PPTX/HTML) para el texto crudo, y Claude para estructurarlo en Markdown con títulos, listas y tablas. `extractFromDocument()` es la función base; `extractFromPdf()` y `extractFromUrl()` son wrappers de compatibilidad para el servidor MCP. `extractFromUrl()` detecta el `Content-Type` real de la respuesta (HTML vs. un archivo servido directo, ej. un enlace "Descargar PDF") |
| El botón "Extraer de PDF/URL" del editor de bloques de texto | `/api/ai/extract-document` (multipart con archivo PDF/DOCX/PPTX, o JSON `{ url }`) + panel en `components/admin/markdown-block-editor.tsx` — muestra título, resumen y Markdown como sugerencia editable con vista previa; **nunca** reemplaza el contenido del bloque sin que el admin pulse "Aplicar al bloque" — **construido en Fase 8** |
| El link de fuente al final del Markdown extraído | `lib/ai/extract.ts` (`appendSourceReference()`) — si la extracción vino de una URL externa, enlaza esa URL ("Para más detalle, consulta la fuente original"); si vino de un archivo subido (PDF/DOCX/PPTX), el documento se guarda en `public/documents/` y se enlaza como "Documento original" para descarga |
| El guardado de documentos fuente (PDF/DOCX/PPTX subidos para extracción) | `lib/uploads.ts` (`saveDocumentBuffer()`, carpeta separada de las imágenes) — cada archivo (imagen o documento) queda además registrado en la colección Mongo `uploaded_files` (`sizeBytes`, `originalName`, `createdBy`, `createdAt`) |
| La pantalla de gestión de archivos subidos | `/admin/files` (`components/admin/files-manager.tsx` + `lib/uploads.ts` → `listUploadedFiles()`/`deleteUploadedFile()`) — lista imágenes y documentos con búsqueda, filtro por tipo, selección múltiple y eliminación. Indica con la leyenda "Depurado" si el archivo físico ya no existe en disco |
| El aviso "documento depurado" en el render público | `components/marketing/blocks/rich-text-block.tsx` (Server Component **async**, con un componente `a` custom para `react-markdown` que llama a `lib/uploads.ts` → `isFileMissing()`) — si un link `/documents/...` dentro del Markdown ya no existe en disco (el admin lo eliminó desde `/admin/files`), se reemplaza por un aviso en vez de un enlace roto silencioso |
| El logo y el favicon del sitio | `public/logo-eafc.png` (usado en `components/shared/site-header.tsx`, a la izquierda del título) + `app/icon.png` (favicon automático de Next.js App Router, sin configuración adicional de metadata) |
| La imagen editable del hero (misma para ES/EN) | `components/admin/editable-image.tsx` — análogo a `EditableText` pero para imágenes: en modo edición, un overlay "Cambiar imagen" sobre el hero permite subir un archivo nuevo, que se guarda con la misma URL en `es` y `en` de la clave `site_texts` `home.hero.image` (una sola llamada a `PUT /api/content/site-texts`, ya que la imagen no distingue idioma a diferencia del texto) |
| El servidor MCP PRIVADO (WhatsApp) y sus 6 herramientas | `app/api/mcp/route.ts` — **construido y validado E2E con curl en Fase 7F**; conexión con proveedor real de WhatsApp diferida a pedido del usuario. Protocolo propio (`{ tool, params, callerPhone? }`, no JSON-RPC) |
| La autorización del servidor MCP privado (secreto de webhook O JWT de sesión admin + teléfonos admin para mutaciones) | `lib/mcp-auth.ts` (`verifyMcpAuthorization()` acepta el secreto fijo `MCP_WEBHOOK_SECRET` **o** un JWT de sesión válido — el mismo que usa el panel `/admin` —, `isAuthorizedAdminPhone()`) — **ampliado en Fase 8** a pedido del usuario |
| El servidor MCP PÚBLICO (solo lectura, sin autenticación) | `app/api/mcp-public/route.ts` — protocolo MCP real (JSON-RPC 2.0 sobre Streamable HTTP, vía `@modelcontextprotocol/sdk`), stateless (una instancia de `McpServer` por request). Herramientas: `list_posts`, `get_post_detail` (solo publicados), `list_services`. Pensado para clientes MCP reales (Claude Desktop, otros agentes) configurados manualmente con esta URL — **construido en Fase 8** |
| El manifest de descubrimiento MCP (borrador SEP-2127, no estándar oficial cerrado) | `app/.well-known/mcp/server-cards.json/route.ts` — intento de descubrimiento pasivo; no hay garantía de que toda extensión/cliente lo reconozca porque el estándar de descubrimiento mismo sigue sin cerrarse a la fecha |
| El editor visual de plantillas (secuencia de bloques) | `components/admin/template-block-list-editor.tsx` + `components/admin/template-form.tsx`, páginas en `app/[locale]/admin/templates/` |
| El editor de un Artículo/Nota concreto (llenar los bloques de una plantilla) | `components/admin/post-form.tsx` + `components/admin/content-block-editor.tsx` (dispatcher por tipo de bloque), páginas en `app/[locale]/admin/posts/` — **construido en Fase 7C** |
| El renderizado público de cada tipo de bloque | `components/marketing/blocks/post-block-renderer.tsx` (dispatcher) + `hero-block.tsx`, `rich-text-block.tsx`, `two-column-block.tsx`, `chart-block.tsx` — **construido y validado E2E en Fase 7D** |
| La página de detalle de un Artículo/Nota | `app/[locale]/(marketing)/articulos-y-notas/[slug]/page.tsx` — **nueva en Fase 7D**, antes solo existía un modal con resumen, no una página propia |
| Las gráficas generadas desde una tabla de datos (vista pública) | `components/marketing/blocks/chart-block.tsx` vía `recharts` (Client Component; barras/líneas/pastel) — validado con datos reales en Fase 7D |
| Los filtros/búsqueda/paginación de `/articulos-y-notas` | `components/marketing/posts-filters.tsx` (panel, sincronizado con query params) + `posts-pagination.tsx` + `lib/posts.ts` (`listPublishedPosts` con `PostListFilters`) — **construido y validado E2E en Fase 7E**, incluida la regla de fecha fin ≥ inicio validada en cliente y servidor |
| La edición en vivo de textos institucionales (Home, Quiénes Somos, etc. — NO Artículos/Notas) | `components/admin/editable-text.tsx` + `/api/content/site-texts` — sistema **separado** del de plantillas/bloques, usa la colección `site_texts` |
| El toolbar de administrador (modo edición, selector de idioma, logout) | `components/admin/admin-toolbar.tsx` |
| El sistema de autenticación (magic link) | `lib/auth.ts` (lógica) + `app/api/auth/*` (endpoints) + `lib/session.ts` (lectura de sesión en Server Components) |
| El circuit breaker y rate limiting | `lib/circuit-breaker.ts` (estado en Mongo `circuit_breaker_state`), `lib/rate-limit.ts` (en memoria) |

---

## 2. Tabla de tecnologías justificadas

| Tecnología | Justificación |
|---|---|
| Next.js 16 (App Router) + TypeScript | Requisito explícito del brief; SSR/RSC para SEO institucional y separación clara Server/Client Components |
| MongoDB Atlas | Requisito del usuario; esquema flexible adecuado para `site_texts` bilingües, `posts` con bloques estructurados, y `templates` |
| `proxy.ts` (next-intl `createMiddleware`) | Reemplazo oficial de Next 16 para `middleware.ts`; requerido para que `next-intl` resuelva el locale de cada request (ver `RETROSPECTIVA.md` — sin esto, el selector de idioma no funcionaba) |
| Tailwind CSS + tokens OKLCH | Requisito del brief; OKLCH permite derivar variantes de color perceptualmente uniformes desde 3 anclas |
| Radix UI / Shadcn | Primitivos accesibles (Dialog, Tabs, Toast, Checkbox) sin reinventar manejo de foco/teclado |
| Framer Motion | Animaciones fluidas sin rebote requeridas por el brief (carrusel de industrias, reveals) |
| next-intl 4.x | i18n nativo App Router compatible con Next 16 (3.x no declara soporte) |
| jose (JWT) | Librería JWT estándar auditada, compatible con Edge Runtime si se requiere en el futuro |
| Pino | Logging estructurado JSON de alto rendimiento, requisito de observabilidad del proyecto |
| Resend / Nodemailer | Resend en producción (API simple, buena entregabilidad); Nodemailer solo como transporte SMTP hacia Mailpit en desarrollo |
| Zod | Validación de esquemas compartida entre formularios cliente y Route Handlers servidor; también es la fuente de los tipos de bloque (`lib/blocks/schema.ts`) |
| `@anthropic-ai/sdk` | Cliente oficial de la API de Claude; usado para conversión de texto a Markdown y extracción de contenido desde PDF/URL |
| `officeparser` | Extracción de texto plano de PDF/DOCX/PPTX/HTML (un solo paquete, reemplazó `pdf-parse` + un stripHtml casero) antes de pasarlo a Claude para estructurar en Markdown |
| `react-markdown` + `remark-gfm` | Renderizado público de bloques de texto en Markdown (soporta listas, tablas, negrita/itálica — GFM) |
| `recharts` | Gráficas (barras, líneas, pastel/dona) generadas automáticamente desde el bloque de tabla de datos |
| Vitest / Playwright / k6 | Requisito explícito del usuario para unitarias, E2E y carga respectivamente |
| Semgrep | Requisito explícito del usuario para SAST con reporte HTML |

---

## 3. Contratos de API

Todas las rutas devuelven, en caso de error: `{ "error": "<mensaje descriptivo>" }` con el código HTTP semánticamente correcto (400 validación, 401 no autenticado, 404 no encontrado, 409 conflicto, 429 rate limit, 500 error interno).

### 3.1 Autenticación (`/api/auth/*`)

| Ruta | Método | Auth | Body | Descripción |
|---|---|---|---|---|
| `/api/auth/request-code` | POST | Pública, rate-limited | `{ email }` | Emite código de 6 dígitos si el email está en `ADMIN_ALLOWED_EMAILS`; respuesta idéntica exista o no la cuenta (no filtra qué correos son admin) |
| `/api/auth/verify-code` | POST | Pública, rate-limited | `{ email, code }` | Verifica el código (hash HMAC, comparación timing-safe), emite cookie de sesión JWT httpOnly |
| `/api/auth/session` | GET | Pública | — | Devuelve `{ authenticated, email? }` según la cookie de sesión |
| `/api/auth/logout` | POST | Pública | — | Borra la cookie de sesión |

### 3.2 Contenido institucional (`site_texts`)

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/content/site-texts` | GET | Pública | Devuelve todos los `site_texts` resueltos al locale pedido (`?locale=es\|en`) |
| `/api/content/site-texts` | PUT | Admin | `{ key, es?, en? }` — actualiza uno o ambos idiomas de una clave existente |

### 3.3 Plantillas (`templates`) — Fase 7B

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/templates` | GET | Pública | Lista todas las plantillas (id, nombre, secuencia de bloques) |
| `/api/templates` | POST | Admin | `{ name, blocks: [{id, type}] }` — crea una plantilla nueva |
| `/api/templates/[id]` | GET | Pública | Detalle de una plantilla |
| `/api/templates/[id]` | PUT | Admin | Actualiza nombre y/o bloques |
| `/api/templates/[id]` | DELETE | Admin | Elimina; rechaza con 409 si algún post todavía la usa (`templateId`) |

### 3.4 Posts (`posts`) — modelo revisado en Fase 7A

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/posts` | GET | Pública (borradores requieren admin) | Lista posts; `?includeDrafts=true` requiere sesión |
| `/api/posts` | POST | Admin | `{ slug, templateId, postType, category?, tags[], titleEs, titleEn, summaryEs?, summaryEn?, blocksEs[], blocksEn[], status }` — mismo contrato que usará el MCP en Fase 7F |
| `/api/posts/[id]` | GET/PUT/DELETE | Admin (GET público para el detalle publicado) | CRUD de un post; PUT acepta actualización parcial de cualquier campo incluyendo bloques |

### 3.5 IA (Claude) — Fase 7C

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/ai/markdown` | POST | Admin, rate-limited | `{ text }` → `{ markdown, model }`. Convierte texto libre a Markdown estructurado vía Claude; el resultado se muestra como sugerencia en el admin, nunca se aplica automáticamente |
| `/api/ai/generate-image` | POST | Admin, rate-limited (10/min/IP) | `{ prompt }` (1-500 caracteres) → `{ url }`, 201. Genera una imagen con pollinations.ai (API pública sin key) y la guarda en disco local. Cada llamada incluye un `seed` aleatorio para no repetir la misma imagen con el mismo prompt (pollinations.ai es determinista sin ese parámetro). Envuelto en circuit breaker (`lib/circuit-breaker.ts`, servicio `pollinations-image-generation`): si el servicio externo falla repetidamente, responde `503` sin reintento automático — el admin reintenta manualmente desde el mismo botón cuando quiera, el post se guarda igual sin imagen mientras tanto |
| `/api/ai/suggest-image-prompt` | POST | Admin, rate-limited (20/min/IP) | `{ sourceText }` (1-2000 caracteres) → `{ prompt }`. Pide a Claude una versión más detallada y visual del texto del bloque, para usar como prompt de `/api/ai/generate-image`. `503` si no hay IA configurada |
| `/api/ai/extract-document` | POST | Admin, rate-limited (10/min/IP) | `multipart/form-data` con campo `file` (PDF/.docx/.pptx) **o** JSON `{ url }` → `{ title, summary, markdown, sourceUrl }`. Extrae el texto vía `officeparser` y lo estructura vía Claude (títulos, listas, tablas Markdown); `markdown` incluye al final un link a `sourceUrl` (la URL externa, o el documento subido guardado en `public/documents/`). El resultado se muestra como sugerencia editable en el editor de bloques, nunca reemplaza el contenido sin confirmación explícita. `503` si no hay IA configurada, `502` si falla la extracción/lectura del documento |
| `/api/uploaded-files` | GET | Admin | `{ files: UploadedFileSummary[] }` — todos los archivos subidos (imágenes y documentos), con `existsOnDisk` calculado en el momento |
| `/api/uploaded-files/{id}` | DELETE | Admin | `{ deleted: true }`. Borra el registro en Mongo y el archivo físico si existe |

### 3.6 Subida de archivos

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/uploads` | POST | Admin | `multipart/form-data` con campo `file` (PNG/JPEG/WEBP/GIF, máx. `MAX_UPLOAD_SIZE_MB`) → `{ url }`. Guarda en disco local (`public/uploads`), vía `lib/uploads.ts` (`saveImageBuffer()`), compartido con `/api/ai/generate-image` |

### 3.7 Contacto

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/contact` | POST | Pública, rate-limited | Formulario de contacto → Resend/Mailpit (circuit breaker) + registro en `contact_submissions` |

### 3.8 MCP PRIVADO / WhatsApp — construido en Fase 7F, ampliado en Fase 8

**Endpoint:** `POST /api/mcp`, body `{ tool, params, callerPhone? }` (protocolo propio, no JSON-RPC), header `Authorization: Bearer <token>` donde `<token>` es **el secreto fijo `MCP_WEBHOOK_SECRET` o un JWT de sesión admin válido** (`lib/mcp-auth.ts` → `verifyMcpAuthorization()`, ampliado en Fase 8 a pedido del usuario). La conexión con un proveedor real de WhatsApp (Meta Cloud API, Twilio) queda diferida a pedido del usuario — el servidor se prueba hoy vía HTTP directo.

| Herramienta MCP | Auth | Descripción |
|---|---|---|
| `list_templates` | Cualquier token válido | Lista plantillas disponibles con su `id` y tipos de bloque — el flujo de WhatsApp solo puede *elegir* un `templateId` existente, nunca crear/editar plantillas |
| `list_posts` | Cualquier token válido | Consulta de publicaciones, filtrable por `status` |
| `get_post_detail` | Cualquier token válido | Detalle de publicación por `id` o `slug` |
| `create_post_from_media` | Token válido + `callerPhone` en `MCP_ADMIN_PHONES` | Recibe `templateId` + exactamente una fuente: `markdown` directo, `pdfBase64`, o `externalUrl`. Si es PDF/URL, ejecuta extracción vía IA (`lib/ai/extract.ts`) a Markdown y referencia la fuente. **Siempre crea el post como `draft`** — nunca publica automáticamente, requiere revisión humana |
| `update_post` / `delete_post` | Token válido + `callerPhone` en `MCP_ADMIN_PHONES` | Mutaciones protegidas por lista blanca de teléfonos (`lib/mcp-auth.ts`), análoga a `ADMIN_ALLOWED_EMAILS` para el canal WhatsApp |

El editor de plantillas **no está disponible vía MCP** — solo desde el panel admin en computadora (decisión de producto confirmada con el usuario).

### 3.9 MCP PÚBLICO — construido en Fase 8

**Endpoint:** `POST/GET/DELETE /api/mcp-public`, protocolo MCP real (JSON-RPC 2.0 sobre Streamable HTTP, spec `2025-06-18`), sin autenticación, sin estado entre requests. Cualquier cliente MCP real (Claude Desktop, otro agente) puede conectarse dándole esta URL manualmente.

| Herramienta MCP | Descripción |
|---|---|
| `list_posts` | Artículos/Notas ya **publicados**, filtrable por `postType`, con `limit` configurable |
| `get_post_detail` | Detalle de un post publicado por `slug` o `id`, incluye el Markdown del cuerpo y la URL pública |
| `list_services` | Las 10 áreas de práctica de la firma (título + descripción), leídas de `site_texts` |

**Manifest de descubrimiento** (experimental, borrador SEP-2127, sin garantía de reconocimiento universal): `GET /.well-known/mcp/server-cards.json` → `{ name, title, description, version, remotes: [{ url, transport: "streamable-http", protocolVersion }] }`.

---

## 4. Diagrama Mermaid general

Ver `DIAGRAMAS.md` — actualizado en cada sub-fase con los flujos nuevos (creación de post con plantilla, resolución de API key de IA, extracción PDF/URL).
