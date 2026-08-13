"use client";

import React, { useMemo, useState } from "react";
import MarketOrderFilterTabs from "./MarketOrderFilterTabs";
import MarketOrderCard from "./MarketOrderCard";
import Pagination from "./Pagination";
import type { MarketOrder, MarketOrderTab } from "./types";

// Sample data standing in for a real "fetch marketplace orders" call.
const ORDERS: MarketOrder[] = [
  {
    id: "1",
    orderNumber: "MO-2026-014",
    buyer: "Green Valley Processing",
    neededKg: 12000,
    selectedKg: 11300,
    statusLabel: "Pending Consolidation",
    tab: "pending",
    batches: [
      { id: "b1", batchCode: "YC-2026-00142", farmer: "Musa Ibrahim", weightKg: 3300, grade: "A" },
      { id: "b2", batchCode: "YC-2026-00122", farmer: "Global Farms", weightKg: 6000, grade: "A" },
      { id: "b3", batchCode: "YC-2026-00104", farmer: "Garba Farms", weightKg: 2000, grade: "B" },
    ],
  },
  {
    id: "2",
    orderNumber: "MO-2026-015",
    buyer: "Sahel Foods Ltd.",
    neededKg: 8000,
    selectedKg: 8000,
    statusLabel: "Assigned to Vault",
    tab: "assigned",
    batches: [
      { id: "b4", batchCode: "YC-2026-00151", farmer: "Aloba Farms", weightKg: 5000, grade: "A" },
      { id: "b5", batchCode: "YC-2026-00133", farmer: "Kays & Sons", weightKg: 3000, grade: "B" },
    ],
  },
  {
    id: "3",
    orderNumber: "MO-2026-011",
    buyer: "Ibadan Millers Co.",
    neededKg: 10000,
    selectedKg: 10000,
    statusLabel: "In Transit",
    tab: "in-transit",
    batches: [
      { id: "b6", batchCode: "YC-2026-00098", farmer: "Top Farmers Ltd.", weightKg: 7000, grade: "A" },
      { id: "b7", batchCode: "YC-2026-00087", farmer: "Musa Ibrahim", weightKg: 3000, grade: "A" },
    ],
  },
  {
    id: "4",
    orderNumber: "MO-2026-009",
    buyer: "Kano Starch Mills",
    neededKg: 6000,
    selectedKg: 6000,
    statusLabel: "Fulfilled",
    tab: "fulfilled",
    batches: [
      { id: "b8", batchCode: "YC-2026-00065", farmer: "Garba Farms", weightKg: 6000, grade: "B" },
    ],
  },
];

export default function MarketOrdersSection() {
  const [activeTab, setActiveTab] = useState<MarketOrderTab>("all");
  const [page, setPage] = useState(1);

  const counts = useMemo(
    () => ({
      all: ORDERS.length,
      pending: ORDERS.filter((o) => o.tab === "pending").length,
      assigned: ORDERS.filter((o) => o.tab === "assigned").length,
      "in-transit": ORDERS.filter((o) => o.tab === "in-transit").length,
      fulfilled: ORDERS.filter((o) => o.tab === "fulfilled").length,
    }),
    []
  );

  const filteredOrders = useMemo(
    () => (activeTab === "all" ? ORDERS : ORDERS.filter((o) => o.tab === activeTab)),
    [activeTab]
  );

  const currentOrder = filteredOrders[page - 1];

  const handleTabChange = (tab: MarketOrderTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleConsolidate = (order: MarketOrder) => {
    // Replace with your real "consolidate order" call, e.g.:
    // await fetch(`/api/aggregator/orders/${order.orderNumber}/consolidate`, { method: "POST" });
    console.log("Consolidate order", order.orderNumber);
  };

  return (
    <>
      <h1 className="text-lg font-bold text-gray-900">Marketplace Orders</h1>
      <p className="mt-1 text-sm text-gray-500">Track and manage all marketplace orders in real time.</p>

      <div className="mt-6">
        <MarketOrderFilterTabs counts={counts} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      <div className="mt-6">
        {currentOrder ? (
          <MarketOrderCard order={currentOrder} onConsolidate={handleConsolidate} />
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
            No orders in this category.
          </div>
        )}
      </div>

      {filteredOrders.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={filteredOrders.length}
            onPageChange={setPage}
            resultsLabel={`Showing ${page}/${filteredOrders.length} Results`}
          />
        </div>
      )}
    </>
  );
}