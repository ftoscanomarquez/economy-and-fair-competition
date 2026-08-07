import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TwoColumnBlockContent } from "@/lib/blocks/schema";
import { cn } from "@/lib/utils";

export function TwoColumnBlock({ block }: { block: TwoColumnBlockContent }) {
  const imageFirst = block.imagePosition === "left";

  return (
    <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
      <div className={cn(imageFirst ? "sm:order-1" : "sm:order-2")}>
        {block.imageUrl ? (
          <div className="overflow-hidden rounded-md border border-border">
            <Image src={block.imageUrl} alt="" width={600} height={450} className="h-auto w-full object-cover" />
          </div>
        ) : null}
      </div>
      <div className={cn("prose max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-ink-soft prose-strong:text-ink", imageFirst ? "sm:order-2" : "sm:order-1")}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
