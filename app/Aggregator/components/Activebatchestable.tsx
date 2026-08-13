import React from "react";
import type { BatchRow, BatchStatus } from "./types";

const statusStyles: Record<BatchStatus, string> = {
  "Assign Storage": "text-blue-700",
  "In Storage": "text-orange-600",
  "Pending Transfer": "text-purple-600",
};

export default function ActiveBatchesTable({
  batches,
  onViewAll,
  onStatusClick,
}: {
  batches: BatchRow[];
  onViewAll?: () => void;
  onStatusClick?: (batch: BatchRow) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Active Batches</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs sm:text-sm font-medium text-emerald-800 hover:underline"
        >
          View all Batches
        </button>
      </div>

      <div className="mt-4 overflow-x-auto touch-scroll">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="pb-3 pr-4 font-medium">Batch Code</th>
              <th className="pb-3 pr-4 font-medium">Seller</th>
              <th className="pb-3 pr-4 font-medium">Weight (KG)</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td className="py-3.5 pr-4 text-gray-800">{batch.batchCode}</td>
                <td className="py-3.5 pr-4 text-gray-800">{batch.seller}</td>
                <td className="py-3.5 pr-4 text-gray-800">
                  {batch.weightKg.toLocaleString()}
                </td>
                <td className="py-3.5">
                  <button
                    type="button"
                    onClick={() => onStatusClick?.(batch)}
                    className={[
                      "font-medium hover:underline",
                      statusStyles[batch.status],
                    ].join(" ")}
                  >
                    {batch.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {batches.length === 0 && (
          <p className="py-3.5 text-sm text-gray-500">No active batches.</p>
        )}
      </div>
    </div>
  );
}
