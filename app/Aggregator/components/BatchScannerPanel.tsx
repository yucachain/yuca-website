"use client";

import React, { useState } from "react";
import { ScanLine, QrCode, Search, Loader2 } from "lucide-react";
import type { BatchRecord } from "@/app/types/batchVaultDispatch";

export interface BatchScannerPanelProps {
  batch?: BatchRecord | null;
  loading?: boolean;
  onManualLookup?: (code: string) => void;
}

export default function BatchScannerPanel({
  batch,
  loading = false,
  onManualLookup,
}: BatchScannerPanelProps) {
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const handleLookup = () => {
    if (!manualCode.trim()) return;
    onManualLookup?.(manualCode.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLookup();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
      <div className="flex items-center gap-2">
        <ScanLine size={18} strokeWidth={1.8} className="text-[#226049]" />
        <h3 className="text-sm font-bold text-gray-900">
          Batch Scanner &amp; Verification
        </h3>
      </div>

      {manualMode ? (
        <div className="mt-5 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-emerald-800/20 bg-emerald-50/20 px-6 py-10">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter batch code, e.g. YC-2026-00142"
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-center text-sm font-mono text-gray-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 shadow-2xs"
            />
          </div>
          <button
            type="button"
            onClick={handleLookup}
            disabled={loading || !manualCode.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#226049] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1a4336] disabled:opacity-60 cursor-pointer shadow-xs"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            Find Batch
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-800/20 bg-emerald-50/20 px-6 py-10 text-center">
          <QrCode size={68} strokeWidth={1.2} className="text-gray-800" />
          <p className="mt-2 text-sm font-semibold text-emerald-950">
            Camera / QR Scanner View
          </p>
          <p className="text-xs text-gray-500 max-w-xs">
            Scan farmer delivery note QR code or use the manual batch lookup below
          </p>
        </div>
      )}

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-100" />
        <span className="text-[10px] font-semibold text-gray-400">OR</span>
        <span className="h-px flex-1 bg-gray-100" />
      </div>

      <button
        type="button"
        onClick={() => setManualMode((v) => !v)}
        className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
      >
        {manualMode ? "Switch to QR Camera Scanner" : "Switch to Manual Batch Code Entry"}
      </button>

      {/* Batch Summary */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Scanned Batch Summary
        </h4>

        {batch ? (
          <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Batch Code:</span>
              <span className="font-mono font-bold text-gray-900">{batch.batchCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Farmer / Supplier:</span>
              <span className="font-semibold text-gray-800">
                {batch.farmerName || batch.farmer || batch.sellerName || "Registered Farmer"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Est. Weight:</span>
              <span className="font-semibold text-gray-900">
                {(batch.weightKg || batch.estWeightKg || 0).toLocaleString()} kg
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Current Status:</span>
              <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-[#226049]">
                {batch.status}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2 italic">
            Scan a batch code or enter one manually to load batch information.
          </p>
        )}
      </div>
    </div>
  );
}
