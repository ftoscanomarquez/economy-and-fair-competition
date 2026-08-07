# QUICK-START.md

Comandos de referencia y guía de uso/prueba de cada funcionalidad. Ver `AGENTS.md` para el detalle de fases, `HISTORY.md` para el estado actual de la sesión, y `SPECIFICATION-SUMMARY.md` para el mapa de "dónde vive cada funcionalidad" en el código.

## Estructura del proyecto

```
economy-and-fair-competition/
├── proxy.ts                      # next-intl createMiddleware — resuelve el locale de cada request (reemplazo Next 16 de middleware.ts)
├── app/
│   ├── layout.tsx                # layout raíz (pass-through de metadata; proxy.ts redirige "/" antes de llegar aquí)
│   ├── globals.css
│   ├── [locale]/                 # rutas públicas ES/EN
│   │   ├── layout.tsx            # <html>, fuentes, NextIntlClientProvider, GlobalProvider (sesión admin)
│   │   ├── (marketing)/          # route group con header/footer público
│   │   │   ├── page.tsx           # Home
│   │   │   ├── quienes-somos/
│   │   │   ├── servicios/
│   │   │   ├── articulos-y-notas/
│   │   │   └── contacto/
│   │   └── admin/                # SIN header/footer público
│   │       ├── login/
│   │       ├── templates/         # editor de plantillas (crear/listar/editar)
│   │       │   ├── new/
│   │       │   └── [id]/
│   │       └── posts/             # editor de Artículos/Notas (Fase 7C)
│   └── api/                      # Route Handlers
│       ├── auth/                  # magic link
│       ├── contact/
│       ├── content/site-texts/    # textos institucionales (Home, Quiénes Somos, etc.)
│       ├── posts/                 # CRUD de Artículos/Notas
│       ├── templates/             # CRUD de plantillas de bloques
│       └── mcp/                   # servidor MCP para WhatsApp (Fase 7F)
├── components/
│   ├── ui/                       # primitivos (shadcn-style sobre Radix)
│   ├── admin/                    # toolbar, drawer, editor de plantillas, editor inline, login form
│   ├── marketing/                # hero, servicios, industrias, formulario contacto, visuales SVG
│   └── shared/                   # header/footer público
├── lib/
│   ├── blocks/schema.ts          # tipos de bloque (hero, richtext, twoColumn, chart) — Zod
│   ├── posts-taxonomy.ts         # categorías fijas + tipo Artículo/Nota
│   ├── ai-config.ts              # resolución/cifrado de la API key de Claude (admin en Mongo vs .env)
│   ├── ai/                       # lógica de conversión Markdown y extracción PDF/URL (Fase 7B–7F)
│   ├── db.ts, auth.ts, session.ts, logger.ts, mailer.ts, rate-limit.ts, circuit-breaker.ts, env.ts, i18n.ts, utils.ts, posts.ts, content.ts
├── context/                      # GlobalContext (sesión admin, idioma de edición), ToastContext
├── content/seeds/                # copy fuente ES/EN, posts de ejemplo
├── i18n/                         # routing.ts, navigation.ts, request.ts (next-intl)
├── messages/                     # es.json, en.json (UI de la app, namespace admin.* incluido)
├── scripts/                      # seed-schema.ts, seed-config.ts, seed-data.ts
├── tests/
│   ├── unit/                     # Vitest
│   ├── e2e/                      # Playwright
│   ├── load/                     # k6
│   └── reports/                  # salidas HTML (gitignored)
├── postman/                      # colección + environment
└── logs/                         # app.log (Pino JSON, gitignored salvo estructura)
```

## Instalación

```bash
npm install
cp .env.example .env   # completar con credenciales reales (nunca commitear .env)
```

## Desarrollo

```bash
npm run dev             # http://localhost:3000 (o el siguiente puerto libre si está ocupado)
npm run typecheck       # tsc --noEmit
npm run lint            # eslint .
npm run build           # build de producción
npm run start           # servir build de producción
```

## Base de datos (seeds obligatorias — orden estricto)

```bash
npm run seed:schema     # 1. crea/actualiza colecciones con validación JSON Schema (incluye templates, ai_config)
npm run seed:config     # 2. carga site_texts (ES/EN)
npm run seed:data       # 3. carga/migra posts de ejemplo al esquema de plantillas/bloques vigente
npm run seed:all        # ejecuta las tres en orden
```

`seed:schema` es idempotente y también migra el *validator* de colecciones ya existentes (`collMod`) cuando el esquema cambia — correrlo de nuevo tras un `git pull` que toque `lib/blocks/schema.ts` o `lib/posts-taxonomy.ts` es seguro y recomendado.

