import Image from "next/image";
import type { HeroBlockContent } from "@/lib/blocks/schema";

export function HeroBlock({ block }: { block: HeroBlockContent }) {
  return (
    <div className="flex flex-col gap-6">
      {block.imageUrl ? (
        <div className="overflow-hidden rounded-md border border-border">
          <Image
            src={block.imageUrl}
            alt=""
            width={1200}
            height={630}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      ) : null}
      {block.title ? (
        <h1 className="font-display text-display-xl font-medium text-ink">{block.title}</h1>
      ) : null}
    </div>
  );
}
