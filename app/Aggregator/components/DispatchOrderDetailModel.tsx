"use client";

import React from "react";
import  Modal  from "@/app/components/ui/Modal";
import OrderSummaryCard from "./OrderSummaryCard";
import LogisticInfoForm from "./LogisticInfoForm";
import type { DispatchOrderRecord, DispatchOrderSummary } from "./types";
import type { DispatchLogisticsValues } from "@/app/components/validation/schema";

export interface DispatchOrderDetailModalProps {
  order: DispatchOrderRecord | null;
  open: boolean;
  onClose: () => void;
  onConfirmDispatch: (order: DispatchOrderRecord, values: DispatchLogisticsValues) => void | Promise<void>;
  onIssueReceipt: (order: DispatchOrderRecord, values: DispatchLogisticsValues) => void | Promise<void>;
}

export default function DispatchOrderDetailModal({
  order,
  open,
  onClose,
  onConfirmDispatch,
  onIssueReceipt,
}: DispatchOrderDetailModalProps) {
  if (!order) return null;

  const summary: DispatchOrderSummary = {
    orderNumber: order.orderNumber,
    lotCode: order.lotCode,
    buyer: order.buyer,
    paymentMade: order.paymentMade,
    agreedPriceTotal: order.agreedPriceTotal,
    pricePerKg: order.pricePerKg,
    lotWeightKg: order.weightKg,
    pickupHub: order.pickupHub,
  };

  return (
    <Modal open={open} onClose={onClose} maxWidthClassName="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900">Dispatch Order</h2>
      <div className="mt-1 flex items-center gap-3">
        <p className="text-sm text-gray-500">Order {summary.orderNumber}</p>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          Lot {summary.lotCode}
        </span>
      </div>

      <div className="mt-6 space-y-6">
        <OrderSummaryCard order={summary} />
        <LogisticInfoForm
          onConfirmDispatch={(values) => onConfirmDispatch(order, values)}
          onIssueReceipt={(values) => onIssueReceipt(order, values)}
        />
      </div>
    </Modal>
  );
}