---

## Cómo probar cada funcionalidad

### Acceso admin (magic link)

1. `npm run dev`, ir a `http://localhost:3001/es/admin/login` (o el puerto que asigne Next).
2. Correo: el que esté en `ADMIN_ALLOWED_EMAILS` de `.env` (por defecto `admin@economyandfaircompetition.com`).
3. El código de 6 dígitos llega a **Mailpit**: `http://localhost:8025` (usuario `admin`, contraseña `magiclink123` — credenciales del contenedor compartido `magic-link-mailpit`).
4. Verificar el código → sesión iniciada, redirige a `/admin`.

### Edición en vivo de textos institucionales

1. Con sesión admin activa, ir a cualquier página pública (`/es`, `/es/quienes-somos`, etc.).
2. La barra negra superior ("MODO ADMIN") aparece automáticamente.
3. Clic en **"Editar contenido"** → los textos editables muestran un borde punteado azul.
4. Clic directo sobre un texto, editarlo, hacer clic fuera (blur) → se guarda en MongoDB (`site_texts`), confirmado con un toast "Guardado".
5. El selector **ES/EN** de la barra negra navega entre idiomas (mismo mecanismo que el selector del header público) y determina en qué idioma se guarda la próxima edición.

### Sistema de plantillas (bloques reutilizables)

1. Con sesión admin, clic en **"Plantillas"** en la barra negra, o ir a `/es/admin/templates`.
2. **"Nueva plantilla"**: dar un nombre, agregar bloques con los botones ("Encabezado con imagen", "Texto enriquecido (Markdown)", "Dos columnas (texto + imagen)", "Tabla con gráfica"), reordenar con las flechas, eliminar con el ícono de basura.
3. **"Crear plantilla"** → persiste en Mongo (colección `templates`), redirige al listado.
4. Una plantilla es solo el esqueleto (tipos de bloque, sin contenido); el contenido se llena al crear un Artículo/Nota concreto que la usa (ver siguiente sección, Fase 7C).

### Extracción de PDF/Word/PowerPoint/URL con IA (en el editor de bloques de texto)

En cualquier bloque de texto enriquecido (richtext o la columna de texto en twoColumn) del editor de posts, botón **"Extraer de PDF/URL"**: abre un panel con dos opciones —

1. **Subir archivo**: PDF, Word (.docx) o PowerPoint (.pptx).
2. **Leer URL**: HTML de una página web, o un enlace que sirva directo un PDF/Word/PowerPoint (se detecta por `Content-Type`).

El documento se lee completo (vía `officeparser`) y Claude genera un título, un resumen ejecutivo y un cuerpo en Markdown bien formateado (encabezados, listas, negritas, tablas cuando el documento tiene datos comparables) — se muestra como sugerencia con vista previa; hay que pulsar **"Aplicar al bloque"** explícitamente, nunca se sobreescribe solo.

```bash
# Extraer desde URL
curl -X POST http://localhost:3001/api/ai/extract-document \
  -H "Content-Type: application/json" -H "Cookie: <cookie de sesión admin>" \
  -d '{"url":"https://ejemplo.com/articulo"}'

# Extraer desde archivo local
curl -X POST http://localhost:3001/api/ai/extract-document \
  -H "Cookie: <cookie de sesión admin>" \
  -F "file=@/ruta/al/documento.pdf"
```

### Editor de Artículos/Notas (usando una plantilla)

1. Con sesión admin, `/es/admin/posts` → **"Nueva publicación"**.
2. Elegir una plantilla ya creada, llenar metadata (tipo Artículo/Nota, categoría, tags, slug, títulos ES/EN).
3. Llenar cada bloque de la plantilla: el bloque richtext soporta Markdown directo o pegar texto plano y usar **"Convertir con IA"** (llama a Claude, muestra una sugerencia previa que hay que aceptar explícitamente — nunca sobreescribe solo).
4. El bloque de tabla/gráfica: agregar filas etiqueta/valor y elegir tipo (Barras/Líneas/Pastel).
5. **"Guardar borrador"** o **"Publicar"** → si se publica, el post aparece de inmediato en `/es/articulos-y-notas` y su página de detalle (`/es/articulos-y-notas/[slug]`) renderiza todos los bloques, incluida la gráfica real.

### Filtros de Artículos y Notas

