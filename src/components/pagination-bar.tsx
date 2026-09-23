import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

function buildHref(
  basePath: string,
  params: URLSearchParams,
  page: number
): string {
  const next = new URLSearchParams(params);
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Page numbers with an ellipsis for large ranges, e.g. 1 … 4 5 6 … 12. */
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

export function PaginationBar({
  page,
  totalPages,
  searchParams,
  basePath,
}: {
  page: number;
  totalPages: number;
  /** Current filters, preserved onto each page link. */
  searchParams: Record<string, string | undefined>;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <Pagination className="justify-center gap-2 py-6">
      <PaginationContent className="gap-2">
        {page > 1 && (
          <PaginationItem>
            <PaginationLink
              href={buildHref(basePath, params, page - 1)}
              size="default"
              aria-label="Go to previous page"
            >
              <ChevronLeftIcon className="size-4" />
              Prev
            </PaginationLink>
          </PaginationItem>
        )}

        {pageNumbers.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <span className="px-2 text-sm text-muted-foreground">…</span>
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href={buildHref(basePath, params, p)}
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {page < totalPages && (
          <PaginationItem>
            <PaginationLink
              href={buildHref(basePath, params, page + 1)}
              size="default"
              aria-label="Go to next page"
            >
              Next
              <ChevronRightIcon className="size-4" />
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
