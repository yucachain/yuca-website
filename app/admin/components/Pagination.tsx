import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  resultsLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  resultsLabel,
}: PaginationProps) {
  if (totalPages <= 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {resultsLabel && <span className="text-sm text-gray-400">{resultsLabel}</span>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} strokeWidth={1.8} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-[#215243] text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}