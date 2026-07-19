"use client";

import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm bg-white rounded-xl px-5 py-3.5 border border-gray-150 shadow-sm w-full">
      <span className="text-xs text-gray-500 font-medium">
        Showing {startItem}–{endItem} of {totalItems} items
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-40 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          ‹
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={[
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer",
              p === currentPage
                ? "border-emerald-700 bg-[#215243] text-white shadow-sm"
                : "border-gray-200 text-gray-600 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50",
            ].join(" ")}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-40 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  );
}
