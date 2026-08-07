import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/posts";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { postTypeSchema, postCategorySchema } from "@/lib/posts-taxonomy";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { PostsFeed } from "@/components/marketing/posts-feed";
import { PostsFilters } from "@/components/marketing/posts-filters";
import { PostsPagination } from "@/components/marketing/posts-pagination";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "articles" });
  return { title: t("title") };
}

type SearchParams = {
  q?: string;
  inContent?: string;
  types?: string;
  category?: string;
  tags?: string;
  from?: string;
  to?: string;
  page?: string;
};

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "articles" });
  const sp = await searchParams;

  const postTypes = sp.types
    ? sp.types
        .split(",")
        .filter(Boolean)
        .map((t) => postTypeSchema.safeParse(t))
        .filter((r) => r.success)
        .map((r) => r.data)
    : undefined;

  const categoryResult = sp.category ? postCategorySchema.safeParse(sp.category) : null;
  const page = Math.max(1, Number(sp.page) || 1);

  // Regla de negocio: dateTo nunca puede ser menor a dateFrom — si el query
  // param llega inválido (manipulado a mano), se ignora dateTo en vez de
  // producir un rango vacío silencioso o un error 500.
  const dateFrom = sp.from ? new Date(sp.from) : undefined;
  const dateToRaw = sp.to ? new Date(sp.to) : undefined;
  const dateTo = dateToRaw && dateFrom && dateToRaw < dateFrom ? undefined : dateToRaw;

  const { posts, totalPages } = await listPublishedPosts(locale, {
    postTypes,
    categories: categoryResult?.success ? [categoryResult.data] : undefined,
    tags: sp.tags ? sp.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    query: sp.q,
    searchInContent: sp.inContent === "true",
    dateFrom,
    dateTo,
    page,
  });

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-content px-6 py-20">
        <SectionEyebrow>{t("eyebrow")}</SectionEyebrow>
        <h1 className="mt-5 max-w-3xl font-display text-display-xl font-medium text-ink">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{t("subtitle")}</p>

        <div className="mt-10">
          <PostsFilters
            labels={{
              searchPlaceholder: t("filters.search"),
              searchInContent: t("filters.searchInContent"),
              typeLabel: t("filters.type"),
              categoryLabel: t("filters.category"),
              tagsPlaceholder: t("filters.tagsPlaceholder"),
              dateFrom: t("filters.dateFrom"),
              dateTo: t("filters.dateTo"),
              apply: t("filters.apply"),
              clear: t("filters.clear"),
              dateError: t("filters.dateError"),
              showFilters: t("filters.showFilters"),
              hideFilters: t("filters.hideFilters"),
            }}
          />
        </div>

        <div className="mt-10">
          <PostsFeed posts={posts} locale={locale} emptyLabel={t("empty")} />
        </div>

        <PostsPagination page={page} totalPages={totalPages} />
      </div>
    </section>
  );
}
