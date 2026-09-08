"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { normalizePage } from "@/lib/directory-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

type PaginationProps = {
  totalPages: number;
  routePrefix: string;
};

export default function CustomPagination(props: PaginationProps) {
  const searchParams = useSearchParams();
  return <PaginationControls {...props} search={searchParams.toString()} />;
}

// Keep anchors in this hand-written component rather than modifying generated UI.
export function PaginationControls({
  totalPages,
  routePrefix,
  search,
}: PaginationProps & { search: string }) {
  const searchParams = new URLSearchParams(search);
  const currentPage = normalizePage(searchParams.get("page"));
  const pageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${routePrefix}?${params.toString()}`;
  };
  if (totalPages <= 1) return null;

  const adjacentPage = (page: number, label: string, disabled: boolean) =>
    disabled ? (
      <span
        aria-disabled="true"
        className={`${buttonVariants({ variant: "ghost" })} text-muted-foreground`}
      >
        {label}
      </span>
    ) : (
      <Link
        href={pageUrl(page)}
        aria-label={`Go to ${label.toLowerCase()} page`}
        className={buttonVariants({ variant: "ghost" })}
      >
        {label}
      </Link>
    );

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {adjacentPage(currentPage - 1, "Previous", currentPage <= 1)}
        </PaginationItem>
        {generatePagination(currentPage, totalPages).map((page, index) => (
          <PaginationItem
            key={typeof page === "number" ? page : `gap-${index}`}
          >
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <Link
                href={pageUrl(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                className={buttonVariants({
                  variant: currentPage === page ? "outline" : "ghost",
                  size: "icon",
                })}
              >
                {page}
              </Link>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          {adjacentPage(currentPage + 1, "Next", currentPage >= totalPages)}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function generatePagination(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) return [1, 2, 3, "...", totalPages - 1, totalPages];
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}
