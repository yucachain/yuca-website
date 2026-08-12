"use client";

import React from "react";
import  Modal  from "@/app/components/ui/Modal";
import type { DispatchOrderRecord } from "./types";

function InfoRow({ label, value, valueClassName = "" }: { label: string; value: React.ReactNode; valueClassName?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={["mt-0.5 text-base font-bold text-gray-900", valueClassName].join(" ")}>{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, isTotal = false }: { label: string; value: string; isTotal?: boolean }) {
  return (
    <div
      className={[
        "flex items-center justify-between py-2.5",
        isTotal ? "border-t border-gray-200 pt-3" : "",
      ].join(" ")}
    >
      <span className={isTotal ? "text-base font-bold text-gray-900" : "text-sm text-gray-500"}>
        {label}
      </span>
      <span className={isTotal ? "text-base font-bold text-gray-900" : "text-sm text-gray-700"}>
        {value}
      </span>
    </div>
  );
}

export interface DispatchReceiptModalProps {
  order: DispatchOrderRecord | null;
  open: boolean;
  onClose: () => void;
  onDownloadReceipt: (order: DispatchOrderRecord) => void;
}

export default function DispatchReceiptModal({
  order,
  open,
  onClose,
  onDownloadReceipt,
}: DispatchReceiptModalProps) {
  if (!order) return null;

  const requestedDate = order.date;
  const dispatchedDate = order.date;
  const dispatchedTime = "3:45 PM";
  const dispatchedBy = "Penpal";
  const invoiceNo = 'invoiceNo' in order && (order as any).invoiceNo
    ? (order as any).invoiceNo
    : `AGG-2026-${order.id.padStart(4, "0")}`;
  const storageFee = 'storageFee' in order ? (order as any).storageFee ?? 5000 : 5000;
  const logisticFee = 10000;
  const otherCharges = 'otherCharges' in order ? (order as any).otherCharges ?? 1000 : 1000;
  const subtotal = order.agreedPriceTotal;
  const total = subtotal + storageFee + logisticFee + otherCharges;

  return (
    <Modal open={open} onClose={onClose} maxWidthClassName="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900">Dispatch Order</h2>
      <p className="mt-1 text-sm text-gray-500">Order dispatched successfully!</p>

      <div className="mt-6 rounded-2xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <div className="space-y-5">
            <p className="text-base font-bold text-gray-900">Order Information</p>
            <InfoRow label="Order ID" value={order.orderNumber} />
            <InfoRow label="Lot / Consolidation" value={order.lotCode} />
            <InfoRow label="Product" value={order.product} />
            <InfoRow label="Quantity" value={`${order.weightKg.toLocaleString()} kg`} />
            <InfoRow label="Requested Date" value={requestedDate} />
          </div>

          <div className="space-y-5 sm:border-l sm:border-gray-100 sm:pl-8">
            <p className="text-base font-bold text-gray-900">Dispatch Information</p>
            <InfoRow
              label="Dispatched Date"
              value={
                <>
                  {dispatchedDate}{" "}
                  <span className="font-normal text-gray-500">{dispatchedTime}</span>
                </>
              }
            />
            <InfoRow label="Storage Unit" value={order.storageLabel ?? "Not Assigned"} />
            <InfoRow label="Location" value={order.pickupHub} />
            <InfoRow label="Dispatched By" value={dispatchedBy} />
            <InfoRow label="Invoice No." value={invoiceNo} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 p-6">
        <p className="mb-2 text-base font-bold text-gray-900">Summary</p>
        <SummaryRow label="Subtotal" value={`₦${subtotal.toLocaleString()}`} />
        <SummaryRow label="Storage fee" value={`₦${storageFee.toLocaleString()}`} />
        <SummaryRow label="Logistic fee" value={`₦${logisticFee.toLocaleString()}`} />
        <SummaryRow label="Other Charges" value={`₦${otherCharges.toLocaleString()}`} />
        <SummaryRow label="Total" value={`₦${total.toLocaleString()}`} isTotal />
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => onDownloadReceipt(order)}
          className="rounded-xl bg-[#215243] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336]"
        >
          Download Receipt
        </button>
      </div>
    </Modal>
  );
}