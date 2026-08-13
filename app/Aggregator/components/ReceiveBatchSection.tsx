"use client";

import React from "react";
import BatchScannerPanel from "./BatchScannerPanel";
import InspectionForm from "./InspectionForm";
import type { ReceiveBatchValues } from "@/app/components/validation/schema";

export default function ReceiveBatchSection() {
  const handleSubmit = async (values: ReceiveBatchValues) => {
    // Replace with your real "confirm receipt" call, e.g.:
    // await fetch("/api/aggregator/batches/receive", { method: "POST", body: JSON.stringify(values) });
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("Batch received:", values);
  };

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-900">Receive Batch</h1>
      <p className="mt-1 text-sm text-gray-500">
        Scan the farmer&apos;s QR code, verify net weight, and grade the
        produce.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BatchScannerPanel />
        <InspectionForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
