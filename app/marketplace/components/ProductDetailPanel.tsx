"use client";

import React, { useState } from "react";
import {
  MapPin,
  Building2,
  Clock,
  Thermometer,
  Droplets,
  X,
  ShoppingCart,
  CheckCircle2,
  ShieldCheck,
  PackageCheck,
  Sprout,
  Package,
  Tractor,
  FlaskConical,
} from "lucide-react";
import type { CassavaBatch } from "./types";

export interface ProductDetailPanelProps {
  batch: CassavaBatch;
  onClose: () => void;
  onAddToCart?: (batch: CassavaBatch) => void;
  onPlaceOrder?: (batch: CassavaBatch) => void;
}

export default function ProductDetailPanel({
  batch,
  onClose,
  onAddToCart,
  onPlaceOrder,
}: ProductDetailPanelProps) {
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);

  const unit = batch.unit ?? "Tonnes";
  const currency = batch.currency ?? "₦";
  const storageLocation = batch.storageLocation ?? batch.location;

  const rawImage = batch.images && batch.images.length > 0 ? batch.images[0] : "";
  const hasImage = Boolean(rawImage && !imageError && !rawImage.includes("Batch1.png"));

  const isGradeA = batch.grade === "A";

  const handleAddCart = () => {
    onAddToCart?.(batch);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-col h-full w-[380px] sm:w-[420px] shrink-0 bg-white border-l border-gray-100 shadow-2xl font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#226049]">
            <PackageCheck size={16} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Product Specifications</h2>
            <p className="text-[11px] text-gray-400">YucaChain Verified Batch</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <X size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 no-scrollbar">
        {/* Product Image Stage */}
        <div className="overflow-hidden rounded-2xl h-48 w-full relative bg-gray-50 border border-gray-100 flex items-center justify-center">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rawImage}
              alt={batch.title}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 h-full w-full bg-gradient-to-br from-emerald-50 via-white to-gray-50">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#226049]/10 text-[#226049] mb-2 shadow-2xs">
                {batch.category === "process-products" ? (
                  <Package size={26} />
                ) : batch.category === "machinery-lease" ? (
                  <Tractor size={26} />
                ) : batch.category === "inputs-seeds" ? (
                  <FlaskConical size={26} />
                ) : (
                  <Sprout size={26} />
                )}
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {batch.category?.replace("-", " ") || "Produce"}
              </span>
              <span className="text-xs font-semibold text-gray-800 truncate max-w-[200px]">
                {batch.title}
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-xs ${isGradeA ? "bg-[#226049]" : "bg-amber-600"
                }`}
            >
              <CheckCircle2 size={12} strokeWidth={2.5} />
              Grade {batch.grade} {isGradeA ? "Premium" : "Standard"}
            </span>
          </div>

          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-xs">
              {batch.batchCode}
            </span>
          </div>
        </div>

        {/* Title & Seller */}
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-snug">{batch.title}</h1>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <Building2 size={13} className="text-gray-400" />
              {batch.seller}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#226049] font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              <ShieldCheck size={12} />
              Verified Escrow
            </span>
          </div>
        </div>

        {/* Price & Stock Card */}
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#226049]">
                Unit Price
              </p>
              <p className="text-xl font-extrabold text-gray-900 mt-0.5">
                {currency}
                {batch.pricePerTonne.toLocaleString()}
                <span className="text-xs font-normal text-gray-500 ml-1">/ {unit.split(" ")[0]}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Stock Available
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {batch.quantity.toLocaleString()} {unit}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#226049] font-medium border-t border-emerald-200/50 pt-2 flex items-center gap-1">
            <ShieldCheck size={12} />
            Funds held securely in escrow until delivery inspection
          </p>
        </div>

        {/* Technical Specs */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
            Storage &amp; Quality Parameters
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="flex items-center gap-2 text-gray-500">
                <MapPin size={13} className="text-gray-400" />
                Origin / Hub
              </span>
              <span className="font-semibold text-gray-800">{batch.location}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="flex items-center gap-2 text-gray-500">
                <Clock size={13} className="text-gray-400" />
                Harvest / Stored Time
              </span>
              <span className="font-semibold text-gray-800">{batch.storageTime || "Fresh"}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Product Description
          </p>
          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100">
            {batch.description ||
              "High quality agricultural produce verified and certified by YucaChain quality officers. Ready for prompt order fulfillment."}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-gray-100 bg-white shrink-0 space-y-2">
        <button
          type="button"
          onClick={handleAddCart}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${added
              ? "bg-emerald-600 text-white"
              : "bg-[#226049] hover:bg-[#1a4336] text-white active:scale-98"
            }`}
        >
          <ShoppingCart size={14} />
          <span>{added ? "Added to Cart!" : "Add to Cart"}</span>
        </button>

        <button
          type="button"
          onClick={() => onPlaceOrder?.(batch)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <span>Direct Checkout</span>
        </button>
      </div>
    </div>
  );
}