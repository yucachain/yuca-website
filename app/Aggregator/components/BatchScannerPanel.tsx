"use client";

import React, { useState } from "react";
import { ScanLine, QrCode } from "lucide-react";

export interface ScannedBatch {
  batchCode: string;
  farmer: string;
  estWeightKg: number;
  status: string;
}

const MOCK_BATCH: ScannedBatch = {
  batchCode: "YC-2026-00142",
  farmer: "Aminu Bello",
  estWeightKg: 350,
  status: "Awaiting Inspection",
};

export interface BatchScannerPanelProps {
  batch?: ScannedBatch;
  onManualLookup?: (code: string) => void;
}

export default function BatchScannerPanel({
  batch = MOCK_BATCH,
  onManualLookup,
}: BatchScannerPanelProps) {
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState("");

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center gap-2">
        <ScanLine size={18} strokeWidth={1.8} className="text-gray-700" />
        <h3 className="text-base font-semibold text-gray-900">
          Batch scanner and summary
        </h3>
      </div>

      {manualMode ? (
        <div className="mt-5 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-emerald-800/30 bg-emerald-50/30 px-6 py-12">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter batch code, e.g. YC-2026-00142"
            className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm text-gray-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/30"
          />
          <button
            type="button"
            onClick={() => onManualLookup?.(manualCode)}
            className="rounded-lg bg-[#215243] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336]"
          >
            Find Batch
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-800/30 bg-emerald-50/30 px-6 py-10 text-center">
          <QrCode size={72} strokeWidth={1.2} className="text-gray-800" />
          <p className="mt-2 text-sm font-semibold text-emerald-900">
            Camera / QR scanner view
          </p>
          <p className="text-xs text-gray-500">
            Position the QR code within the frame to scan
          </p>
        </div>
      )}

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">OR</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={() => setManualMode((v) => !v)}
        className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
      >
        {manualMode ? "Switch to QR scanner" : "Switch to manual code entry"}
      </button>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <h4 className="text-sm font-bold text-gray-900">Batch Details</h4>

        <div className="mt-3 grid grid-cols-4 gap-2 text-xs font-medium text-gray-500">
          <span>Batch code</span>
          <span>Farmer</span>
          <span>Est Weight</span>
          <span>Status</span>
        </div>
        <div className="mt-2 grid grid-cols-4 items-center gap-2 text-sm text-gray-900">
          <span>{batch.batchCode}</span>
          <span>{batch.farmer}</span>
          <span>{batch.estWeightKg} kg</span>
          <span>
            <span className="inline-flex rounded-full bg-orange-50  text-xs font-medium text-orange-600 whitespace-nowrap">
              {batch.status}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
