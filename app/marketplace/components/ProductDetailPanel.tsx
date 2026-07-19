// ProductDetailPanel — inline right panel that slides in from the right.
// Always has the SAME structure/layout regardless of which product is open.
// Parent controls visibility; this component only handles rendering.
"use client";

import React from "react";
import {
  MapPin,
  Building2,
  Clock,
  Thermometer,
  Droplets,
  Image as ImageIcon,
  X,
} from "lucide-react";
import type { CassavaBatch } from "./types";

const GRADE_BADGE: Record<string, string> = {
  A: "bg-emerald-700",
  B: "bg-amber-500",
};

export interface ProductDetailPanelProps {
  batch: CassavaBatch;
  onClose: () => void;
  onContactSeller?: (batch: CassavaBatch) => void;
  onPlaceOrder?: (batch: CassavaBatch) => void;
}

export default function ProductDetailPanel({
  batch,
  onClose,
  onContactSeller,
  onPlaceOrder,
}: ProductDetailPanelProps) {
  const unit = batch.unit ?? "Tonnes";
  const currency = batch.currency ?? "₦";
  const storageLocation = batch.storageLocation ?? batch.location;

  return (
    <div className="flex flex-col h-full w-[400px] shrink-0 bg-white border-l border-gray-100 shadow-2xl">

      {/* ── Sticky header ── */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 leading-tight">Product Details</h2>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Verify full details before placing order
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors ml-2"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* Product image */}
        <div className="overflow-hidden rounded-xl h-[200px] w-full relative bg-gray-50 flex items-center justify-center shrink-0">
          {batch.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={batch.images[0]}
              alt={batch.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
              <ImageIcon size={44} strokeWidth={1} className="text-emerald-300" />
            </div>
          )}
        </div>

        {/* Batch code */}
        <p className="text-[10px] font-mono text-gray-400 -mt-1">{batch.batchCode}</p>

        {/* Title + grade badge */}
        <div className="flex items-center gap-2 -mt-2">
          <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{batch.title}</h3>
          <span
            className={[
              "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-extrabold text-white",
              GRADE_BADGE[batch.grade] ?? "bg-gray-400",
            ].join(" ")}
          >
            {batch.grade}
          </span>
        </div>

        {/* Quantity + Price block */}
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
          <div>
            <p className="text-[9px] uppercase tracking-wide text-gray-400 mb-0.5">Quantity</p>
            <p className="text-sm font-bold text-gray-900">
              {batch.quantity.toLocaleString()} {unit}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide text-gray-400 mb-0.5">Price per {unit.toLowerCase()}</p>
            <p className="text-sm font-bold text-gray-900">
              {currency}{batch.pricePerTonne.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2.5 border-t border-gray-100 pt-3">
          <div className="flex items-start gap-2">
            <MapPin size={12} strokeWidth={1.8} className="text-gray-400 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-600">{batch.location}</span>
          </div>
          <div className="flex items-start gap-2">
            <Building2 size={12} strokeWidth={1.8} className="text-gray-400 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-600">{batch.seller}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={12} strokeWidth={1.8} className="text-gray-400 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-600">{storageLocation}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} strokeWidth={1.8} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-600">Storage Time: {batch.storageTime}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-600">
              <Thermometer size={12} strokeWidth={1.8} className="text-gray-400" />
              {batch.temperatureC}°C
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600">
              <Droplets size={12} strokeWidth={1.8} className="text-gray-400" />
              {batch.humidityPercent}%
            </span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onContactSeller?.(batch)}
            className="flex-1 rounded-lg border border-[#226049] py-2.5 text-[11px] font-semibold text-[#226049] hover:bg-emerald-50 transition-colors"
          >
            Contact Seller
          </button>
          <button
            type="button"
            onClick={() => onPlaceOrder?.(batch)}
            className="flex-1 rounded-lg bg-[#215243] py-2.5 text-[11px] font-semibold text-white hover:bg-[#1a4336] transition-colors"
          >
            Place order
          </button>
        </div>

        {/* Additional Note — always rendered (placeholder if no description) */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[11px] font-semibold text-gray-800 mb-1">Additional Note</p>
          {batch.description ? (
            <p className="text-[11px] leading-relaxed text-gray-500">{batch.description}</p>
          ) : (
            <p className="text-[11px] leading-relaxed text-gray-400 italic">No additional notes provided for this batch.</p>
          )}
        </div>

      </div>
    </div>
  );
}