En `/es/articulos-y-notas`: checkboxes de tipo (Artículo/Nota), categoría, tags, búsqueda por título (con opción "Buscar también en el contenido"), rango de fechas. Los filtros se reflejan en la URL (`?types=articulo&category=...`) — compartibles/guardables. La paginación es numérica clásica.

### Generación de imágenes con IA (pollinations.ai + sugerencia de prompt con Claude)

En el editor de posts (`/es/admin/posts/new` o editando uno existente), en los bloques **Hero** y **Dos columnas**: junto al botón "Subir imagen" aparece **"Generar imagen con IA"**.

1. Al hacer clic, se abre un editor de prompt con un texto ya sugerido automáticamente a partir del contenido del bloque (título del hero, o el markdown de la columna).
2. Puedes editar ese texto directamente, o pulsar **"Sugerir prompt con IA"** para que Claude proponga una descripción más detallada y visual (escena, iluminación, composición) — la sugerencia reemplaza momentáneamente el campo, sigue siendo editable, nunca se aplica sola.
3. **"Generar con este prompt"** llama a pollinations.ai con el texto que quede en el campo en ese momento.

- API de imagen: `https://image.pollinations.ai/prompt/{prompt}` — pública, sin API key, sin costo. Cada llamada incluye un `seed` aleatorio para que el mismo prompt no devuelva siempre la misma imagen.
- Resiliente por diseño: si pollinations.ai no responde (circuit breaker abierto tras fallos consecutivos, o error de red), el endpoint (`POST /api/ai/generate-image`) responde `503` con un mensaje claro en un toast. El post se guarda con normalidad sin esa imagen — el admin puede volver a pulsar el mismo botón en cualquier momento posterior, no hay reintento automático ni cola.
- La sugerencia de prompt (`POST /api/ai/suggest-image-prompt`) usa Claude — requiere `ANTHROPIC_API_KEY` configurada, igual que la conversión de Markdown; si no está configurada responde `503` de forma controlada.
- Para probar los endpoints directo:
  ```bash
  curl -X POST http://localhost:3001/api/ai/suggest-image-prompt \
    -H "Content-Type: application/json" -H "Cookie: <cookie de sesión admin>" \
    -d '{"sourceText":"Nuevas reglas de origen en el T-MEC"}'

  curl -X POST http://localhost:3001/api/ai/generate-image \
    -H "Content-Type: application/json" \
    -H "Cookie: <cookie de sesión admin>" \
    -d '{"prompt":"contenedores de carga en un puerto al atardecer, estilo editorial"}'
  ```

### Integración de IA (Claude) — conversión de texto y extracción de contenido

- La API key vive en `.env` (`ANTHROPIC_API_KEY`) como fallback, o configurable por el admin desde `/admin` (sección de Configuración — pendiente de construir la UI, el backend `lib/ai-config.ts` ya soporta guardarla cifrada en Mongo).
- Para validar que la key configurada funciona:
  ```bash
  node --env-file=.env -e "
  const Anthropic = require('@anthropic-ai/sdk').default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  client.messages.create({ model: 'claude-sonnet-5', max_tokens: 20, messages: [{ role: 'user', content: 'Responde solo: OK' }] })
    .then(r => console.log('OK:', r.content[0].text))
    .catch(e => console.error('ERROR:', e.status, e.message));
  "
  ```
- Nota importante de facturación: la API key de Anthropic (console.anthropic.com) consume de un saldo/crédito **separado** de cualquier suscripción de Claude Code o Claude.ai — son sistemas de facturación distintos, sin forma de unificarlos.

### Servidor MCP PRIVADO (WhatsApp) — probado vía HTTP directo

El servidor MCP privado (`POST /api/mcp`) está completo y probado, pero **no conectado a un proveedor real de WhatsApp** (diferido a pedido del usuario). Acepta dos formas de autenticación en `Authorization: Bearer <token>`: el secreto fijo `MCP_WEBHOOK_SECRET`, o un JWT de sesión admin real (la cookie que deja `/api/auth/verify-code` al hacer login en `/admin`).

```bash
SECRET="<valor de MCP_WEBHOOK_SECRET en .env>"

# Listar plantillas disponibles (solo lectura, no requiere teléfono)
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET" \
  -d '{"tool":"list_templates","params":{}}'

# Crear un post desde texto Markdown directo (requiere callerPhone en MCP_ADMIN_PHONES)
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET" \
  -d '{"tool":"create_post_from_media","callerPhone":"+5215500000000","params":{"templateId":"<id>","postType":"nota","markdown":"## Título\n\nContenido..."}}'

# Crear un post extrayendo contenido de una URL vía IA
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET" \
  -d '{"tool":"create_post_from_media","callerPhone":"+5215500000000","params":{"templateId":"<id>","postType":"articulo","externalUrl":"https://..."}}'

# Con JWT de sesión admin en vez del secreto fijo (el valor de la cookie de sesión tras loguearse en /admin)
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <valor-de-la-cookie-de-sesion>" \
  -d '{"tool":"list_templates","params":{}}'
```

