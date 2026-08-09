import React from "react";
import type { MarketOrder } from "./types";

const gradeBadgeStyles: Record<string, string> = {
  A: "bg-emerald-50 text-emerald-700",
  B: "bg-orange-50 text-orange-600",
  C: "bg-gray-100 text-gray-600",
};

export interface MarketOrderCardProps {
  order: MarketOrder;
  onConsolidate?: (order: MarketOrder) => void;
}

export default function MarketOrderCard({ order, onConsolidate }: MarketOrderCardProps) {
  const percent = Math.min(100, Math.round((order.selectedKg / order.neededKg) * 100));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Order {order.orderNumber}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Buyer: {order.buyer} · Needed: {order.neededKg.toLocaleString()} kg · Selected so
            far: {order.selectedKg.toLocaleString()} kg
          </p>
        </div>
        <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
          {order.statusLabel}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-emerald-800" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-base font-bold text-gray-900">{percent}%</span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="pb-3 pr-4 font-medium">Batch Code</th>
              <th className="pb-3 pr-4 font-medium">Farmer</th>
              <th className="pb-3 pr-4 font-medium">Weight</th>
              <th className="pb-3 font-medium">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.batches.map((batch) => (
              <tr key={batch.id}>
                <td className="py-3.5 pr-4 text-gray-800">{batch.batchCode}</td>
                <td className="py-3.5 pr-4 text-gray-800">{batch.farmer}</td>
                <td className="py-3.5 pr-4 text-gray-800">
                  {batch.weightKg.toLocaleString()} kg
                </td>
                <td className="py-3.5">
                  <span
                    className={[
                      "inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold",
                      gradeBadgeStyles[batch.grade],
                    ].join(" ")}
                  >
                    {batch.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => onConsolidate?.(order)}
        className="mt-6 rounded-xl bg-[#215243] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336]"
      >
        Consolidate this Orders
      </button>
    </div>
  );
}