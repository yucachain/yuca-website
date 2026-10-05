"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  showSummary?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showSummary = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const controls = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#226049] hover:text-[#226049] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
        title="Previous Page"
      >
        <ChevronLeft size={14} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
            p === currentPage
              ? "border-[#226049] bg-[#226049] text-white shadow-2xs"
              : "border-gray-200 text-gray-700 hover:border-[#226049] hover:text-[#226049] hover:bg-emerald-50/50"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#226049] hover:text-[#226049] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
        title="Next Page"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );

  if (!showSummary) {
    return controls;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-white rounded-2xl px-5 py-3.5 border border-gray-150/70 shadow-2xs w-full">
      <span className="text-gray-500 font-medium">
        Showing <span className="font-bold text-gray-900">{startItem}–{endItem}</span> of{" "}
        <span className="font-bold text-gray-900">{totalItems}</span> products
      </span>
      {controls}
    </div>
  );
}
