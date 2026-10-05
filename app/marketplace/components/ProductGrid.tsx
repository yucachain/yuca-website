"use client";

import React from "react";
import type { CassavaBatch } from "./types";
import ProductCard from "./ProductCard";
import { PackageOpen } from "lucide-react";

export interface ProductGridProps {
  batches: CassavaBatch[];
  selectedBatchId: string | null;
  onViewDetails: (batch: CassavaBatch) => void;
  onAddToCart: (batch: CassavaBatch) => void;
  onPlaceOrder: (batch: CassavaBatch) => void;
  panelOpen: boolean;
}

export default function ProductGrid({
  batches,
  selectedBatchId,
  onViewDetails,
  onAddToCart,
  onPlaceOrder,
  panelOpen,
}: ProductGridProps) {
  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl p-12 border border-gray-100 shadow-2xs w-full min-h-[300px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 mb-3">
          <PackageOpen size={24} />
        </div>
        <p className="text-sm font-bold text-gray-900">No products found in this category</p>
        <p className="mt-1 text-xs text-gray-500 max-w-sm">
          Try adjusting your search keywords, quality grade filters, or select a different category from the sidebar.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 sm:gap-5 transition-all duration-300 w-full ${
        panelOpen
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }`}
    >
      {batches.map((batch) => (
        <ProductCard
          key={batch.id}
          batch={batch}
          selected={selectedBatchId === batch.id}
          onViewDetails={onViewDetails}
          onAddToCart={onAddToCart}
          onPlaceOrder={onPlaceOrder}
        />
      ))}
    </div>
  );
}