Los posts creados vía MCP siempre entran como `draft` (borrador) — requieren revisión y publicación manual desde `/admin/posts`. El editor de plantillas **no está expuesto vía MCP**; solo se puede *elegir* un `templateId` existente.

### Servidor MCP PÚBLICO (protocolo real, sin autenticación)

`POST /api/mcp-public` implementa el protocolo MCP real (JSON-RPC 2.0). Cualquier cliente MCP (Claude Desktop, u otro agente configurado manualmente con esta URL) puede usarlo. Herramientas: `list_posts`, `get_post_detail`, `list_services` — todas de solo lectura sobre contenido ya publicado.

```bash
# Handshake
curl -X POST http://localhost:3001/api/mcp-public \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# Listar herramientas
curl -X POST http://localhost:3001/api/mcp-public \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

# Invocar una herramienta
curl -X POST http://localhost:3001/api/mcp-public \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_services","arguments":{"locale":"es"}}}'

# Manifest de descubrimiento (experimental, borrador SEP-2127 — no todo cliente lo reconocerá)
curl http://localhost:3001/.well-known/mcp/server-cards.json
```

**Importante**: el manifest usa `NEXT_PUBLIC_SITE_URL` del `.env` para construir la URL del endpoint — ajústala al puerto/dominio real que estés usando antes de que un cliente externo intente conectarse a partir del manifest.

### Contacto

1. Ir a `/es/contacto`, llenar y enviar el formulario.
2. El correo de notificación llega a Mailpit (dev) o a `CONTACT_NOTIFICATION_EMAIL` vía Resend (prod).
3. Registro auditado en la colección `contact_submissions`.

## Testing

### Vitest (unitarias — esquemas Zod, rate limit, IA)

```bash
npm run test              # modo run, 35 tests
npm run test:watch        # modo watch
npm run test:report       # con reporte HTML en tests/reports/vitest/index.html
```

### Playwright (E2E — 16 specs sobre login, edición inline, plantillas/posts, filtros públicos)

```bash
npm run test:e2e          # requiere el dev server disponible (arranca uno propio en :3100 si no hay ninguno)
npm run test:e2e:report   # abre el último reporte HTML en tests/reports/playwright/
```

El proyecto `setup` (`tests/e2e/auth.setup.ts`) hace login una sola vez vía Mailpit y guarda la sesión en `tests/e2e/.auth/admin.json`; el resto de los specs la reutilizan (evita agotar el rate limit de `request-code`, 5/min por IP).

### k6 (carga — requiere un build de producción real, `next dev` no sirve para medir esto)

```bash
npm run build && npm run start   # servidor de producción en :3100, en otra terminal

npm run test:load:spike       # rampa a 500 VUs en 10s, sostenida 20s (~40s total)
npm run test:load:sustained   # rampa a 500 VUs sostenida 15 minutos
npm run test:load:mcp         # endpoint MCP, concurrencia baja (5 VUs) — el propio endpoint limita a 30 req/min por IP
```

Reportes HTML en `tests/reports/k6/public-load.html` y `mcp-load.html`. Ver `INFRA.md` para los resultados documentados (latencia bajo pico vs. sostenido, por qué el SLA de los thresholds está calibrado para una instancia Node única sin réplicas).

## Seguridad

Semgrep no tiene un paquete npm oficial mantenido y este entorno no tiene Python/pip — se corre vía Docker (imagen oficial `semgrep/semgrep`, ya usada por Mongo/Mailpit en este proyecto):

```bash
# Windows/Git Bash: MSYS_NO_PATHCONV=1 evita que Git Bash reescriba /src como una ruta de Windows
MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd):/src" -w /src semgrep/semgrep \
  semgrep scan --config auto --json --output tests/reports/semgrep/report.json .

npm run security:semgrep   # equivalente si Semgrep está instalado localmente (pip install semgrep) — además genera el HTML
```

`--config auto` contacta el backend de Semgrep para resolver el ruleset según el proyecto — en corridas repetidas puede tardar de forma inconsistente según la red. El reporte HTML (`tests/reports/semgrep/report.html`) se genera con `scripts/semgrep-html-report.mjs` a partir del JSON, ya que el CLI de Semgrep no tiene un formato `--html` nativo. Ver `RETROSPECTIVA.md` §Fase 9 para los hallazgos ya revisados y corregidos.

