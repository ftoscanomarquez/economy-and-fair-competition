"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function PostsPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginación">
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="flex h-10 w-10 items-center justify-center rounded border border-ink/15 text-ink transition-colors duration-300 ease-institutional hover:border-ink disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageNumbers.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => goToPage(n)}
          aria-current={n === page ? "page" : undefined}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded font-mono text-sm transition-colors duration-300 ease-institutional",
            n === page ? "bg-ink text-bg" : "border border-ink/15 text-ink-soft hover:border-ink"
          )}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="flex h-10 w-10 items-center justify-center rounded border border-ink/15 text-ink transition-colors duration-300 ease-institutional hover:border-ink disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
