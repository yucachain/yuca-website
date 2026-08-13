"use client";

import React, { useMemo, useState } from "react";
import MarketOrderFilterTabs from "./MarketOrderFilterTabs";
import MarketOrderCard from "./MarketOrderCard";
import ConsolidateOrdersModal from "./ConsolidateOrdersModal";
import Pagination from "./Pagination";
import type { MarketOrder, MarketOrderTab } from "./types";

// Enhanced list of orders accepted by buyers from the Marketplace
const ORDERS: MarketOrder[] = [
  {
    id: "1",
    orderNumber: "MO-2026-014",
    buyer: "Drevo Foods Ltd.",
    buyerEmail: "procurement@drevofoods.com",
    buyerPhone: "+234 803 456 7890",
    deliveryLocation: "Ikeja Industrial Estate, Lagos",
    productName: "TME 419 Cassava Stems (Grade A)",
    grade: "A",
    neededKg: 12000,
    selectedKg: 11300,
    pricePerKg: 120,
    totalPrice: 1440000,
    paymentStatus: "Escrow Paid",
    acceptedDate: "Aug 13, 2026 · 10:15 AM",
    statusLabel: "Buyer Accepted - Pending Consolidation",
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
    buyerEmail: "orders@sahelfoods.com",
    buyerPhone: "+234 802 888 9911",
    deliveryLocation: "Challawa Industrial Layout, Kano",
    productName: "Fresh Cassava Tubers (Grade A)",
    grade: "A",
    neededKg: 8000,
    selectedKg: 8000,
    pricePerKg: 110,
    totalPrice: 880000,
    paymentStatus: "Escrow Paid",
    acceptedDate: "Aug 12, 2026 · 02:40 PM",
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
    buyerEmail: "logistics@ibadanmillers.ng",
    buyerPhone: "+234 805 777 4433",
    deliveryLocation: "Challenge, Ibadan, Oyo State",
    productName: "Industrial Cassava Starch Grade B",
    grade: "B",
    neededKg: 10000,
    selectedKg: 10000,
    pricePerKg: 135,
    totalPrice: 1350000,
    paymentStatus: "Credit Approved",
    acceptedDate: "Aug 11, 2026 · 09:30 AM",
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
    buyerEmail: "supplies@kanostarch.com",
    buyerPhone: "+234 809 112 3344",
    deliveryLocation: "Sharada Industrial Phase I, Kano",
    productName: "Yellow Garri Mash (Grade A)",
    grade: "A",
    neededKg: 6000,
    selectedKg: 6000,
    pricePerKg: 140,
    totalPrice: 840000,
    paymentStatus: "Escrow Paid",
    acceptedDate: "Aug 10, 2026 · 11:20 AM",
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
  const [consolidateOrder, setConsolidateOrder] = useState<MarketOrder | null>(null);

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

  return (
    <>
      <h1 className="text-lg font-bold text-gray-900">Marketplace Orders</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review orders accepted by buyers on the Marketplace, manage batch aggregation, and trigger consolidation.
      </p>

      <div className="mt-6">
        <MarketOrderFilterTabs counts={counts} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      <div className="mt-6">
        {currentOrder ? (
          <MarketOrderCard
            order={currentOrder}
            onConsolidate={(order) => setConsolidateOrder(order)}
          />
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

      {/* Consolidation Modal */}
      {consolidateOrder && (
        <ConsolidateOrdersModal
          orders={[
            {
              id: consolidateOrder.id,
              orderNumber: consolidateOrder.orderNumber,
              lotCode: `LOT-${consolidateOrder.orderNumber}`,
              buyer: consolidateOrder.buyer,
              product: consolidateOrder.productName || "Fresh Cassava Tubers",
              weightKg: consolidateOrder.neededKg,
              date: consolidateOrder.acceptedDate || "Today",
              status: "pending",
              paymentMade: consolidateOrder.paymentStatus === "Escrow Paid",
              agreedPriceTotal: consolidateOrder.totalPrice || consolidateOrder.neededKg * 120,
              pricePerKg: consolidateOrder.pricePerKg || 120,
            },
          ]}
          open={!!consolidateOrder}
          onClose={() => setConsolidateOrder(null)}
          onConfirm={(orders) => {
            console.log("Consolidated orders", orders);
            setConsolidateOrder(null);
          }}
        />
      )}
    </>
  );
}