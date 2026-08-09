"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import DispatchOrderFilterTabs, { DispatchOrderTab } from "./DispatchOrderFilter";
import DispatchOrderTable from "./DispatchOrderTable";
import Pagination from "./Pagination";
import OrderSummaryCard from "./OrderSummaryCard";
import LogisticInfoForm from "./LogisticInfoForm";
import type { DispatchOrderRecord, DispatchOrderSummary } from "./types";
import type { DispatchLogisticsValues } from "@/app/components/validation/schema";

const PER_PAGE = 5;

// Sample data standing in for a real "fetch dispatch orders" call.
// 4 pending + 5 dispatched + 3 in-transit = 12 total, matching the "All (12)" tab count.
const ORDERS: DispatchOrderRecord[] = [
  {
    id: "1",
    orderNumber: "MO-2026-014",
    lotCode: "CL-2026-00031",
    buyer: "Agbetoba Farms",
    product: "Cassava Stems",
    weightKg: 11300,
    date: "Aug 27, 2026",
    status: "pending",
    paymentMade: true,
    agreedPriceTotal: 3955000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "2",
    orderNumber: "MO-2026-112",
    lotCode: "CL-2026-00045",
    buyer: "Greenland Farms",
    product: "Cassava Flour",
    weightKg: 13000,
    date: "Aug 12, 2026",
    status: "pending",
    paymentMade: false,
    agreedPriceTotal: 4550000,
    pricePerKg: 350,
    pickupHub: "YucaVault #3, Ibadan",
  },
  {
    id: "3",
    orderNumber: "MO-2026-034",
    lotCode: "CL-2026-00052",
    buyer: "Grando Ltd",
    product: "Cassava Stems",
    weightKg: 5000,
    date: "Sep 27, 2026",
    status: "in-transit",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 1750000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "4",
    orderNumber: "MO-2026-044",
    lotCode: "CL-2026-00061",
    buyer: "Penpal Farms",
    product: "Cassava Flour",
    weightKg: 11300,
    date: "Jul 27, 2026",
    status: "pending",
    paymentMade: false,
    agreedPriceTotal: 3955000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "5",
    orderNumber: "MO-2026-016",
    lotCode: "CL-2026-00027",
    buyer: "Agbetoba Farms",
    product: "Cassava Stems",
    weightKg: 2000,
    date: "May 27, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 700000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "6",
    orderNumber: "MO-2026-018",
    lotCode: "CL-2026-00029",
    buyer: "Nino Farms",
    product: "Cassava Stems",
    weightKg: 4200,
    date: "May 2, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #3, Ibadan",
    paymentMade: true,
    agreedPriceTotal: 1470000,
    pricePerKg: 350,
    pickupHub: "YucaVault #3, Ibadan",
  },
  {
    id: "7",
    orderNumber: "MO-2026-021",
    lotCode: "CL-2026-00033",
    buyer: "GoldenPearl Ltd",
    product: "Cassava Flour",
    weightKg: 6000,
    date: "Apr 18, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 2100000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "8",
    orderNumber: "MO-2026-025",
    lotCode: "CL-2026-00038",
    buyer: "Kays & Sons",
    product: "Cassava Stems",
    weightKg: 3300,
    date: "Mar 9, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 1155000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "9",
    orderNumber: "MO-2026-028",
    lotCode: "CL-2026-00041",
    buyer: "Grando Ltd",
    product: "Cassava Flour",
    weightKg: 7000,
    date: "Feb 21, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #3, Ibadan",
    paymentMade: true,
    agreedPriceTotal: 2450000,
    pricePerKg: 350,
    pickupHub: "YucaVault #3, Ibadan",
  },
  {
    id: "10",
    orderNumber: "MO-2026-031",
    lotCode: "CL-2026-00047",
    buyer: "Green Valley",
    product: "Cassava Stems",
    weightKg: 9000,
    date: "Jun 14, 2026",
    status: "in-transit",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 3150000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "11",
    orderNumber: "MO-2026-036",
    lotCode: "CL-2026-00054",
    buyer: "Nino Farms",
    product: "Cassava Flour",
    weightKg: 5500,
    date: "Jun 30, 2026",
    status: "in-transit",
    storageLabel: "YucaVault #3, Ibadan",
    paymentMade: true,
    agreedPriceTotal: 1925000,
    pricePerKg: 350,
    pickupHub: "YucaVault #3, Ibadan",
  },
  {
    id: "12",
    orderNumber: "MO-2026-039",
    lotCode: "CL-2026-00057",
    buyer: "Greenland Farms",
    product: "Cassava Stems",
    weightKg: 4800,
    date: "Jul 5, 2026",
    status: "pending",
    paymentMade: false,
    agreedPriceTotal: 1680000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
];

export interface DispatchOrderSectionProps {
  onAssignStorage?: (order: DispatchOrderRecord) => void;
}

export default function DispatchOrderSection({ onAssignStorage }: DispatchOrderSectionProps) {
  const [activeTab, setActiveTab] = useState<DispatchOrderTab>("all");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: ORDERS.length,
      pending: ORDERS.filter((o) => o.status === "pending").length,
      dispatched: ORDERS.filter((o) => o.status === "dispatched").length,
      "in-transit": ORDERS.filter((o) => o.status === "in-transit").length,
    }),
    []
  );

  const filtered = useMemo(
    () => (activeTab === "all" ? ORDERS : ORDERS.filter((o) => o.status === activeTab)),
    [activeTab]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const startIndex = (page - 1) * PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + PER_PAGE);
  const rangeEnd = Math.min(startIndex + PER_PAGE, filtered.length);

  const selectedOrder = ORDERS.find((o) => o.id === selectedOrderId) ?? null;

  const handleTabChange = (tab: DispatchOrderTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleConfirmDispatch = async (values: DispatchLogisticsValues) => {
    // Replace with your real "confirm dispatch" call, e.g.:
    // await fetch(`/api/aggregator/orders/${selectedOrder?.orderNumber}/dispatch`, {
    //   method: "POST",
    //   body: JSON.stringify(values),
    // });
    console.log("Confirm dispatch", selectedOrder?.orderNumber, values);
  };

  const handleIssueReceipt = async (values: DispatchLogisticsValues) => {
    // Replace with your real "issue receipt" call.
    console.log("Issue receipt", selectedOrder?.orderNumber, values);
  };

  // --- Detail view -------------------------------------------------
  if (selectedOrder) {
    const summary: DispatchOrderSummary = {
      orderNumber: selectedOrder.orderNumber,
      lotCode: selectedOrder.lotCode,
      buyer: selectedOrder.buyer,
      paymentMade: selectedOrder.paymentMade,
      agreedPriceTotal: selectedOrder.agreedPriceTotal,
      pricePerKg: selectedOrder.pricePerKg,
      lotWeightKg: selectedOrder.weightKg,
      pickupHub: selectedOrder.pickupHub,
    };

    return (
      <>
        <button
          type="button"
          onClick={() => setSelectedOrderId(null)}
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to Dispatch Orders
        </button>

        <h1 className="text-3xl font-bold text-gray-900">Dispatch Order</h1>
        <div className="mt-1 flex items-center gap-3">
          <p className="text-sm text-gray-500">Order {summary.orderNumber}</p>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            Lot {summary.lotCode}
          </span>
        </div>

        <div className="mt-6 space-y-6">
          <OrderSummaryCard order={summary} />
          <LogisticInfoForm
            onConfirmDispatch={handleConfirmDispatch}
            onIssueReceipt={handleIssueReceipt}
          />
        </div>
      </>
    );
  }

  // --- List view -----------------------------------------------------
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900">Dispatch Order</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage orders, storage assignments, and deliveries
      </p>

      <div className="mt-6">
        <DispatchOrderFilterTabs counts={counts} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      <div className="mt-6">
        <DispatchOrderTable
          orders={pageItems}
          onAssignStorage={(order) => onAssignStorage?.(order)}
          onViewDetails={(order) => setSelectedOrderId(order.id)}
          onViewReceipt={(order) => setSelectedOrderId(order.id)}
        />
      </div>

      {filtered.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            resultsLabel={`Showing ${startIndex + 1}-${rangeEnd} of ${filtered.length} Results`}
          />
        </div>
      )}
    </>
  );
}