"use client";

import React, { useEffect, useState } from "react";
import { X, Truck, MapPin, Loader2, Check, AlertCircle } from "lucide-react";
import type { CreateDispatchRequest, DispatchRecord, VaultUnit } from "@/app/types/batchVaultDispatch";
import { dispatchService } from "@/app/Services/dispatchService";
import { vaultService } from "@/app/Services/vaultService";

export interface CreateDispatchModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (dispatch: DispatchRecord) => void;
  defaultOrderId?: string;
  defaultWeightKg?: number;
  defaultBuyerAddress?: string;
}

export default function CreateDispatchModal({
  open,
  onClose,
  onSuccess,
  defaultOrderId,
  defaultWeightKg,
  defaultBuyerAddress,
}: CreateDispatchModalProps) {
  const [vaults, setVaults] = useState<VaultUnit[]>([]);
  const [pickupHub, setPickupHub] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState(
    `TRK-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear().toString().slice(-2)}`
  );
  const [weighbridgeTicket, setWeighbridgeTicket] = useState(
    `WB-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [buyerDeliveryAddress, setBuyerDeliveryAddress] = useState(defaultBuyerAddress || "");
  const [weightKg, setWeightKg] = useState<number>(defaultWeightKg || 0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!open) return;
    vaultService
      .getVaults()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setVaults(list);
        if (list.length > 0 && !pickupHub) {
          setPickupHub(list[0].unitCode ? `${list[0].unitCode} (${list[0].location})` : list[0].location);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch vaults for dispatch:", err);
      });
  }, [open, pickupHub]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrierName.trim() || !trackingNumber.trim() || !buyerDeliveryAddress.trim() || weightKg <= 0) {
      setErrorMsg("Please fill in all required dispatch details with a valid weight.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const payload: CreateDispatchRequest = {
        pickupHub: pickupHub.trim() || "Hub Facility",
        carrierName: carrierName.trim(),
        trackingNumber: trackingNumber.trim(),
        weighbridgeTicket: weighbridgeTicket.trim(),
        buyerDeliveryAddress: buyerDeliveryAddress.trim(),
        orderId: defaultOrderId,
        weightKg: Number(weightKg),
      };

      const result = await dispatchService.createDispatch(payload);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onSuccess(result);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Failed to create dispatch release:", err);
      setErrorMsg(err?.message || "Failed to create dispatch release on server. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#226049]">
            <Truck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Create Dispatch Release</h3>
            <p className="text-xs text-gray-500">Record freight carrier, weighbridge verification &amp; tracking</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mb-3">
              <Check size={24} />
            </div>
            <p className="text-sm font-bold text-gray-900">Dispatch Released</p>
            <p className="text-xs text-gray-500 mt-0.5">Tracking number generated and assigned.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Pickup Storage Vault</label>
              {vaults.length > 0 ? (
                <select
                  value={pickupHub}
                  onChange={(e) => setPickupHub(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none bg-white"
                >
                  {vaults.map((v) => (
                    <option key={v.id} value={`${v.unitCode} (${v.location})`}>
                      {v.unitCode} — {v.location} ({v.state})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={pickupHub}
                  onChange={(e) => setPickupHub(e.target.value)}
                  placeholder="e.g. YucaHub Facility #1"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Carrier Name *</label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  placeholder="e.g. Kobo360, Freight Driver"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tracking Number *</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Weighbridge Ticket # *</label>
                <input
                  type="text"
                  value={weighbridgeTicket}
                  onChange={(e) => setWeighbridgeTicket(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Total Weight (KG) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={weightKg || ""}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  placeholder="Enter weight in kg"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Buyer Delivery Address *</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={buyerDeliveryAddress}
                  onChange={(e) => setBuyerDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery facility address"
                  className="w-full rounded-xl border border-gray-300 pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#226049] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1a4336] transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                Confirm Release &amp; Print Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
