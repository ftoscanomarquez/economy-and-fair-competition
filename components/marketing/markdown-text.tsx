import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { looksLikeMarkdown } from "@/lib/markdown-detect";
import { cn } from "@/lib/utils";

/** Quita un único encabezado `# ...` inicial — usado cuando el título ya se muestra por separado (DetailDialog), para no duplicarlo visualmente. */
function stripLeadingHeading(text: string): string {
  return text.replace(/^\s*#\s+.+(\r?\n)+/, "");
}

/**
 * Renderiza texto de un content item (summary/detail) auto-detectando si es
 * Markdown (looksLikeMarkdown) — usado tanto en las tarjetas de las 3
 * grillas (summary) como en el detalle de la modal (detail), para que
 * ambos campos se interpreten de forma consistente.
 */
export function MarkdownText({
  text,
  className,
  plainClassName,
  stripLeadingH1 = false,
}: {
  text: string;
  className?: string;
  /** Clases aplicadas solo cuando el texto NO parece Markdown (caso más común) — usado para preservar el tamaño/peso tipográfico de un título cuando no trae formato explícito, ya que ese estilo no puede expresarse vía prose-* sobre un <span> plano. */
  plainClassName?: string;
  /** Quita el primer `# encabezado` del texto antes de renderizar (el título del item ya se muestra por separado). */
  stripLeadingH1?: boolean;
}) {
  const content = stripLeadingH1 ? stripLeadingHeading(text) : text;

  if (!looksLikeMarkdown(content)) {
    return <span className={cn("whitespace-pre-line", plainClassName ?? className)}>{content}</span>;
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-headings:font-display prose-headings:text-ink prose-p:my-0 prose-p:text-ink-soft prose-strong:text-ink prose-a:text-accent-deep",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
