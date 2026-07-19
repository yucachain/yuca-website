// ProductCard — matches the reference image exactly:
// thin grade-colored top bar · batch code · title + grade pill · qty/price row ·
// info rows with icons · "View Details" outline + "Place order" filled buttons ·
// "Add to Cart" pill in the top-right corner
"use client";

import React from "react";
import { MapPin, Building2, Clock, Thermometer, Droplets, ShoppingCart } from "lucide-react";
import type { CassavaBatch } from "./types";

const GRADE_BAR: Record<string, string> = {
  A: "bg-emerald-700",
  B: "bg-amber-500",
};
const GRADE_BADGE: Record<string, string> = {
  A: "bg-emerald-700",
  B: "bg-amber-500",
};

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
  onPlaceOrder,
}: ProductCardProps) {
  const unit = batch.unit ?? "Tonnes";
  const currency = batch.currency ?? "₦";
  const storageLocation = batch.storageLocation ?? batch.location;

  return (
    <div
      className={[
        "group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200",
        selected
          ? "border-emerald-700 shadow-lg ring-2 ring-emerald-700/20"
          : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200",
      ].join(" ")}
    >
      {/* Grade colour bar */}
      <div className={["h-[3px] w-full shrink-0", GRADE_BAR[batch.grade] ?? "bg-gray-300"].join(" ")} />

      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Row 1: New badge + Add to Cart button */}
        <div className="flex items-center justify-between gap-2">
          {batch.isNew ? (
            <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 leading-none">
              New
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400 leading-none">
              Listed
            </span>
          )}
          <button
            type="button"
            onClick={() => onAddToCart?.(batch)}
            className="flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-emerald-800 active:scale-95"
            title="Add to cart"
          >
            Add to Cart
            <ShoppingCart size={9} strokeWidth={2.2} />
          </button>
        </div>

        {/* Batch code */}
        <p className="text-[9px] font-mono text-gray-400 -mt-0.5 truncate">{batch.batchCode}</p>

        {/* Title + grade badge */}
        <div className="flex items-center gap-1.5 -mt-0.5">
          <h3 className="text-[13px] font-bold text-gray-900 leading-tight truncate">{batch.title}</h3>
          <span
            className={[
              "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded text-[9px] font-extrabold text-white",
              GRADE_BADGE[batch.grade] ?? "bg-gray-400",
            ].join(" ")}
          >
            {batch.grade}
          </span>
        </div>

        {/* Quantity + price */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 rounded-lg bg-gray-50 px-2 py-1.5">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">Quantity</p>
            <p className="text-[11px] font-bold text-gray-900">
              {batch.quantity.toLocaleString()} {unit}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">Price per {unit.toLowerCase()}</p>
            <p className="text-[11px] font-bold text-gray-900">
              {currency}{batch.pricePerTonne.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-1 text-[10px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={9} strokeWidth={1.8} className="text-gray-400 shrink-0" />
            <span className="truncate">{batch.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 size={9} strokeWidth={1.8} className="text-gray-400 shrink-0" />
            <span className="truncate">{batch.seller}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={9} strokeWidth={1.8} className="text-gray-400 shrink-0" />
            <span className="truncate">{storageLocation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={9} strokeWidth={1.8} className="text-gray-400 shrink-0" />
            <span>Storage Time: {batch.storageTime}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Thermometer size={9} strokeWidth={1.8} className="text-gray-400" />
              {batch.temperatureC}°C
            </span>
            <span className="flex items-center gap-1">
              <Droplets size={9} strokeWidth={1.8} className="text-gray-400" />
              {batch.humidityPercent}%
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onViewDetails?.(batch)}
            className={[
              "flex-1 rounded-lg border py-2 text-[11px] font-semibold transition-all duration-150",
              selected
                ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                : "border-[#226049] text-[#226049] hover:bg-emerald-50",
            ].join(" ")}
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => onPlaceOrder?.(batch)}
            className="flex-1 rounded-lg bg-[#215243] py-2 text-[11px] font-semibold text-white hover:bg-[#1a4336] transition-colors"
          >
            Place order
          </button>
        </div>
      </div>
    </div>
  );
}