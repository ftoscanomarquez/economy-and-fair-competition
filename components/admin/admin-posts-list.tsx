"use client";

/**
 * Lista de publicaciones del panel admin (/admin/posts) con búsqueda por
 * título y contenido — filtrado en cliente porque esta vista ya recibe TODAS
 * las publicaciones del servidor (a diferencia del listado público, que sí
 * pagina). Útil sobre todo cuando el número de Artículos/Notas crece y
 * encontrar uno concreto para editar deja de ser trivial con solo scroll.
 */
import * as React from "react";
import { Search, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { POST_TYPE_LABELS, CATEGORY_LABELS, type PostCategory, type PostType } from "@/lib/posts-taxonomy";
import type { ContentBlock } from "@/lib/blocks/schema";

type AdminPostListItem = {
  id: string;
  titleEs: string;
  status: "draft" | "published";
  postType: PostType;
  category: PostCategory | null;
  blocksEs: ContentBlock[];
};

function blockText(block: ContentBlock): string {
  if (block.type === "hero") return block.title;
  if (block.type === "richtext") return block.markdown;
  if (block.type === "twoColumn") return block.markdown;
  if (block.type === "chart") return block.title;
  return "";
}

function matchesQuery(post: AdminPostListItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  if (post.titleEs.toLowerCase().includes(normalized)) return true;
  return post.blocksEs.some((block) => blockText(block).toLowerCase().includes(normalized));
}

export function AdminPostsList({ posts }: { posts: AdminPostListItem[] }) {
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => posts.filter((post) => matchesQuery(post, query)), [posts, query]);

  return (
    <div className="mt-10">
      {posts.length > 0 ? (
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o contenido…"
            className="pl-9"
            aria-label="Buscar publicaciones por título o contenido"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {posts.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-ink-faint" />
            <p className="mt-3 text-sm text-ink-soft">Aún no hay publicaciones.</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-ink-faint" />
            <p className="mt-3 text-sm text-ink-soft">Ninguna publicación coincide con &ldquo;{query}&rdquo;.</p>
          </Card>
        ) : (
          filtered.map((post) => (
            <Link key={post.id} href={`/admin/posts/${post.id}`}>
              <Card className="flex items-center gap-4 p-5 transition-all duration-300 ease-institutional hover:-translate-y-0.5 hover:border-accent-deep/40 hover:shadow-raised">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-deep">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{post.titleEs}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant={post.status === "published" ? "accent" : "default"}>
                      {post.status === "published" ? "Publicado" : "Borrador"}
                    </Badge>
                    <Badge>{POST_TYPE_LABELS[post.postType]?.es ?? post.postType}</Badge>
                    {post.category ? (
                      <span className="text-xs text-ink-faint">{CATEGORY_LABELS[post.category]?.es}</span>
                    ) : null}
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
