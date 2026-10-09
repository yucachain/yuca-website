"use client";

import React, { useState } from "react";
import {
  Star,
  ShoppingCart,
  CheckCircle2,
  MapPin,
  Building2,
  Check,
  Sprout,
  Package,
  Tractor,
  FlaskConical,
} from "lucide-react";
import type { CassavaBatch } from "./types";

export interface ProductCardProps {
  batch: CassavaBatch;
  selected?: boolean;
  onAddToCart?: (batch: CassavaBatch) => void;
  onViewDetails?: (batch: CassavaBatch) => void;
  onPlaceOrder?: (batch: CassavaBatch) => void;
}

export default function ProductCard({
  batch,
  selected = false,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const unit = batch.unit ?? "Tonnes";
  const currency = batch.currency ?? "₦";

  const rawImage = batch.images && batch.images.length > 0 ? batch.images[0] : "";
  const hasImage = Boolean(rawImage && !imageError && !rawImage.includes("Batch1.png"));

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(batch);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const isGradeA = batch.grade === "A";
  // Rating calculation based on batch for realistic marketplace display
  const rating = isGradeA ? "4.9" : "4.6";

  return (
    <div
      onClick={() => onViewDetails?.(batch)}
      className={[
        "group relative flex flex-col rounded-2xl border bg-white p-3.5 transition-all duration-200 cursor-pointer",
        selected
          ? "border-[#226049] ring-2 ring-[#226049]/20 shadow-md"
          : "border-gray-200/70 hover:border-gray-300 hover:shadow-md",
      ].join(" ")}
    >
      {/* Product Image Stage */}
      <div className="relative h-38 sm:h-42 w-full rounded-xl bg-[#f8f9fa] flex items-center justify-center overflow-hidden mb-3 border border-gray-100/80">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rawImage}
            alt={batch.title}
            className="h-full w-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3 h-full w-full bg-gradient-to-br from-emerald-50/70 via-white to-gray-50 rounded-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#226049]/10 text-[#226049] mb-1.5 shadow-2xs">
              {batch.category === "process-products" ? (
                <Package size={20} />
              ) : batch.category === "machinery-lease" ? (
                <Tractor size={20} />
              ) : batch.category === "inputs-seeds" ? (
                <FlaskConical size={20} />
              ) : (
                <Sprout size={20} />
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {batch.category?.replace("-", " ") || "Produce"}
            </span>
            <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[140px]">
              {batch.title}
            </span>
          </div>
        )}

        {/* Floating Grade Pill */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-2xs backdrop-blur-xs ${
              isGradeA
                ? "bg-[#226049] text-white"
                : "bg-amber-600 text-white"
            }`}
          >
            <CheckCircle2 size={10} strokeWidth={2.5} />
            Grade {batch.grade}
          </span>
        </div>

        {/* Floating Star Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 shadow-2xs backdrop-blur-xs border border-amber-200/60">
          <Star size={11} className="fill-amber-400 text-amber-500" />
          <span className="text-[10px] font-bold text-gray-800">{rating}</span>
        </div>
      </div>

      {/* Product Details (Matches inspiration card hierarchy) */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#226049] transition-colors truncate leading-tight"
            title={batch.title}
          >
            {batch.title}
          </h3>

          {/* Supplier Subtitle */}
          <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
            {batch.seller}
          </p>

          {/* Location & Quantity mini info */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 py-1 px-2 rounded-lg bg-gray-50 border border-gray-100/60">
            <span className="truncate flex items-center gap-1">
              <MapPin size={10} className="text-gray-400 shrink-0" />
              <span className="truncate">{batch.location.split(",")[0]}</span>
            </span>
            <span className="font-semibold text-gray-700 shrink-0">
              {batch.quantity.toLocaleString()} {unit.split(" ")[0]}
            </span>
          </div>
        </div>

        {/* Price & Action Row (Matches inspiration bottom row) */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-gray-900">
              {currency}
              {batch.pricePerTonne.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400 font-normal ml-0.5">
              /{unit.split(" ")[0]}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95 ${
              addedAnimation
                ? "bg-amber-500 text-white"
                : "bg-[#226049] hover:bg-[#1a4336] text-white"
            }`}
            title="Add to cart"
            aria-label="Add to cart"
          >
            {addedAnimation ? (
              <Check size={14} strokeWidth={2.5} />
            ) : (
              <ShoppingCart size={13} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}