"use client";

import React, { useState } from "react";
import BatchScannerPanel from "./BatchScannerPanel";
import InspectionForm from "./InspectionForm";
import type { BatchRecord, BatchIntakeRequest } from "@/app/types/batchVaultDispatch";
import { batchService } from "@/app/Services/batchService";

export default function ReceiveBatchSection() {
  const [scannedBatch, setScannedBatch] = useState<BatchRecord | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleManualLookup = async (code: string) => {
    if (!code.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    try {
      const batch = await batchService.lookupBatch(code.trim());
      if (!batch) {
        setLookupError(`No batch found matching code "${code.trim()}". Please verify the batch code.`);
        setScannedBatch(null);
      } else {
        setScannedBatch(batch);
        setLookupError(null);
      }
    } catch (err: any) {
      const msg =
        err?.message ||
        "Unable to lookup batch. Please verify your admin session and try again.";
      setLookupError(msg);
      setScannedBatch(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleIntakeSubmit = async (values: BatchIntakeRequest) => {
    if (!scannedBatch) return;
    try {
      const batchId = scannedBatch.id || scannedBatch.batchCode;
      const updated = await batchService.intakeBatch(batchId, values);
      setScannedBatch(updated || { ...scannedBatch, ...values, status: "Aggregated" });
    } catch (err: any) {
      setLookupError(err?.message || "Failed to submit batch intake.");
    }
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
          errorMessage={lookupError}
          onClearError={() => setLookupError(null)}
        />
        <InspectionForm
          batch={scannedBatch}
          onSubmit={handleIntakeSubmit}
        />
      </div>
    </div>
  );
}