## Postman / Newman

Colección: `postman/Economy-and-Fair-Competition.postman_collection.json` (8 carpetas: Auth, Textos institucionales, Contacto, Plantillas, Publicaciones, IA+Uploads, MCP, Limpieza). Environment: `postman/Economy-and-Fair-Competition.postman_environment.json`.

**El login requiere dos corridas** porque el código de 6 dígitos llega a un correo real (Mailpit) que Newman no puede leer de forma confiable dentro de su propio script:

```bash
# 1ª corrida: solo solicita el código (deja un correo nuevo en Mailpit)
npx newman run postman/Economy-and-Fair-Competition.postman_collection.json \
  -e postman/Economy-and-Fair-Competition.postman_environment.json \
  --folder "01 - Auth (magic link)"

# Entre corridas: abrir http://localhost:8025 (admin/magiclink123), copiar el código
# de 6 dígitos del correo más reciente ("Tu código de acceso") y pegarlo en la
# variable de entorno "magicLinkCode" del archivo .postman_environment.json
# (o directamente en la app de Postman si se importó ahí).

# 2ª corrida: el resto de la colección (o toda, evitando volver a correr el
# paso "1. Solicitar código", que invalidaría el código recién copiado)
npx newman run postman/Economy-and-Fair-Competition.postman_collection.json \
  -e postman/Economy-and-Fair-Competition.postman_environment.json \
  -r cli,htmlextra --reporter-htmlextra-export tests/reports/postman/report.html
```

Para importar en la app de escritorio/web de Postman: `File > Import` ambos archivos JSON, seleccionar el environment "Economy and Fair Competition - Local" en el selector superior derecho, y correr con el Runner siguiendo el mismo flujo de dos pasadas.

## Infraestructura Docker de referencia (opcional, no requerida por el MVP)

El proyecto usa MongoDB Atlas (nube) y el Mailpit ya compartido en el entorno (`localhost:8025`), así que **no es necesario levantar nada de `docker-compose.yml`** para desarrollar. Si se quiere activar alguno de los servicios de referencia (Mongo local, Mailpit dedicado, RustFS, Vault, Traefik, SonarQube, Elasticsearch+Kibana):

```bash
docker compose --profile mongo-local up -d
docker compose --profile vault up -d
docker compose --profile traefik up -d
docker compose --profile sonarqube up -d
docker compose --profile observability up -d
```

## Mailpit (ya activo, compartido)

UI web: http://localhost:8025 (usuario `admin` / contraseña `magiclink123`) — todos los correos enviados en desarrollo (magic link, formulario de contacto) aparecen aquí, no se envían realmente.

## Despliegue a producción (Vercel)

El sitio está en producción real en `https://economyandfaircompetition.com` (Vercel, proyecto `vercel-toscano-team/economy-and-fair-competition`). Detalle completo de la configuración en `INFRA.md` § "Despliegue en Vercel" — esta sección solo cubre comandos operativos del día a día.

**El repo está conectado a GitHub para auto-deploy**: cada push a `main` dispara un deploy nuevo automáticamente. No suele ser necesario desplegar manualmente.

```bash
# Deploy manual a producción (si hace falta, ej. para probar un cambio de env var sin esperar el push)
vercel deploy --prod

# Ver logs en vivo/recientes de producción
vercel logs https://economyandfaircompetition.com

# Listar variables de entorno de producción configuradas
vercel env ls production

# Agregar/actualizar una variable de entorno de producción (no se puede editar in-place: quitar y volver a agregar)
vercel env rm NOMBRE_VARIABLE production --yes
echo "valor" | vercel env add NOMBRE_VARIABLE production
# tras cambiar una env var, hace falta un nuevo deploy para que el build la recoja:
vercel deploy --prod
```

**Imágenes subidas en producción**: van automáticamente a Vercel Blob (no a disco, que no persiste en Vercel) — no requiere ningún paso manual, `lib/uploads.ts` lo detecta solo vía `BLOB_READ_WRITE_TOKEN`. Ver `INFRA.md` para el detalle de por qué y cómo se migraron las imágenes de arranque.

**Pendiente**: `RESEND_API_KEY` sin configurar en producción — el login por magic link y el formulario de contacto no envían correo real hasta que se complete (crear cuenta en Resend, verificar un dominio, agregar la key con `vercel env add RESEND_API_KEY production`).
