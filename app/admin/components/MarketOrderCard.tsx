import React from "react";
import { ShoppingBag, MapPin, CheckCircle, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import type { MarketOrder } from "./types";

const gradeBadgeStyles: Record<string, string> = {
  A: "bg-emerald-50 text-emerald-700 border-emerald-200",
  B: "bg-amber-50 text-amber-700 border-amber-200",
  C: "bg-gray-100 text-gray-600 border-gray-200",
};

export interface MarketOrderCardProps {
  order: MarketOrder;
  onConsolidate?: (order: MarketOrder) => void;
}

export default function MarketOrderCard({ order, onConsolidate }: MarketOrderCardProps) {
  const percent = Math.min(100, Math.round((order.selectedKg / order.neededKg) * 100));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 shadow-xs">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Order {order.orderNumber}</h3>
            {order.paymentStatus && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck size={13} className="text-emerald-700" />
                {order.paymentStatus}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
            <ShoppingBag size={15} className="text-emerald-700" />
            {order.productName || "Cassava Batch Order"}
          </p>

          {order.acceptedDate && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={12} /> Accepted by buyer: {order.acceptedDate}
            </p>
          )}
        </div>

        <span className="rounded-full bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-900">
          {order.statusLabel}
        </span>
      </div>

      {/* Buyer & Financial Details Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl bg-gray-50/80 p-4 border border-gray-100 text-xs sm:text-sm">
        <div>
          <span className="block text-gray-400 text-xs font-medium">Buyer Details</span>
          <span className="block font-bold text-gray-900 mt-0.5">{order.buyer}</span>
          {order.buyerEmail && (
            <span className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Mail size={12} /> {order.buyerEmail}
            </span>
          )}
          {order.buyerPhone && (
            <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Phone size={12} /> {order.buyerPhone}
            </span>
          )}
        </div>

        <div>
          <span className="block text-gray-400 text-xs font-medium">Delivery Address</span>
          <span className="flex items-start gap-1 font-medium text-gray-800 mt-0.5">
            <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-700" />
            {order.deliveryLocation || "Standard Hub Delivery"}
          </span>
        </div>

        <div>
          <span className="block text-gray-400 text-xs font-medium">Financial Overview</span>
          <div className="mt-0.5">
            <span className="text-base font-bold text-emerald-900">
              ₦{(order.totalPrice || order.neededKg * (order.pricePerKg || 0)).toLocaleString()}
            </span>
            <span className="block text-xs text-gray-500">
              Unit Rate: ₦{(order.pricePerKg || 0).toLocaleString()} / kg
            </span>
          </div>
        </div>
      </div>

      {/* Consolidation Progress */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
          <span>Aggregation Progress</span>
          <span className="font-semibold text-gray-900">
            {order.selectedKg.toLocaleString()} / {order.neededKg.toLocaleString()} kg ({percent}%)
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-[#226049] transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Batches Table */}
      <div className="mt-6 overflow-x-auto touch-scroll">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="pb-3 pr-4 font-medium">Batch Code</th>
              <th className="pb-3 pr-4 font-medium">Farmer / Supplier</th>
              <th className="pb-3 pr-4 font-medium">Weight</th>
              <th className="pb-3 font-medium">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.batches.map((batch) => (
              <tr key={batch.id}>
                <td className="py-3.5 pr-4 font-semibold text-gray-900">{batch.batchCode}</td>
                <td className="py-3.5 pr-4 text-gray-800">{batch.farmer}</td>
                <td className="py-3.5 pr-4 text-gray-800">
                  {batch.weightKg.toLocaleString()} kg
                </td>
                <td className="py-3.5">
                  <span
                    className={[
                      "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-bold",
                      gradeBadgeStyles[batch.grade],
                    ].join(" ")}
                  >
                    Grade {batch.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          * Consolidating will allocate verified batches into a single YucaVault storage unit for dispatch.
        </p>

        <button
          type="button"
          onClick={() => onConsolidate?.(order)}
          className="w-full sm:w-auto rounded-xl bg-[#226049] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1a4b39] shadow-sm cursor-pointer"
        >
          Consolidate this Order
        </button>
      </div>
    </div>
  );
}