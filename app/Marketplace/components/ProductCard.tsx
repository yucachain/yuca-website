// ProductCard — single batch card showing: batch ID, product name + grade badge, "Add to Cart" tag, quantity, price per tonne, origin location, seller name, storage time, temperature, humidity, "View Details" + "Place order" buttons
import React from "react";
import { MapPin, Building2, Clock, Thermometer, Droplets, ShoppingCart } from "lucide-react";
import type { CassavaBatch } from "./types";
import Button from "@/app/components/ui/Button";

const gradeBadgeStyles: Record<CassavaBatch["grade"], string> = {
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
        "mx-auto flex h-[320px] w-full max-w-[240px] min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl border bg-[#FFFFFF] p-3 shadow-sm transition-colors",
        selected ? "border-emerald-700" : "border-gray-100",
      ].join(" ")}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between">
        {batch.isNew ? (
          <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            New
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={() => onAddToCart?.(batch)}
          className="flex items-center gap-1 rounded-full bg-gray-900 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-gray-800"
        >
          Add to Cart
          <ShoppingCart size={10} strokeWidth={2} />
        </button>
      </div>

      <p className="mt-2 text-[10px] text-gray-500">{batch.batchCode}</p>

      <div className="mt-1 flex items-center gap-2">
        <h3 className="text-sm font-bold text-gray-900">{batch.title}</h3>
        <span
          className={[
            "flex h-5 w-5 items-center justify-center rounded-sm text-xs font-bold text-white",
            gradeBadgeStyles[batch.grade],
          ].join(" ")}
        >
          {batch.grade}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-gray-500">Quantity</p>
          <p className="text-sm font-bold text-gray-900">
            {batch.quantity.toLocaleString()} {unit}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Price per tonnes</p>
          <p className="text-sm font-bold text-gray-900">
            {currency}
            {batch.pricePerTonne}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-[11px] text-gray-600">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} strokeWidth={1.8} className="text-gray-400" />
          {batch.location}
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 size={12} strokeWidth={1.8} className="text-gray-400" />
          {batch.seller}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} strokeWidth={1.8} className="text-gray-400" />
          {storageLocation}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} strokeWidth={1.8} className="text-gray-400" />
          Storage Time: {batch.storageTime}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Thermometer size={12} strokeWidth={1.8} className="text-gray-400" />
            {batch.temperatureC}°C
          </span>
          <span className="flex items-center gap-1">
            <Droplets size={12} strokeWidth={1.8} className="text-gray-400" />
            {batch.humidityPercent}%
          </span>
        </div>
      </div>

      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onViewDetails?.(batch)}
          className="flex-1 rounded-lg border border-[#226049] py-1.5 text-[10px] font-semibold text-[#226049] transition-colors hover:bg-gray-50"
        >
          View Details
        </button>
        <Button
          type="button"
          onClick={() => onPlaceOrder?.(batch)}
          className="flex-1 rounded-lg bg-[#215243] py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#1a4336]"
        >
          Place order
        </Button>
      </div>
    </div>
  );
}