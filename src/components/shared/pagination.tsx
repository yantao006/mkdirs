"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { normalizePage } from "@/lib/directory-query";
import { useSearchParams } from "next/navigation";

type CustomPaginationProps = {
  totalPages: number;
  routePrefix: string;
};

export default function CustomPagination({
  totalPages,
  routePrefix,
}: CustomPaginationProps) {
  const searchParams = useSearchParams();
  const currentPage = normalizePage(searchParams.get("page"));
  const pageUrl = (page: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${routePrefix}?${params.toString()}`;
  };
  if (totalPages <= 1) return null;

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? pageUrl(currentPage - 1) : undefined}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            aria-disabled={currentPage <= 1}
            className={
              currentPage <= 1
                ? "pointer-events-none text-gray-300 dark:text-gray-600"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
        {allPages.map((page, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <PaginationItem key={`${page}-${index}`}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={pageUrl(page)}
                aria-label={`Page ${page}`}
                isActive={currentPage === page}
                className={currentPage === page ? "" : "cursor-pointer"}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={
              currentPage < totalPages ? pageUrl(currentPage + 1) : undefined
            }
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            aria-disabled={currentPage >= totalPages}
            className={
              currentPage >= totalPages
                ? "pointer-events-none text-gray-300 dark:text-gray-600"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/**
 * Generate an array of page numbers to display in the pagination component
 */
const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};
