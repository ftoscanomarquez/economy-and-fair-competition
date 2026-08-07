# DIAGRAMAS.md

> Diagramas de clase, máquina de estados, secuencia y modelo de persistencia. Se completan en Fase 11 cuando la arquitectura de todas las fases está implementada y estable. Esqueleto y primer diagrama de contexto creados en Fase 0.

## Diagrama de contexto general (borrador, se refina en Fase 11)

```mermaid
graph TD
    Visitor[Visitante público] -->|HTTPS| NextApp[Next.js App Router]
    Admin[Administrador] -->|Magic Link + JWT| NextApp
    WhatsAppUser[Admin vía WhatsApp] -->|Proveedor MCP| MCPEndpoint["/api/mcp/route"]

    NextApp -->|lib/db.ts| MongoAtlas[(MongoDB Atlas)]
    NextApp -->|lib/mailer.ts| Mailpit[Mailpit - dev]
    NextApp -->|lib/mailer.ts + circuit breaker| Resend[Resend API - prod]
    NextApp -->|disco local| Uploads[public/uploads]
    NextApp -->|lib/logger.ts| LogFile[logs/app.log - Pino JSON]

    MCPEndpoint --> NextApp
```

## Sistema de plantillas y bloques (Fase 7, en construcción)

### Relación Plantilla → Post → Bloques

```mermaid
classDiagram
    class Template {
        +ObjectId _id
        +string name
        +TemplateBlock[] blocks
        +Date createdAt
        +Date updatedAt
    }
    class TemplateBlock {
        +string id
        +BlockType type
    }
    class Post {
        +ObjectId _id
        +string slug
        +ObjectId templateId
        +PostType postType
        +PostCategory category
        +string[] tags
        +ContentBlock[] blocksEs
        +ContentBlock[] blocksEn
        +string status
    }
    class ContentBlock {
        +string id
        +BlockType type
    }
    class HeroBlock {
        +string title
        +string imageUrl
    }
    class RichTextBlock {
        +string markdown
    }
    class TwoColumnBlock {
        +string markdown
        +string imageUrl
        +string imagePosition
    }
    class ChartBlock {
        +string title
        +ChartType chartType
        +ChartDataRow[] data
    }

    Template "1" *-- "many" TemplateBlock : define esqueleto
    Post "1" o-- "0..1" Template : usa (templateId)
    Post "1" *-- "many" ContentBlock : blocksEs / blocksEn
    ContentBlock <|-- HeroBlock
    ContentBlock <|-- RichTextBlock
    ContentBlock <|-- TwoColumnBlock
    ContentBlock <|-- ChartBlock
```

Una `Template` es solo el esqueleto (secuencia de tipos de bloque, sin contenido). Un `Post` referencia una plantilla vía `templateId` y lleva el contenido real de cada bloque, duplicado por idioma (`blocksEs`/`blocksEn`) — misma estructura, mismo orden de bloques, contenido independiente.

### Flujo: creación de un Artículo/Nota desde el admin (Fase 7C)

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin UI (/admin/posts/new)
    participant API as /api/posts
    participant AI as lib/ai/markdown.ts
    participant Claude as Claude API
    participant DB as MongoDB (posts)

    Admin->>UI: Elige plantilla existente
    UI->>Admin: Muestra un campo editable por bloque de la plantilla
    Admin->>UI: Pega texto en un bloque richtext
    UI->>UI: Detecta si el texto ya es Markdown válido
    alt No es Markdown válido
        UI->>AI: Solicita conversión asistida
        AI->>Claude: Prompt de reestructuración a Markdown
        Claude-->>AI: Markdown estructurado
        AI-->>UI: Vista previa del Markdown convertido
        Admin->>UI: Acepta o edita manualmente
    end
    Admin->>UI: Asigna tipo, categoría, tags, fecha
    UI->>API: POST /api/posts { templateId, blocksEs, blocksEn, ... }
    API->>DB: insertOne
    DB-->>API: post creado
    API-->>UI: 201 Created
```

### Flujo: creación desde WhatsApp/MCP con PDF o URL (Fase 7F, planeado)

```mermaid
sequenceDiagram
    actor WAUser as Admin (WhatsApp)
    participant MCP as /api/mcp/route (create_post_from_media)
    participant Extract as lib/ai/extract.ts
    participant PdfParse as pdf-parse
    participant Claude as Claude API
    participant DB as MongoDB (posts)

    WAUser->>MCP: templateId + PDF adjunto (o URL) + imágenes
    alt Entrada es PDF
        MCP->>Extract: extractFromPdf(buffer)
        Extract->>PdfParse: parse(buffer) → texto plano
        PdfParse-->>Extract: texto extraído
    else Entrada es URL
        MCP->>Extract: extractFromUrl(url)
        Extract->>Extract: fetch + strip HTML → texto plano
    end
    Extract->>Claude: Prompt "estructura este texto en bloques Markdown"
    Claude-->>Extract: Markdown estructurado por bloque
    Extract-->>MCP: blocksEs/blocksEn generados + referencia a la fuente (pdfUrl/externalUrl)
    MCP->>DB: insertOne (post con status draft, requiere revisión antes de publicar)
    DB-->>MCP: post creado
    MCP-->>WAUser: confirmación con slug/id del borrador
```

### Resolución de la API key de IA (admin vs. .env)

```mermaid
flowchart TD
    Start[Cualquier llamada a Claude] --> Resolve[lib/ai-config.ts: resolveAiConfig]
    Resolve --> CheckDb{¿Existe doc en Mongo ai_config?}
    CheckDb -->|Sí| Decrypt[Descifrar AES-256-GCM]
    Decrypt --> DecryptOk{¿Descifrado exitoso?}
    DecryptOk -->|Sí| UseAdmin[Usar key configurada por el admin]
    DecryptOk -->|No| Fallback
    CheckDb -->|No| Fallback[Usar ANTHROPIC_API_KEY de .env]
    UseAdmin --> Done[apiKey + model resueltos]
    Fallback --> HasEnvKey{¿.env tiene key?}
    HasEnvKey -->|Sí| Done
    HasEnvKey -->|No| NullResult[null — llamador debe manejar 'IA no configurada']
```

## Pendiente para Fase 11

- [ ] Diagrama de clases completo (agregar SiteText, AdminUser, AuthCode, ContactSubmission a lo ya documentado arriba).
- [ ] Máquina de estados: magic link (`issued` → `verified` / `expired` / `too_many_attempts`).
- [ ] Máquina de estados: circuit breaker (`CLOSED` → `OPEN` → `HALF_OPEN` → `CLOSED`).
- [ ] Diagrama de secuencia: flujo completo de login admin (request-code → Mailpit/Resend → verify-code → JWT → cookie de sesión).
- [ ] Modelo de persistencia (ERD lógico completo de las colecciones Mongo).
