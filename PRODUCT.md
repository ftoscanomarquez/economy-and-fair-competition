# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) + TypeScript, decidido explícitamente por el usuario (no delegado). Tailwind CSS con tokens OKLCH, Radix UI + Framer Motion, MongoDB Atlas, next-intl (ES/EN), Pino, Resend/Mailpit. Ver `AGENTS.md` §1 y §3 para el detalle completo y la justificación de cada elección.

## Users

**Usuario primario:** empresas nacionales e internacionales (in-house counsel, dirección general, comercio exterior/logística) que operan importación, exportación o comercio transfronterizo y necesitan asesoría legal especializada en aduanas, defensa comercial o propiedad intelectual — situación típica: enfrentan una investigación antidumping, una clasificación arancelaria compleja, una auditoría aduanera, o buscan estructurar operaciones bajo tratados (T-MEC) de forma segura.

**Usuario secundario:** el equipo administrativo de la propia firma (rol "Administrador"), que gestiona el contenido bilingüe del sitio y publica Artículos y Notas, incluyendo vía WhatsApp desde el celular sin pasar por un editor de escritorio.

## Product Purpose

Sitio web corporativo institucional que presenta a Economy and Fair Competition como una firma de alto prestigio internacional en Comercio Exterior, Derecho Aduanero y Propiedad Intelectual e Industrial, y que convierte visitas de potenciales clientes corporativos en contactos calificados. Éxito = un visitante entiende en los primeros segundos qué resuelve la firma, confía en su autoridad institucional (trayectoria, participación OMC/TLCAN/T-MEC), y completa el formulario de contacto o llama directamente.

## Positioning

Firma boutique altamente especializada (no generalista) con **experiencia institucional verificable en mecanismos internacionales de solución de controversias** (OMC, paneles TLCAN Capítulo XIX, paneles T-MEC Capítulo 10) — un posicionamiento que un despacho generalista de comercio exterior no puede copiar honestamente porque requiere trayectoria acumulada real, no solo declarada. El mensaje se sostiene institucionalmente (como "Economy and Fair Competition"), nunca a través de la reputación de un abogado individual.

## Operating Context

- El contenido fuente proviene de una firma real preexistente (Uruchurtu & Abogados Consultores, S.C., operando como `uruchurtuabogados.com`) cuyo copy y estructura de información se usan como base, pero **despersonalizados por completo**: cero nombres propios de abogados en cualquier texto público.
- Los "perfiles individuales" de la firma original (experiencia profesional, áreas de especialización de cada socio) se funden en: (a) los 10 servicios institucionales, (b) las 4 áreas de especialización global, (c) el copy de "Quiénes Somos". Ver el mapeo completo en `AGENTS.md` §4.
- El sitio opera en dos idiomas simétricos (ES default, EN), con URLs explícitas por idioma (`/es/...`, `/en/...`).
- Existe un modo de edición en vivo para administradores autenticados (magic link de 6 dígitos), que permite editar cualquier texto de la landing directamente sobre la página, en ambos idiomas, sin pasar por un CMS externo.
- La publicación de Artículos y Notas puede originarse también desde WhatsApp vía un servidor MCP, pensado para que el equipo publique desde el celular sin fricción.

## Capabilities and Constraints

**Funcionalidad confirmada:**
- Home institucional con resumen de Quiénes Somos, Misión/Visión, 8 Valores, 10 Servicios, 4 Áreas de especialización global (con modal de detalle), carrusel de 10 industrias (con modal de retos/soluciones), Nuestra Garantía, CTA de contacto.
- Páginas secundarias: `/quienes-somos`, `/servicios`.
- `/articulos-y-notas`: feed de publicaciones con descarga de PDF oficial o enlace a artículo externo.
- `/contacto`: formulario (Nombre, Empresa, Correo, Teléfono, Área de Interés, Mensaje) + datos directos + mapa.
- Panel admin (`/admin`) con login por magic link (6 dígitos), edición inline bilingüe, drawer de gestión de posts y textos globales, asistente de redacción IA.
- Servidor MCP (`/api/mcp/route`) con herramientas `list_posts`, `get_post_detail`, `create_post_from_media`, `update_post`, `delete_post`, protegidas por validación JWT/teléfono de administrador.

**Restricciones duras (no negociables, confirmadas con el usuario):**
- Cero nombres propios de abogados en cualquier página o texto público.
- Los 10 servicios y las 4 áreas de especialización global son fijos según el brief; no se agregan ni quitan sin aprobación explícita.
- Industrias finales: exactamente 10 — se excluye Aeroespacial, se incluye Marítimo.
- Ninguna cifra, caso o cliente se inventa; todo dato institucional debe rastrearse a las fuentes de contenido existentes.

**Explícitamente fuera de alcance del MVP:** pasarela de pagos (no aplica, no es transaccional), RustFS/S3 (almacenamiento es disco local), Vault/Traefik/SonarQube/Elasticsearch+Kibana activos (documentados como referencia, no implementados).

## Brand Commitments

- Nombre: **Economy and Fair Competition**.
- Correo institucional: `contacto@economyandfaircompetition.com`.
- Tono de voz: institucional, nunca individual ("nuestro equipo", "la firma"); autoridad técnica sin frialdad corporativa genérica.
- Paleta y tipografía ya fijadas por el cliente como restricción de marca (ver `DESIGN.md`): fondo crema/marfil, acento azul cobalto, texto azul marino profundo; tipografía display serif de exhibición + sans técnica para cuerpo.

## Evidence on Hand

- Copy completo de la firma de referencia (`Uruchurtu & Abogados Consultores, S.C.`) capturado en `URUCHURTU.md`: Quiénes Somos, Historia, Misión, Visión, Valores, los 3 perfiles de socios (a despersonalizar), los 10 servicios, las 10 industrias originales (incluye Aeroespacial, a excluir), garantía institucional.
- Reglas de transformación de contenido explícitas del cliente en `ECONOMY-AND-FAIR-COMPETITION.md`.
- **Ausencias que el trabajo futuro no debe fabricar:** no hay testimonios de clientes reales, no hay casos de estudio publicables con detalle, no hay cifras de facturación o tamaño de equipo — no se inventan.

## Product Principles

1. **Autoridad institucional, nunca personal.** Cada pieza de copy y cada componente de UI refuerza que la experiencia pertenece a la firma como entidad, no a individuos.
2. **Precisión técnica legible.** El contenido es legal/técnico (aduanas, tratados, antidumping); el diseño debe hacerlo escaneable y confiable sin diluirlo ni sobre-simplificarlo.
3. **Bilingüe simétrico de verdad.** ES y EN son ciudadanos de primera clase con paridad total de contenido y UX, no una traducción secundaria.
4. **Contenido gobernado, no improvisado.** Todo texto público es editable de forma controlada (admin autenticado, auditoría de cambios) en vez de hardcodeado, porque la firma necesita poder corregir/actualizar su propio mensaje sin depender de un desarrollador.
5. **Ningún dato inventado.** La confianza institucional de una firma legal se destruye con una sola afirmación no verificable; todo dato factual se rastrea a una fuente confirmada.

## Accessibility & Inclusion

Sin requisito de accesibilidad específico más allá del estándar (WCAG AA como piso razonable para un sitio institucional B2B), a validar con audit en Fase 10. Contenido bilingüe (ES/EN) es en sí mismo un requisito de inclusión ya cubierto por el alcance del producto.
