import Image from "next/image";
import { FileText, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, POST_TYPE_LABELS, type PostCategory, type PostType } from "@/lib/posts-taxonomy";
import type { PostSummary } from "@/lib/posts";

function formatDate(date: Date | null, locale: string) {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function PostsFeed({
  posts,
  locale,
  emptyLabel,
}: {
  posts: PostSummary[];
  locale: string;
  emptyLabel: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border py-24 text-center">
        <p className="text-ink-soft">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/articulos-y-notas/${post.slug}`}
          className="group flex flex-col overflow-hidden rounded-md border border-border bg-surface text-left shadow-card transition-all duration-300 ease-institutional hover:-translate-y-1 hover:border-accent-deep/40 hover:shadow-raised"
        >
          <div className="relative flex h-40 items-center justify-center overflow-hidden bg-accent-soft/40">
            {post.thumbnailUrl ? (
              <Image
                src={post.thumbnailUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-institutional group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            ) : (
              <FileText className="h-10 w-10 text-accent-deep/50" aria-hidden="true" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{POST_TYPE_LABELS[post.postType as PostType]?.es ?? post.postType}</Badge>
              {post.category ? (
                <Badge variant="accent">{CATEGORY_LABELS[post.category as PostCategory]?.es ?? post.category}</Badge>
              ) : null}
            </div>
            <h3 className="font-display text-lg font-medium leading-snug text-ink">{post.title}</h3>
            {post.summary ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">{post.summary}</p>
            ) : null}
            {post.publishedAt ? (
              <p className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-ink-faint">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDate(post.publishedAt, locale)}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
