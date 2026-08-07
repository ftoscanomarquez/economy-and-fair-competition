import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle } from "lucide-react";
import type { RichTextBlockContent } from "@/lib/blocks/schema";
import { isFileMissing } from "@/lib/uploads";

/**
 * Server Component async: los enlaces a /documents/* dentro del Markdown
 * (agregados automáticamente por la extracción con IA, ver lib/ai/extract.ts
 * → "Documento original") se verifican contra el disco antes de renderizar.
 * Si el admin ya eliminó ese archivo desde /admin/files, el enlace se
 * reemplaza por un aviso "Documento depurado" en vez de un link roto
 * silencioso — el resto del Markdown se renderiza con normalidad.
 */
export async function RichTextBlock({ block }: { block: RichTextBlockContent }) {
  if (!block.markdown.trim()) return null;

  return (
    <div className="prose prose-lg max-w-prose prose-headings:font-display prose-headings:font-medium prose-headings:text-ink prose-p:text-ink-soft prose-strong:text-ink prose-a:text-accent-deep">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownLink }}>
        {block.markdown}
      </ReactMarkdown>
    </div>
  );
}

async function MarkdownLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  if (href?.startsWith("/documents/") && (await isFileMissing(href))) {
    return (
      <span className="inline-flex items-center gap-1 text-ink-faint no-underline" title="El documento original ya fue eliminado del servidor">
        <AlertTriangle className="inline h-3.5 w-3.5" aria-hidden="true" />
        {children} (documento depurado)
      </span>
    );
  }

  return (
    <a href={href} target={href?.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer">
      {children}
    </a>
  );
}
