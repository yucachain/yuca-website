"use client";

import React from "react";
import type { CassavaBatch } from "./types";
import ProductCard from "./ProductCard";

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
      <div className="mt-20 flex flex-col items-center text-center text-gray-400 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm w-full">
        <p className="text-sm font-medium">No products found</p>
        <p className="mt-1 text-xs">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div
      className={[
        "mt-5 grid gap-3 transition-all duration-300 w-full",
        panelOpen
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      ].join(" ")}
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
