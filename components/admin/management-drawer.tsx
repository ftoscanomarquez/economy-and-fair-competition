"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search, Trash2, FileText, Plus, Pencil } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useToast } from "@/context/ToastContext";

type PostRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
};

export function ManagementDrawer({
  open,
  onOpenChange,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
}) {
  const t = useTranslations("admin.drawer");
  const { notify } = useToast();
  const [query, setQuery] = React.useState("");
  const [posts, setPosts] = React.useState<PostRow[] | null>(null);

  const loadPosts = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/posts?locale=${locale}&includeDrafts=true`);
      const data = await res.json();
      if (!res.ok) {
        notify({ title: t("loadError"), variant: "error", technicalDetail: data.error });
        setPosts([]);
        return;
      }
      setPosts(data.posts);
    } catch (error) {
      notify({
        title: t("connectionError"),
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
      setPosts([]);
    }
  }, [locale, notify, t]);

  React.useEffect(() => {
    if (!open) return;
    // Sincroniza el drawer con el sistema externo (API de posts) al abrirse;
    // el setState real ocurre dentro de la promesa resuelta, no de forma síncrona.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPosts();
  }, [open, loadPosts]);

  const loading = posts === null;

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(t("deleteConfirm", { title }))) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        notify({ title: t("deleteError"), variant: "error", technicalDetail: data.error });
        return;
      }
      notify({ title: t("deleteSuccess") });
      setPosts((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
    } catch (error) {
      notify({
        title: t("connectionError"),
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const filtered = (posts ?? []).filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right">
        <DrawerTitle className="font-display text-xl font-medium text-ink">{t("title")}</DrawerTitle>
        <DrawerDescription className="mt-1 text-sm text-ink-soft">{t("description")}</DrawerDescription>

        <Button asChild variant="accent" size="sm" className="mt-4 w-full">
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4" />
            Nueva publicación
          </Link>
        </Button>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {loading ? (
            <p className="py-8 text-center text-sm text-ink-faint">{t("loading")}</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">{t("noResults")}</p>
          ) : (
            filtered.map((post) => (
              <li
                key={post.id}
                className="flex items-start gap-3 rounded-md border border-border p-3"
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{post.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={post.status === "published" ? "accent" : "default"}>
                      {post.status === "published" ? t("published") : t("draft")}
                    </Badge>
                    {post.category ? <span className="text-xs text-ink-faint">{post.category}</span> : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button asChild variant="ghost" size="sm" aria-label="Editar">
                    <Link href={`/admin/posts/${post.id}`}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(post.id, post.title)}
                    aria-label={t("deleteLabel", { title: post.title })}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}
