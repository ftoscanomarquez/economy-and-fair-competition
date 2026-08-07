"use client";

import * as React from "react";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { POST_CATEGORIES, CATEGORY_LABELS, POST_TYPE_LABELS, type PostCategory } from "@/lib/posts-taxonomy";
import { cn } from "@/lib/utils";

/**
 * Filtros de /articulos-y-notas: sincronizados con query params de la URL
 * (compartibles/guardables), consumidos por lib/posts.ts listPublishedPosts.
 * Reglas de fecha: dateFrom obligatorio si se activa el filtro de fecha,
 * dateTo opcional pero nunca menor a dateFrom (validado aquí y en el
 * backend, ver PostListFilters en lib/posts.ts).
 */
export function PostsFilters({
  labels,
}: {
  labels: {
    searchPlaceholder: string;
    searchInContent: string;
    typeLabel: string;
    categoryLabel: string;
    tagsPlaceholder: string;
    dateFrom: string;
    dateTo: string;
    apply: string;
    clear: string;
    dateError: string;
    showFilters: string;
    hideFilters: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (searchParams.get("q")) count += 1;
    if (searchParams.get("category")) count += 1;
    if (searchParams.get("tags")) count += 1;
    if (searchParams.get("from")) count += 1;
    if (searchParams.get("to")) count += 1;
    const typesParam = searchParams.get("types");
    if (typesParam && typesParam.split(",").filter(Boolean).length < 2) count += 1;
    return count;
  }, [searchParams]);

  // Expandido por defecto solo si ya hay filtros activos en la URL (ej. al volver de un enlace compartido) — de lo contrario, colapsado para no ocupar espacio antes de que el visitante lo pida.
  const [expanded, setExpanded] = React.useState(activeFilterCount > 0);

  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  const [searchInContent, setSearchInContent] = React.useState(searchParams.get("inContent") === "true");
  const [types, setTypes] = React.useState<Set<"articulo" | "nota">>(
    new Set((searchParams.get("types")?.split(",").filter(Boolean) as ("articulo" | "nota")[]) ?? ["articulo", "nota"])
  );
  const [category, setCategory] = React.useState(searchParams.get("category") ?? "");
  const [tags, setTags] = React.useState(searchParams.get("tags") ?? "");
  const [dateFrom, setDateFrom] = React.useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = React.useState(searchParams.get("to") ?? "");
  const [dateError, setDateError] = React.useState(false);

  function toggleType(type: "articulo" | "nota") {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function applyFilters() {
    if (dateTo && dateFrom && dateTo < dateFrom) {
      setDateError(true);
      return;
    }
    setDateError(false);

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (searchInContent) params.set("inContent", "true");
    if (types.size < 2) params.set("types", Array.from(types).join(","));
    if (category) params.set("category", category);
    if (tags.trim()) params.set("tags", tags.trim());
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function clearFilters() {
    setQuery("");
    setSearchInContent(false);
    setTypes(new Set(["articulo", "nota"]));
    setCategory("");
    setTags("");
    setDateFrom("");
    setDateTo("");
    setDateError(false);
    router.push(pathname);
  }

  return (
    <div className="rounded-md border border-border bg-surface">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls="posts-filters-panel"
        className="flex w-full items-center justify-between gap-3 p-6 text-left"
      >
        <span className="flex items-center gap-2 font-medium text-ink">
          <SlidersHorizontal className="h-4 w-4 text-accent-deep" aria-hidden="true" />
          {expanded ? labels.hideFilters : labels.showFilters}
          {activeFilterCount > 0 ? <Badge variant="accent">{activeFilterCount}</Badge> : null}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-ink-faint transition-transform duration-300 ease-institutional", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id="posts-filters-panel"
        className={cn("grid transition-[grid-template-rows] duration-300 ease-institutional", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
      >
        <div className="overflow-hidden">
          <div className="grid gap-5 border-t border-border p-6 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Label htmlFor="posts-search">{labels.searchPlaceholder}</Label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input
                  id="posts-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="pl-9"
                />
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
                <Checkbox checked={searchInContent} onCheckedChange={(v) => setSearchInContent(v === true)} />
                {labels.searchInContent}
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-ink">{labels.typeLabel}</p>
              <div className="mt-1.5 flex flex-col gap-2">
                {(["articulo", "nota"] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-ink-soft">
                    <Checkbox checked={types.has(type)} onCheckedChange={() => toggleType(type)} />
                    {POST_TYPE_LABELS[type].es}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="posts-category">{labels.categoryLabel}</Label>
              <select
                id="posts-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 h-11 w-full rounded border border-ink/15 bg-surface px-3 text-sm text-ink"
              >
                <option value="">{labels.categoryLabel}</option>
                {POST_CATEGORIES.map((c: PostCategory) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c].es}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-5 border-t border-border px-6 pt-5 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Label htmlFor="posts-tags">Etiquetas</Label>
              <Input
                id="posts-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={labels.tagsPlaceholder}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="posts-date-from">{labels.dateFrom}</Label>
              <Input
                id="posts-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="posts-date-to">{labels.dateTo}</Label>
              <Input
                id="posts-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className={cn("mt-1.5", dateError && "border-red-500")}
              />
              {dateError ? <p className="mt-1 text-xs text-red-600">{labels.dateError}</p> : null}
            </div>
          </div>

          <div className="mt-5 flex gap-3 px-6 pb-6">
            <Button type="button" variant="accent" size="sm" onClick={applyFilters}>
              {labels.apply}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              {labels.clear}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
