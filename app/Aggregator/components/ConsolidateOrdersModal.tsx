"use client";

import React from "react";
import Modal from "@/app/components/ui/Modal";
import { CheckCheck, PackageCheck } from "lucide-react";
import type { DispatchOrderRecord } from "./types";

export interface ConsolidateOrdersModalProps {
  orders: DispatchOrderRecord[];
  open: boolean;
  onClose: () => void;
  onConfirm: (orders: DispatchOrderRecord[]) => void;
}

export default function ConsolidateOrdersModal({
  orders,
  open,
  onClose,
  onConfirm,
}: ConsolidateOrdersModalProps) {
  if (orders.length === 0) return null;

  const buyer = orders[0].buyer;
  const totalWeightKg = orders.reduce((sum, o) => sum + o.weightKg, 0);
  const totalPrice = orders.reduce((sum, o) => sum + o.agreedPriceTotal, 0);

  return (
    <Modal open={open} onClose={onClose} maxWidthClassName="max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
          <PackageCheck size={22} className="text-emerald-700" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consolidate Orders</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Merge the selected orders into a single consolidated dispatch for{" "}
            <span className="font-semibold text-gray-800">{buyer}</span>.
          </p>
        </div>
      </div>

      {/* Orders table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
              <th className="px-5 py-3 font-medium">Order #</th>
              <th className="px-4 py-3 font-medium">Lot Code</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium text-right">Weight</th>
              <th className="px-5 py-3 font-medium text-right">Agreed Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="bg-white">
                <td className="px-5 py-4 font-semibold text-gray-900">{order.orderNumber}</td>
                <td className="px-4 py-4 text-gray-600">{order.lotCode}</td>
                <td className="px-4 py-4 text-gray-600">{order.product}</td>
                <td className="px-4 py-4 text-right text-gray-800">
                  {order.weightKg.toLocaleString()} kg
                </td>
                <td className="px-5 py-4 text-right text-gray-800">
                  ₦{order.agreedPriceTotal.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals row */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
          <span className="text-sm font-semibold text-gray-700">
            {orders.length} orders combined
          </span>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Weight</p>
              <p className="text-sm font-bold text-gray-900">
                {totalWeightKg.toLocaleString()} kg
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Price</p>
              <p className="text-sm font-bold text-gray-900">
                ₦{totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer payment badge */}
      {orders.every((o) => o.paymentMade) && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
          <CheckCheck size={15} className="text-emerald-700" strokeWidth={2.2} />
          <span className="text-sm font-medium text-emerald-800">
            Payment confirmed for all orders
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onConfirm(orders)}
          className="rounded-xl bg-[#215243] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336]"
        >
          Confirm Consolidation
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
