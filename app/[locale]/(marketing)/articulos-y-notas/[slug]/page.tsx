import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { FileText, ExternalLink, Calendar } from "lucide-react";
import { getPostBySlug } from "@/lib/posts";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostBlockRenderer } from "@/components/marketing/blocks/post-block-renderer";
import { CATEGORY_LABELS, POST_TYPE_LABELS, type PostCategory, type PostType } from "@/lib/posts-taxonomy";

function formatDate(date: Date | null, locale: string) {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const post = await getPostBySlug(slug, locale);
  return { title: post?.title ?? "Artículo no encontrado" };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "articles" });

  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  return (
    <article className="border-b border-border">
      <div className="mx-auto max-w-content px-6 py-20">
        <div className="mx-auto max-w-prose">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{POST_TYPE_LABELS[post.postType as PostType]?.es ?? post.postType}</Badge>
            {post.category ? (
              <Badge variant="accent">{CATEGORY_LABELS[post.category as PostCategory]?.es ?? post.category}</Badge>
            ) : null}
          </div>

          {post.publishedAt ? (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-faint">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(post.publishedAt, locale)}
            </p>
          ) : null}

          <h1 className="mt-3 font-display text-display-lg font-medium text-ink">{post.title}</h1>

          {post.summary ? (
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">{post.summary}</p>
          ) : null}

          {post.pdfUrl || post.externalUrl ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {post.pdfUrl ? (
                <Button asChild variant="accent">
                  <a href={post.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    {t("downloadPdf")}
                  </a>
                </Button>
              ) : null}
              {post.externalUrl ? (
                <Button asChild variant="outline">
                  <a href={post.externalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    {t("readFull")}
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mx-auto mt-12 max-w-prose">
          <PostBlockRenderer blocks={post.blocks} />
        </div>
      </div>
    </article>
  );
}
