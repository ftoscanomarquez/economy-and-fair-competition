Aplica las directrices de la skill @frontend-design para la dirección estética y el sistema @impeccable para los tokens de código. 

Usa la skill @toscaprompt leela completa y ejecuta cada una de sus directrices por ejemplo leer skills de patrones de diseño que estan definidas ahi, hacer toda la documentacion que menciona esa skill, construir todo en fases y cada fase debe de tener sus propias validaciones. Ademas hay que crear un archivo History.md que contendra el detalle de todo lo que se requiere para saber en que parte de la fase nos encontramos para que en caso de que se vaya la luz se pueda retormar el trabajo a partir de donde se quedo ya que debe de tener el registro de lo que se ha construido y completado.

Actúa como un Diseñador UI/UX Principal y Desarrollador Full-Stack especializado en Next.js (App Router), Tailwind CSS y Sistemas de Diseño.

Debes diseñar y construir el sitio web corporativo de "Economy and Fair Competition", una firma internacional de alto prestigio especializada en Comercio Exterior, Derecho Aduanero y Propiedad Intelectual e Industrial.

APLICACIÓN DE SKILLS:
1. @frontend-design: Dirección estética moderna, sofisticada y de alta gama. Usa tipografía de exhibición elegante (Serif moderna tipo Playfair / Instrument) para encabezados y Sans-Serif técnica para el cuerpo.
2. @impeccable: Tokens de color en espacio OKLCH.
   - Fondos: Crema suave / Marfil (#FAF9F6 / oklch(0.98 0.01 85)).
   - Acentos: Azul Cielo / Cobalto tenue (#38BDF8 / oklch(0.70 0.12 230)).
   - Contraste / Texto: Azul Marino Profundo / Noche (#0F172A / oklch(0.22 0.04 250)).
   - Retícula de 8px y animaciones fluidas sin rebotes.

----------------------------------------------------------------------
REORGANIZACIÓN Y CONSOLIDACIÓN DEL CONTENIDO (REGLAS OBLIGATORIAS)
----------------------------------------------------------------------

1. MARCA INSTITUCIONAL (SIN NOMBRES INDIVIDUALES):
   No se deben incluir perfiles ni nombres de abogados individuales. Toda la experiencia de más de 25 años se presenta como la "Experiencia e Infraestructura Global de Economy and Fair Competition".

2. SECCIÓN INSTITUCIONAL: QUIÉNES SOMOS, HISTORIA, MISIÓN, VISIÓN Y VALORES:
   Página `/quienes-somos` (con resumen visual en Home) basada en la trayectoria de controversias en OMC, TLCAN y T-MEC, junto con Misión, Visión y Valores en tarjetas interactivas.

   - Quiénes Somos & Historia: Más de 28 años de trayectoria acompañando a empresas en defensa comercial, cumplimiento aduanero, regulación transfronteriza y propiedad intelectual. Resalta la participación en Mecanismos de Solución de Controversias de la OMC, TLCAN y T-MEC.
   - Misión (Mejorada): Proporcionar servicios y soluciones legales de vanguardia que brinden certeza, seguridad jurídica y competitividad a nuestros clientes en sus operaciones globales.
   - Visión (Mejorada): Consolidarnos como la firma líder y más desarrollada en México y la región en comercio exterior, derecho aduanero y propiedad intelectual, operando bajo los más estrictos estándares éticos.
   - Valores (Grid de Tarjetas Elegantes): Integridad, Responsabilidad, Experiencia, Excelencia, Compromiso, Calidad, Profesionalismo y Respuesta Proactiva.   

3. SECCIÓN "NUESTROS SERVICIOS" (10 SERVICIOS INTEGRALES):
  Módulo interactivo en la Home y en `/servicios` con tarjetas de servicios elegantes e íconos conceptuales:
   1. Consultoría Estratégica en Comercio Internacional y Normativa Aduanera.
   2. Clasificación Arancelaria y Valoración Técnica en Aduana.
   3. Optimización de Tratados Comerciales y Reglas de Origen (T-MEC / TLCs).
   4. Gobierno Corporativo de Cumplimiento (Import/Export Compliance).
   5. Defensa Comercial, Antidumping y Cuotas Compensatorias.
   6. Litigio Especializado y Solución de Controversias Transfronterizas.
   7. Gestión y Administración de Programas de Fomento (IMMEX, PROSEC, Drawback).
   8. Auditorías Aduaneras Preventivas y Diagnóstico Normativo.
   9. Certificación y Verificación Estratégica de Origen.
   10. Relaciones Institucionales, Asesoría Regulatoria y Propiedad Intelectual/Industrial.

4. CONSOLIDACIÓN DE LAS 4 ÁREAS DE ESPECIALIZACIÓN GLOBAL (MODAL INTERACTIVO):
   Grid interactivo con imágenes conceptuales y Modales de detalle al hacer clic:
   A) Comercio Exterior, Aduanas y Cumplimiento Transfronterizo
   B) Defensa Comercial, Antidumping y Prácticas Desleales
   C) Propiedad Intelectual e Industrial
   D) Consultoría Financiera y Regulación Bancaria

