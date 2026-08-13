import React from "react";
import { CheckCheck } from "lucide-react";
import type { DispatchOrderSummary } from "./types";

function SummaryRow({
  label,
  children,
  isLast = false,
}: {
  label: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-4 py-4",
        isLast ? "" : "border-b border-gray-100",
      ].join(" ")}
    >
      <span className="text-sm text-gray-500">{label}</span>
      <span className="flex items-center gap-2 text-right text-sm font-semibold text-gray-900">
        {children}
      </span>
    </div>
  );
}

export default function OrderSummaryCard({
  order,
}: {
  order: DispatchOrderSummary;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <h3 className="text-sm font-bold text-gray-900">Order Summary</h3>

      <div className="mt-2">
        <SummaryRow label="Buyer">
          {order.buyer}
          {order.paymentMade && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <CheckCheck size={13} strokeWidth={2.2} />
              Payment Made
            </span>
          )}
        </SummaryRow>

        <SummaryRow label="Agreed Price">
          ₦{order.agreedPriceTotal.toLocaleString()} ({order.pricePerKg}/kg)
        </SummaryRow>

        <SummaryRow label="Batch / Lot Details">
          {order.lotCode} ({order.lotWeightKg.toLocaleString()} kg)
        </SummaryRow>

        <SummaryRow label="Delivery Address" isLast>
          {order.buyerDeliveryAddress}
        </SummaryRow>
      </div>
    </div>
  );
}
