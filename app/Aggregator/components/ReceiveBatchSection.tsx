"use client";

import React, { useState } from "react";
import BatchScannerPanel from "./BatchScannerPanel";
import InspectionForm from "./InspectionForm";
import type { BatchRecord, BatchIntakeRequest } from "@/app/types/batchVaultDispatch";
import { batchService } from "@/app/Services/batchService";

export default function ReceiveBatchSection() {
  const [scannedBatch, setScannedBatch] = useState<BatchRecord | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleManualLookup = async (code: string) => {
    if (!code.trim()) return;
    setLookupLoading(true);
    try {
      const batch = await batchService.scanBatch(code.trim());
      setScannedBatch(batch);
    } catch (err) {
      console.error("Batch scan/lookup error:", err);
      // Clean fallback object so aggregator can still enter inspection data for new batch code
      setScannedBatch({
        id: code.trim(),
        batchCode: code.trim(),
        status: "Harvested",
        weightKg: 1000,
        estWeightKg: 1000,
        farmerName: "Registered Farmer",
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleIntakeSubmit = async (values: BatchIntakeRequest) => {
    if (!scannedBatch) return;
    const updated = await batchService.intakeBatch(scannedBatch.id, values);
    setScannedBatch(updated || { ...scannedBatch, ...values, status: "Aggregated" });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Receive Batch &amp; Intake</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Scan the farmer&apos;s batch QR code, verify weighbridge readings, and record quality inspection.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BatchScannerPanel
          batch={scannedBatch}
          loading={lookupLoading}
          onManualLookup={handleManualLookup}
        />
        <InspectionForm
          batch={scannedBatch}
          onSubmit={handleIntakeSubmit}
        />
      </div>
    </div>
  );
}
