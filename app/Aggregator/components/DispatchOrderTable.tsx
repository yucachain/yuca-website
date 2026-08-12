import React from "react";
import DispatchOrderRowMenu from "./DispatchOrderRowMenu";
import type { DispatchOrderRecord, DispatchOrderStatus } from "./types";

const statusBadgeStyles: Record<DispatchOrderStatus, string> = {
  pending: "bg-orange-50 text-orange-600",
  dispatched: "bg-emerald-50 text-emerald-700",
  "in-transit": "bg-indigo-50 text-indigo-700",
};

const statusLabels: Record<DispatchOrderStatus, string> = {
  pending: "Pending",
  dispatched: "Dispatched",
  "in-transit": "In Transit",
};

export interface DispatchOrderTableProps {
  orders: DispatchOrderRecord[];
  onAssignStorage: (order: DispatchOrderRecord) => void;
  onAssignVault: (order: DispatchOrderRecord) => void;
  onViewDetails: (order: DispatchOrderRecord) => void;
  onViewReceipt: (order: DispatchOrderRecord) => void;
}

export default function DispatchOrderTable({
  orders,
  onAssignStorage,
  onAssignVault,
  onViewDetails,
  onViewReceipt,
}: DispatchOrderTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500">
            <th className="px-6 py-4 font-medium">Batch Code</th>
            <th className="px-4 py-4 font-medium">Buyer</th>
            <th className="px-4 py-4 font-medium">Product</th>
            <th className="px-4 py-4 font-medium">Weight</th>
            <th className="px-4 py-4 font-medium">Date</th>
            <th className="px-4 py-4 font-medium">Status</th>
            <th className="px-4 py-4 font-medium">Storage</th>
            <th className="px-6 py-4 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-5 align-top">
                <span className="block font-semibold text-gray-900">
                  Order {order.orderNumber}
                </span>
                <span className="block text-xs text-gray-500">Lot {order.lotCode}</span>
              </td>
              <td className="px-4 py-5 align-top text-gray-800">{order.buyer}</td>
              <td className="px-4 py-5 align-top text-gray-800">{order.product}</td>
              <td className="px-4 py-5 align-top text-gray-800">
                {order.weightKg.toLocaleString()} kg
              </td>
              <td className="px-4 py-5 align-top text-gray-800">{order.date}</td>
              <td className="px-4 py-5 align-top">
                <span
                  className={[
                    "inline-block rounded-lg px-3 py-1 text-xs font-semibold",
                    statusBadgeStyles[order.status],
                  ].join(" ")}
                >
                  {statusLabels[order.status]}
                </span>
              </td>
              <td className="px-4 py-5 align-top text-gray-800">
                {order.storageLabel ?? "Not Assigned"}
              </td>
              <td className="px-6 py-5 align-top">
                <DispatchOrderRowMenu
                  order={order}
                  onAssignStorage={onAssignStorage}
                  onAssignVault={onAssignVault}
                  onViewDetails={onViewDetails}
                  onViewReceipt={onViewReceipt}
                />
              </td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                No orders in this category.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}