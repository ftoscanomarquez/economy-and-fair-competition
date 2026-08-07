import type { ContentBlock } from "@/lib/blocks/schema";
import { HeroBlock } from "./hero-block";
import { RichTextBlock } from "./rich-text-block";
import { TwoColumnBlock } from "./two-column-block";
import { ChartBlock } from "./chart-block";

/**
 * Dispatcher de renderizado público: recorre post.blocksEs/blocksEn (ya
 * resuelto al locale por lib/posts.ts) y pinta el componente correcto por
 * cada block.type. Usado por la página de detalle de Artículo/Nota
 * (Fase 7D) — ver SPECIFICATION-SUMMARY.md §1.
 */
export function PostBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-12">
      {blocks.map((block) => {
        switch (block.type) {
          case "hero":
            return <HeroBlock key={block.id} block={block} />;
          case "richtext":
            return <RichTextBlock key={block.id} block={block} />;
          case "twoColumn":
            return <TwoColumnBlock key={block.id} block={block} />;
          case "chart":
            return <ChartBlock key={block.id} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
