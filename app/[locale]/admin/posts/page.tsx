import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AdminPostsList } from "@/components/admin/admin-posts-list";
import { Plus } from "lucide-react";
import type { ContentBlock } from "@/lib/blocks/schema";
import type { PostCategory, PostType } from "@/lib/posts-taxonomy";

export const metadata = { title: "Artículos y Notas" };

export default async function AdminPostsListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) redirect(`/${locale}/admin/login`);

  const db = await getDb();
  const docs = await db.collection("posts").find({}).sort({ createdAt: -1 }).toArray();

  const posts = docs.map((doc) => ({
    id: String(doc._id),
    titleEs: doc.titleEs as string,
    status: doc.status as "draft" | "published",
    postType: doc.postType as PostType,
    category: (doc.category as PostCategory) ?? null,
    blocksEs: (doc.blocksEs as ContentBlock[]) ?? [],
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">Panel administrativo</p>
          <h1 className="mt-3 font-display text-display-lg font-medium text-ink">Artículos y Notas</h1>
        </div>
        <Button asChild variant="accent">
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4" />
            Nueva publicación
          </Link>
        </Button>
      </div>

      <AdminPostsList posts={posts} />
    </div>
  );
}
