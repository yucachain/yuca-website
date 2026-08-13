import React from "react";

export interface ConsolidationSummaryProps {
  combinedKg: number;
  neededKg: number;
}

export default function ConsolidationSummary({
  combinedKg,
  neededKg,
}: ConsolidationSummaryProps) {
  const percent = neededKg > 0 ? Math.min(100, Math.round((combinedKg / neededKg) * 100)) : 0;

  return (
    <div className="mt-6 rounded-2xl bg-emerald-50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">Combined total</p>
          <p className="text-sm font-bold text-emerald-900">
            {combinedKg.toLocaleString()} kg
          </p>
        </div>

        <div className="flex-1 sm:max-w-md">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-emerald-900">{percent}%</span> of{" "}
            {neededKg.toLocaleString()} kg needed
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-emerald-800"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900">{percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}