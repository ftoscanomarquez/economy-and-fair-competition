import { getDb } from "./db";
import type { Locale } from "./i18n";
import type { ContentBlock } from "./blocks/schema";
import type { PostCategory, PostType } from "./posts-taxonomy";

export type PostDoc = {
  _id: unknown;
  slug: string;
  templateId: unknown | null;
  postType: PostType;
  category: PostCategory | null;
  tags: string[];
  titleEs: string;
  titleEn: string;
  summaryEs: string | null;
  summaryEn: string | null;
  blocksEs: ContentBlock[] | null;
  blocksEn: ContentBlock[] | null;
  thumbnailUrl: string | null;
  pdfUrl: string | null;
  externalUrl: string | null;
  status: "draft" | "published";
  publishedAt: Date | null;
  createdAt: Date;
  source: string | null;
};

export type PostSummary = {
  id: string;
  slug: string;
  postType: PostType;
  category: PostCategory | null;
  tags: string[];
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  pdfUrl: string | null;
  externalUrl: string | null;
  publishedAt: Date | null;
};

export type PostDetail = PostSummary & { blocks: ContentBlock[] };

function toSummary(doc: PostDoc, locale: Locale): PostSummary {
  return {
    id: String(doc._id),
    slug: doc.slug,
    postType: doc.postType,
    category: doc.category,
    tags: doc.tags ?? [],
    title: locale === "en" ? doc.titleEn : doc.titleEs,
    summary: (locale === "en" ? doc.summaryEn : doc.summaryEs) ?? null,
    thumbnailUrl: doc.thumbnailUrl,
    pdfUrl: doc.pdfUrl,
    externalUrl: doc.externalUrl,
    publishedAt: doc.publishedAt,
  };
}

export type PostListFilters = {
  postTypes?: PostType[];
  categories?: PostCategory[];
  tags?: string[];
  query?: string;
  searchInContent?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
};

export type PostListResult = {
  posts: PostSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listPublishedPosts(locale: Locale, filters: PostListFilters = {}): Promise<PostListResult> {
  const db = await getDb();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 9));

  const mongoFilter: Record<string, unknown> = { status: "published" };

  if (filters.postTypes) {
    // Array vacío = ambos checkboxes desmarcados = sin resultados posibles.
    // Array con los 2 tipos = equivalente a "sin filtro" (no se agrega condición).
    if (filters.postTypes.length === 0) {
      return { posts: [], total: 0, page, pageSize, totalPages: 1 };
    }
    if (filters.postTypes.length === 1) {
      mongoFilter.postType = filters.postTypes[0];
    }
  }
  if (filters.categories && filters.categories.length > 0) {
    mongoFilter.category = { $in: filters.categories };
  }
  if (filters.tags && filters.tags.length > 0) {
    mongoFilter.tags = { $in: filters.tags };
  }
  if (filters.dateFrom || filters.dateTo) {
    const range: Record<string, Date> = {};
    if (filters.dateFrom) range.$gte = filters.dateFrom;
    if (filters.dateTo) range.$lte = filters.dateTo;
    mongoFilter.publishedAt = range;
  }

  if (filters.query && filters.query.trim()) {
    const escaped = filters.query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const titleRegex = { $regex: escaped, $options: "i" };

    if (filters.searchInContent) {
      const blocksField = locale === "en" ? "blocksEn" : "blocksEs";
      mongoFilter.$or = [
        { titleEs: titleRegex },
        { titleEn: titleRegex },
        { [`${blocksField}.markdown`]: titleRegex },
        { [`${blocksField}.title`]: titleRegex },
      ];
    } else {
      mongoFilter.$or = [{ titleEs: titleRegex }, { titleEn: titleRegex }];
    }
  }

  const coll = db.collection<PostDoc>("posts");
  const total = await coll.countDocuments(mongoFilter);
  const docs = await coll
    .find(mongoFilter)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return {
    posts: docs.map((doc) => toSummary(doc, locale)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPostBySlug(slug: string, locale: Locale): Promise<PostDetail | null> {
  const db = await getDb();
  const doc = await db.collection<PostDoc>("posts").findOne({ slug, status: "published" });
  if (!doc) return null;

  const blocks = (locale === "en" ? doc.blocksEn : doc.blocksEs) ?? [];

  return {
    ...toSummary(doc, locale),
    blocks,
  };
}
