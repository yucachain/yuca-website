// ProductDetailPanel — right-side slide-in panel showing full product details: image, batch ID, product name, price per tonne, quantity, origin (Offa, Kwara State), seller (Top Farmers Ltd.), storage time, temperature, humidity, "Contact Seller" + "Place order" buttons, Additional Note section
import React from "react";
import { MapPin, Building2, Clock, Thermometer, Droplets, Image as ImageIcon } from "lucide-react";
import type { CassavaBatch } from "./types";
import Button from "@/app/components/ui/Button";

const gradeBadgeStyles: Record<CassavaBatch["grade"], string> = {
  A: "bg-emerald-700",
  B: "bg-amber-500",
};

export interface ProductDetailPanelProps {
  batch: CassavaBatch | null;
  onContactSeller?: (batch: CassavaBatch) => void;
  onPlaceOrder?: (batch: CassavaBatch) => void;
}

export default function ProductDetailPanel({
  batch,
  onContactSeller,
  onPlaceOrder,
}: ProductDetailPanelProps) {
  return (
    <aside className="w-full max-w-sm shrink-0 border-l border-gray-100 bg-white px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
      <p className="mt-1 text-sm text-gray-500">Verify full details before placing order</p>

      {!batch ? (
        <p className="mt-10 text-sm text-gray-500">
          Select a batch to view its full details here.
        </p>
      ) : (
        <>
          <div className="relative mt-6">
            {batch.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={batch.images[0]}
                alt={batch.title}
                className="h-56 w-full rounded-2xl object-contain"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <ImageIcon size={32} strokeWidth={1.5} />
              </div>
            )}

            {batch.images && batch.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-md bg-white/90 p-1.5 shadow-sm">
                {batch.images.slice(1, 4).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`${batch.title} thumbnail ${i + 1}`}
                    className="h-8 w-8 rounded-sm border border-gray-100 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <p className="mt-5 text-sm text-gray-500">{batch.batchCode}</p>

          <div className="mt-1 flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900">{batch.title}</h3>
            <span
              className={[
                "flex h-5 w-5 items-center justify-center rounded-sm text-xs font-bold text-white",
                gradeBadgeStyles[batch.grade],
              ].join(" ")}
            >
              {batch.grade}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Quantity</p>
              <p className="text-base font-bold text-gray-900">
                {batch.quantity.toLocaleString()} {batch.unit ?? "Tonnes"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Price per tonnes</p>
              <p className="text-base font-bold text-gray-900">
                {batch.currency ?? "₦"}
                {batch.pricePerTonne}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={16} strokeWidth={1.8} className="text-gray-400" />
              {batch.location}
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={16} strokeWidth={1.8} className="text-gray-400" />
              {batch.seller}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} strokeWidth={1.8} className="text-gray-400" />
              {batch.storageLocation ?? batch.location}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} strokeWidth={1.8} className="text-gray-400" />
              Storage Time: {batch.storageTime}
            </div>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Thermometer size={16} strokeWidth={1.8} className="text-gray-400" />
                {batch.temperatureC}°C
              </span>
              <span className="flex items-center gap-2">
                <Droplets size={16} strokeWidth={1.8} className="text-gray-400" />
                {batch.humidityPercent}%
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => onContactSeller?.(batch)}
              className="flex-1 rounded-lg border border-[#226049] py-2.5 text-sm font-semibold text-[#226049] transition-colors hover:bg-gray-50"
            >
              Contact Seller
            </button>
            <Button
              type="button"
              onClick={() => onPlaceOrder?.(batch)}
              className="flex-1 rounded-lg bg-[#215243] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336]"
            >
              Place order
            </Button>
          </div>

          {batch.description && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-gray-800">Additional Note</p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                {batch.description}
              </p>
            </div>
          )}
        </>
      )}
    </aside>
  );
}