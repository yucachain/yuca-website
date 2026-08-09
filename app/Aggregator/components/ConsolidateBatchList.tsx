import React from "react";
import { Check } from "lucide-react";
import type { ConsolidationBatch } from "./types";

const gradeBadgeStyles: Record<string, string> = {
  A: "bg-emerald-50 text-emerald-700",
  B: "bg-orange-50 text-orange-600",
  C: "bg-gray-100 text-gray-600",
};

export interface ConsolidationBatchListProps {
  batches: ConsolidationBatch[];
  onToggle: (id: string) => void;
}

export default function ConsolidationBatchList({
  batches,
  onToggle,
}: ConsolidationBatchListProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900">Batches in this order</h3>

      <div className="mt-4 space-y-3">
        {batches.map((batch) => (
          <button
            key={batch.id}
            type="button"
            onClick={() => onToggle(batch.id)}
            className={[
              "flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-colors",
              batch.selected ? "border-emerald-700 bg-emerald-50/30" : "border-gray-200 hover:bg-gray-50",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                batch.selected ? "bg-emerald-800 text-white" : "border-2 border-gray-300 text-transparent",
              ].join(" ")}
            >
              <Check size={16} strokeWidth={2.5} />
            </span>

            <span className="flex-1">
              <span className="block text-base font-semibold text-gray-900">
                {batch.batchCode}
              </span>
              <span className="block text-sm text-gray-500">{batch.farmer}</span>
            </span>

            <span
              className={[
                "shrink-0 rounded-full px-3 py-1 text-sm font-medium",
                gradeBadgeStyles[batch.grade],
              ].join(" ")}
            >
              Grade {batch.grade}
            </span>

            <span className="w-24 shrink-0 text-right text-base font-bold text-gray-900">
              {batch.weightKg.toLocaleString()} kg
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}