import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Pages({ current, total, onPageChange }) {
  const maxPagesToShow = 7;
  let startPage = Math.max(1, current - 3);
  let endPage = Math.min(total, startPage + maxPagesToShow - 1);
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return (
    <Pagination className="mt-8 flex-center justify-center items-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, current - 1))}
            disabled={current === 1}
            className="hover:text-red-300 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </PaginationItem>
        {startPage > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer"
                onClick={() => onPageChange(1)}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {startPage > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => onPageChange(page)}
              isActive={page === current}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {endPage < total && (
          <>
            {endPage < total - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer"
                onClick={() => onPageChange(total)}
              >
                {total}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(total, current + 1))}
            disabled={current === total}
            className="hover:text-red-300 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </PaginationItem>
        <PaginationItem>
          <div className="text-xs ml-5">
            Page <span className="text-red-300 font-bold">{current}</span> of{" "}
            {total}
          </div>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
