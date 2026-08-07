import { redirect, notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getServerSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { PostForm } from "@/components/admin/post-form";
import type { TemplateBlock, ContentBlock } from "@/lib/blocks/schema";
import type { PostCategory, PostType } from "@/lib/posts-taxonomy";

export const metadata = { title: "Editar publicación" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) redirect(`/${locale}/admin/login`);

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    notFound();
  }

  const db = await getDb();
  const [post, templateDocs] = await Promise.all([
    db.collection("posts").findOne({ _id: objectId }),
    db.collection("templates").find({}).sort({ name: 1 }).toArray(),
  ]);

  if (!post) notFound();

  const templates = templateDocs.map((doc) => ({
    id: String(doc._id),
    name: doc.name as string,
    blocks: doc.blocks as TemplateBlock[],
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">Panel administrativo</p>
      <h1 className="mt-3 font-display text-display-lg font-medium text-ink">Editar publicación</h1>

      <div className="mt-10">
        <PostForm
          locale={locale}
          templates={templates}
          postId={id}
          initial={{
            slug: post.slug,
            templateId: post.templateId ? String(post.templateId) : null,
            postType: post.postType as PostType,
            category: (post.category as PostCategory) ?? null,
            tags: post.tags ?? [],
            titleEs: post.titleEs,
            titleEn: post.titleEn,
            summaryEs: post.summaryEs,
            summaryEn: post.summaryEn,
            blocksEs: (post.blocksEs as ContentBlock[]) ?? [],
            blocksEn: (post.blocksEn as ContentBlock[]) ?? [],
            thumbnailUrl: (post.thumbnailUrl as string | null) ?? null,
            status: post.status,
          }}
        />
      </div>
    </div>
  );
}