5. CARRUSEL DE SECTORES E INDUSTRIAS (MODAL INTERACTIVO):
   Carrusel fluido con fotografías conceptuales. Incluye Automotriz, Energía, Minería, Textil, Electrónica, Farmacéutica, Manufactura, Alimentos, Logística y Transporte, y MARÍTIMO (excluir Aeroespacial). Cada sector abre un modal con retos y soluciones específicas.

6. SECCIÓN DE CONTACTO Y UBICACIÓN:
   Formulario de contacto conectado a API Resend, datos directos y Google Maps interactivo personalizado con la paleta de la firma.

   - Formulario de Contacto Elegante: Nombre, Empresa, Correo, Teléfono, Área de Interés y Mensaje.
   - Datos Directos de Atención: Teléfonos, correos (`contacto@economyandfaircompetition.com`) y horarios.
   - Integración de Google Maps / Ubicación Física: Mapa interactivo estilizado con los tonos crema/azul cobalto de la firma.

----------------------------------------------------------------------
PERFIL ADMIN EN LANDING PAGE: EDICIÓN EN VIVO BILINGÜE (ES / EN)
----------------------------------------------------------------------

Implementa un sistema de gestión in-site para administradores autenticados:

1. AUTENTICACIÓN Y MODO EDICIÓN:
   - Acceso discreto para Administradores mediante Modal de Login (`/admin/login` o acceso rápido en Footer).
   - Uso de JWT / Sesión protegida. Al activar el "Modo Admin", la landing page habilita controles visuales de edición sobre los textos.

2. EDICIÓN EN SITIO Y REDACCIÓN BILINGÜE:
   - Interruptor de Idioma (ES / EN) en la barra de herramientas de administración para editar contenido en ambos idiomas en tiempo real.
   - Capacidad de corregir o reescribir cualquier texto de la landing page (títulos, descripciones de servicios, textos institucionales) y de las publicaciones.
   - Botón de "Asistente de Redacción IA" para reescribir, traducir o perfeccionar la redacción de cualquier párrafo directamente en el navegador.

3. PANEL LATERAL DE GESTIÓN (DRAWER ADMIN):
   - Menú deslizable para buscar, agregar, modificar o eliminar publicaciones/notas y textos globales de la web.

----------------------------------------------------------------------
SECCIÓN DE "PUBLICACIONES Y NOTAS" E INTEGRACIÓN MCP MULTIMODAL
----------------------------------------------------------------------

1. EXPERIENCIA UI DE LECTURA (FRONTEND):
   - Feed de publicaciones con miniatura (thumbnail), título, fecha y categoría.
   - Modal al hacer clic con el resumen ejecutivo estructurado y botones directos para:
     * "Descargar PDF Oficial" (si se adjuntó un PDF).
     * "Leer Artículo Completo" (si proviene de una URL externa).

2. ARQUITECTURA DEL SERVIDOR MCP + GESTIÓN VÍA WHATSAPP CON SEGURIDAD:
   - `list_posts`: Consulta de publicaciones.
   - `get_post_detail`: Detalle de publicación por ID o slug.
   - `create_post_from_media`: Alta automática procesando texto, imágenes (thumbnail), archivos PDF (almacenamiento cloud) o enlaces externos enviados desde WhatsApp.
   - `update_post` y `delete_post`: Modificación y eliminación protegidas mediante validación de JWT / teléfono de administrador.

3. RUTAS API EN NEXT.JS (App Router):
   - `/api/posts`: Handlers `GET` (Público) y `POST` (Protegido).
   - `/api/posts/[id]`: Handlers `GET`, `PUT` y `DELETE`.
   - `/api/content/site-texts`: Route Handler para guardar los textos bilingües de la landing page.
   - `/api/mcp/route`: Endpoint receptor de llamadas MCP desde WhatsApp.

----------------------------------------------------------------------
STACK TÉCNICO GENERAL
----------------------------------------------------------------------

- Estilos: Tailwind CSS con Tokens OKLCH.
- Componentes UI: Radix UI / Shadcn UI y Framer Motion.
- Email Router: Resend API Handler (`/api/contact`).

- Framework: Next.js 16 (App Router) + TypeScript.
- Componentes UI: Tailwind CSS, Radix UI / Shadcn UI (Modales/Dialogs) y Framer Motion para animaciones del carrusel.
- Soporte i18n: Configuración para Español (`es`) e Inglés (`en`).
- Formulario de Contacto: Conectado a un Route Handler API (`/api/contact`) usando Resend para el envío automático de correos con notificación a la firma.
- Backend Admin & MCP Integración:
  * Ruta protegida `/admin/posts` para la gestión de Artículos y Notas.
  * Ruta API `/api/mcp/whatsapp` preparada para conectarse con un MCP Server que automatice la difusión de noticias a canales de WhatsApp.

Para el caso de desarrollo la parte de login para el admin hay que hacerlo con  Magiclink con clabe de 6 digitos. en desarrollo usa el mailpit que tengo configurado  │ Mailpit    │ http://localhost:8025 │ admin            │ magiclink123 y se accedera colocando /admin al path


Genera la estructura del proyecto, los componentes del Perfil Admin Bilingüe con Inline Editing, los componentes de lectura de Notas, los Route Handlers de API y la configuración de Tailwind CSS con los tokens OKLCH.