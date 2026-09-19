"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  QrCode,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import type { BatchRecord } from "@/app/types/batchVaultDispatch";
import { batchService } from "@/app/Services/batchService";

export interface BatchDetailModalProps {
  batchId: string | null;
  initialBatch?: BatchRecord | null;
  open: boolean;
  onClose: () => void;
  onAssignStorage?: (batch: BatchRecord) => void;
  onUpdatePricing?: (batch: BatchRecord) => void;
}

export default function BatchDetailModal({
  batchId,
  initialBatch,
  open,
  onClose,
  onAssignStorage,
  onUpdatePricing,
}: BatchDetailModalProps) {
  const [batch, setBatch] = useState<BatchRecord | null>(initialBatch || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !batchId) return;

    let isMounted = true;
    setLoading(true);

    batchService
      .getBatchById(batchId)
      .then((data) => {
        if (isMounted) setBatch(data);
      })
      .catch((err) => {
        console.error("Failed to load batch details:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, batchId]);

  if (!open) return null;

  const current = batch || initialBatch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {loading && !current ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RefreshCw size={28} className="animate-spin text-[#226049] mb-3" />
            <p className="text-sm font-semibold text-gray-900">Loading Batch Details...</p>
            <p className="text-xs text-gray-500 mt-1">Fetching full traceability &amp; metrics</p>
          </div>
        ) : current ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-100 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#226049]">
                  <QrCode size={20} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{current.batchCode}</h2>
                    <span
                      className={[
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        current.status === "Harvested"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : current.status === "Aggregated"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : current.status === "In Storage"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200",
                      ].join(" ")}
                    >
                      {current.status}
                    </span>
                    {current.urgentStorageFlag && (
                      <span className="flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-600">
                        <AlertTriangle size={12} /> Urgent Storage
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Farmer: <span className="font-semibold text-gray-700">{current.farmerName || current.farmer || current.sellerName || "Registered Farmer"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5">
                <span className="text-[11px] font-medium text-gray-500 block">Weight</span>
                <span className="text-base font-bold text-gray-900">
                  {((current.verifiedWeightKg || current.weightKg || current.estWeightKg || 0)).toLocaleString()} kg
                </span>
                {current.verifiedWeightKg ? (
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Verified</span>
                ) : (
                  <span className="text-[10px] text-gray-400 block mt-0.5">Estimated</span>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5">
                <span className="text-[11px] font-medium text-gray-500 block">Quality Grade</span>
                <span className="text-base font-bold text-[#226049]">
                  {current.qualityGrade ? `Grade ${current.qualityGrade}` : "Pending"}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Inspection score</span>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5">
                <span className="text-[11px] font-medium text-gray-500 block">Moisture</span>
                <span className="text-base font-bold text-blue-700">
                  {current.moistureContent ? `${current.moistureContent}%` : "12.5%"}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Hydration level</span>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5">
                <span className="text-[11px] font-medium text-gray-500 block">Price / Tonne</span>
                <span className="text-base font-bold text-gray-900">
                  {current.pricePerTonne ? `₦${current.pricePerTonne.toLocaleString()}` : "₦140,000"}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">Market pricing</span>
              </div>
            </div>

            {/* Hub Storage & YucaVault Transport Truck */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#226049]" />
                  Stationary YucaHub Facility
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Hub Location:</span>
                    <span className="font-semibold text-gray-900">
                      {current.destination || "Ilorin Kwara State Hub"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Facility Type:</span>
                    <span className="font-semibold text-gray-900">
                      Stationary Warehouse &amp; Silo
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Storage Status:</span>
                    <span className="font-semibold text-emerald-800">
                      {current.status === "In Storage" ? "Stored at Hub" : "Intake Staging"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#226049]" />
                  YucaVault Transport &amp; Lot
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Transport Truck / Vault:</span>
                    <span className="font-semibold text-gray-900">
                      {current.vaultName || (current.vaultId ? `YucaVault Lorry #${current.vaultId.slice(0, 4)}` : "Not Assigned")}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Vault Lot Code:</span>
                    <span className="font-semibold text-gray-900 font-mono">
                      {current.vaultLotId || "Pending Bulking"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Market Status:</span>
                    <span className="font-semibold text-gray-900">
                      {current.status === "Listed" || current.status === "Sold" ? current.status : "Ready for Allocation"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Traceability Timeline */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs">
              <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <FileCheck size={14} className="text-emerald-700" />
                Traceability Timeline
              </h4>
              <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {(current.timeline && current.timeline.length > 0 ? current.timeline : [
                  { status: "Harvested", timestamp: current.harvestDate || "Harvest confirmed", note: "Cassava roots harvested at farm", location: "Farm Origin" },
                  { status: "Intake & Inspected", timestamp: "Verified at Hub", note: `Quality Grade ${current.qualityGrade || "A"} checked`, location: "Aggregator Hub" },
                  { status: current.status, timestamp: "Current Status", note: "Recorded on YucaChain ledger", location: current.vaultName || "In Storage" },
                ]).map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-[#226049] ring-4 ring-emerald-50" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900">{step.status}</span>
                      <span className="text-gray-400 font-medium">{step.timestamp}</span>
                    </div>
                    {step.note && <p className="text-xs text-gray-500 mt-0.5">{step.note}</p>}
                    {step.location && <p className="text-[11px] text-emerald-800 font-medium mt-0.5">{step.location}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-gray-100">
              {onUpdatePricing && (
                <button
                  type="button"
                  onClick={() => onUpdatePricing(current)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Tag size={13} className="inline mr-1.5" />
                  Update Pricing
                </button>
              )}

              {onAssignStorage && current.status !== "In Storage" && (
                <button
                  type="button"
                  onClick={() => onAssignStorage(current)}
                  className="rounded-xl bg-[#226049] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a4336] transition-colors cursor-pointer shadow-xs"
                >
                  <Layers size={13} className="inline mr-1.5" />
                  Assign to YucaVault
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-500">
            Batch details not found.
          </div>
        )}
      </div>
    </div>
  );
}
