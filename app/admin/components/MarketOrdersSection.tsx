"use client";

import React, { useEffect, useMemo, useState } from "react";
import MarketOrderFilterTabs from "./MarketOrderFilterTabs";
import MarketOrderCard from "./MarketOrderCard";
import ConsolidateOrdersModal from "./ConsolidateOrdersModal";
import Pagination from "./Pagination";
import type { MarketOrder, MarketOrderTab } from "./types";
import { adminService } from "@/app/Services/adminService";
import { AdminApiService } from "@/app/Services/admin";
import { Check, RefreshCw, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function MarketOrdersSection() {
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MarketOrderTab>("all");
  const [page, setPage] = useState(1);
  const [consolidateOrder, setConsolidateOrder] = useState<MarketOrder | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load orders and supported statuses strictly from AdminApiService
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [ordersRes, statusesRes] = await Promise.allSettled([
        AdminApiService.getMarketOrders({ page: 1, pageSize: 50 }),
        AdminApiService.getOrderStatuses(),
      ]);

      if (ordersRes.status === "fulfilled") {
        const val: any = ordersRes.value;
        const list: any[] = Array.isArray(val)
          ? val
          : Array.isArray(val?.items)
          ? val.items
          : Array.isArray(val?.data)
          ? val.data
          : [];

        const mapped: MarketOrder[] = list.map((item: any, idx: number) => ({
          id: item.id || item._id || String(idx),
          orderNumber: item.orderNumber || `MO-${item.id?.slice?.(0, 6) || idx + 100}`,
          buyer: item.buyer || item.buyerName || item.customerName || "Marketplace Buyer",
          buyerEmail: item.buyerEmail || item.email,
          buyerPhone: item.buyerPhone || item.phone,
          deliveryLocation: item.deliveryLocation || item.address || "Hub Delivery Area",
          productName: item.productName || item.product || "Cassava Produce",
          grade: item.grade || "A",
          neededKg: item.neededKg || item.totalWeight || item.quantity || 0,
          selectedKg: item.selectedKg || item.fulfilledWeight || item.neededKg || 0,
          pricePerKg: item.pricePerKg ?? item.unitPrice ?? 0,
          totalPrice:
            item.totalPrice ??
            item.totalAmount ??
            (item.neededKg || 0) * (item.pricePerKg ?? item.unitPrice ?? 0),
          paymentStatus:
            item.paymentStatus || (item.isPaid ? "Escrow Paid" : "Pending Payment"),
          acceptedDate: item.acceptedDate || item.createdAt || "Recent",
          statusLabel: item.statusLabel || item.status || "Pending Consolidation",
          tab:
            item.tab ||
            (String(item.status || "").toLowerCase().includes("transit")
              ? "in-transit"
              : String(item.status || "").toLowerCase().includes("fulfill")
              ? "fulfilled"
              : String(item.status || "").toLowerCase().includes("assign")
              ? "assigned"
              : "pending"),
          batches: (item.batches || []).map((b: any, bIdx: number) => ({
            id: b.id || `b-${bIdx}`,
            batchCode: b.batchCode || b.code || `YC-BATCH-${bIdx + 1}`,
            farmer: b.farmer || b.farmerName || "Registered Farmer",
            weightKg: b.weightKg || b.weight || 0,
            grade: b.grade || "A",
          })),
        }));

        setOrders(mapped);
      }
      if (statusesRes.status === "fulfilled" && Array.isArray(statusesRes.value)) {
        setOrderStatuses(statusesRes.value);
      }
    } catch (err: any) {
      console.error("Failed to load market orders from API:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const counts = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((o) => o.tab === "pending").length,
      assigned: orders.filter((o) => o.tab === "assigned").length,
      "in-transit": orders.filter((o) => o.tab === "in-transit").length,
      fulfilled: orders.filter((o) => o.tab === "fulfilled").length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(
    () => (activeTab === "all" ? orders : orders.filter((o) => o.tab === activeTab)),
    [activeTab, orders]
  );

  const currentOrder = filteredOrders[page - 1];

  const handleTabChange = (tab: MarketOrderTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleConfirmConsolidation = async () => {
    if (!consolidateOrder) return;
    setIsProcessing(true);
    const orderId = consolidateOrder.id;
    const vaultLotId = `LOT-${consolidateOrder.orderNumber}`;

    try {
      await AdminApiService.consolidateMarketOrders({
        orderIds: [orderId],
        qualityGrade: consolidateOrder.grade || "A",
        lotCode: vaultLotId,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                tab: "assigned" as const,
                statusLabel: "Consolidated & Assigned to Lot",
              }
            : o
        )
      );

      const msg = `Order ${consolidateOrder.orderNumber} successfully consolidated under Lot ${vaultLotId}!`;
      setActionMessage(msg);
      toast.success(msg);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      console.error("Failed to consolidate orders:", err);
      const errMsg = `Failed to consolidate: ${err?.message || "Server error"}`;
      setActionMessage(errMsg);
      toast.error(errMsg);
      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setIsProcessing(false);
      setConsolidateOrder(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Marketplace Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review orders placed by buyers on the Marketplace, manage batch aggregation, and trigger consolidation.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-[#226049]" : ""} />
          {loading ? "Loading..." : "Refresh Orders"}
        </button>
      </div>

      {actionMessage && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-xs font-medium text-emerald-800 animate-in fade-in">
          <Check size={16} className="text-emerald-700 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      <div className="mt-6">
        <MarketOrderFilterTabs
          counts={counts}
          activeTab={activeTab}
          onChange={handleTabChange}
          orderStatuses={orderStatuses}
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
            <RefreshCw size={24} className="animate-spin text-[#226049] mb-3" />
            <p className="text-sm font-semibold text-gray-900">Loading Marketplace Orders...</p>
            <p className="text-xs text-gray-500 mt-1">Connecting to live orders API</p>
          </div>
        ) : currentOrder ? (
          <MarketOrderCard
            order={currentOrder}
            onConsolidate={(order) => setConsolidateOrder(order)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
              <ShoppingCart size={20} strokeWidth={1.8} />
            </div>
            <p className="text-sm font-bold text-gray-900">No Market Orders Found</p>
            <p className="mt-1 text-xs text-gray-500 max-w-sm">
              {activeTab === "all"
                ? "There are currently no marketplace orders assigned to your hub. When buyers purchase batches from the marketplace, they will appear here live."
                : `No orders found under the "${activeTab}" category.`}
            </p>
          </div>
        )}
      </div>

      {!loading && filteredOrders.length > 0 && (
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
          onConfirm={handleConfirmConsolidation}
        />
      )}
    </>
  );
}