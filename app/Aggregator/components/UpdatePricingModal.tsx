"use client";

import React, { useState } from "react";
import { X, Tag, MapPin, Check, Loader2 } from "lucide-react";
import type { BatchRecord } from "@/app/types/batchVaultDispatch";
import { batchService } from "@/app/Services/batchService";

export interface UpdatePricingModalProps {
  batch: BatchRecord | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpdatePricingModal({
  batch,
  open,
  onClose,
  onSuccess,
}: UpdatePricingModalProps) {
  const [pricePerTonne, setPricePerTonne] = useState<number>(
    batch?.pricePerTonne || 140000
  );
  const [destination, setDestination] = useState<string>(
    batch?.destination || "Ilorin Central Processing Hub"
  );
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!open || !batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pricePerTonne <= 0) return;

    setSaving(true);
    try {
      await batchService.updatePricing(batch.id, {
        pricePerTonne: Number(pricePerTonne),
        destination: destination.trim(),
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed to update pricing on server:", err);
      // Clean fallback
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#226049]">
            <Tag size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Update Batch Pricing</h3>
            <p className="text-xs text-gray-500 font-mono">{batch.batchCode}</p>
          </div>
        </div>

        {successMsg ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mb-3">
              <Check size={24} />
            </div>
            <p className="text-sm font-bold text-gray-900">Pricing Updated</p>
            <p className="text-xs text-gray-500 mt-0.5">New market rate recorded on YucaChain.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                Price per Tonne (₦)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={pricePerTonne}
                onChange={(e) => setPricePerTonne(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Approx ₦{(pricePerTonne / 1000).toFixed(2)} / kg
              </span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                Batch Destination / Processing Hub
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Ilorin Central Millers"
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#226049] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1a4336] transition-colors cursor-pointer shadow-xs"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                Save Pricing
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
