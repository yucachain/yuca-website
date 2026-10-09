"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Building,
  User,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useMarketplaceRole, MarketOrderItem } from "../context/MarketplaceRoleContext";
import { marketplaceApi } from "@/app/Services/marketplaceService";
import { toast } from "sonner";

interface UserOrdersAndSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "purchases" | "sales";
}

export default function UserOrdersAndSalesModal({
  isOpen,
  onClose,
  initialTab = "purchases",
}: UserOrdersAndSalesModalProps) {
  const { activeRole, currentUser, myOrders: localOrders, mySales: localSales } = useMarketplaceRole();
  const isConsumer = activeRole === "consumer";

  const [activeTab, setActiveTab] = useState<"purchases" | "sales">(
    isConsumer ? "purchases" : initialTab
  );
  const [remoteOrders, setRemoteOrders] = useState<any[]>([]);
  const [remoteSales, setRemoteSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState<string | null>(null);

  const fetchRemoteData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, salesRes] = await Promise.all([
        marketplaceApi.getMyOrders().catch(() => []),
        marketplaceApi.getSellerSales().catch(() => []),
      ]);

      if (Array.isArray(ordersRes) && ordersRes.length > 0) {
        setRemoteOrders(ordersRes);
      }
      if (Array.isArray(salesRes) && salesRes.length > 0) {
        setRemoteSales(salesRes);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRemoteData();
    }
  }, [isOpen, fetchRemoteData]);

  if (!isOpen) return null;

  // Merge remote items with local items
  const mergedOrders = remoteOrders.length > 0
    ? remoteOrders.map((ro) => ({
      id: ro.id || ro.orderId || ro.orderNumber,
      orderNumber: ro.orderNumber || ro.id,
      productTitle: ro.productTitle || ro.productName || ro.variety || "Cassava Produce",
      category: ro.category || "Produce",
      sellerName: ro.sellerName || ro.seller || "Verified Farmer Hub",
      sellerRole: (ro.sellerRole || "farmer") as any,
      buyerName: ro.buyerName || currentUser.name,
      buyerRole: activeRole,
      quantity: ro.quantityKg ? ro.quantityKg / 1000 : (ro.quantity || 1),
      unit: ro.unit || "Tonnes",
      totalAmount: ro.totalAmount || ro.total || ro.price || 0,
      date: ro.createdAt ? new Date(ro.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      deliveryMethod: ro.deliveryMethod || "yucavault-pickup",
      paymentMethod: "bank-transfer",
      paymentStatus: ro.paymentStatus || ro.status || "Paid to YucaChain Escrow",
      payoutStatus: ro.payoutStatus || "Pending Admin Payout",
      isDelivered: ro.status === "Delivered" || ro.isDelivered,
      sellerBankDetails: ro.sellerBankDetails || { bankName: "YucaChain Escrow", accountNumber: "3084920194", accountName: "Yuca Escrow" },
    }))
    : localOrders;

  const mergedSales = remoteSales.length > 0
    ? remoteSales.map((rs) => ({
      id: rs.id || rs.orderNumber,
      orderNumber: rs.orderNumber,
      productTitle: rs.productTitle || rs.productName || "Cassava Batch",
      buyerName: rs.buyerName || "Marketplace Buyer",
      buyerRole: "processor" as any,
      totalAmount: rs.totalAmount || rs.amount || 0,
      date: rs.date || rs.createdAt ? new Date(rs.date || rs.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      payoutStatus: rs.payoutStatus || "Paid / Disbursed",
      deliveryMethod: rs.deliveryMethod || "yucavault-pickup",
    }))
    : localSales;

  const handleConfirmDelivery = async (orderNumber: string) => {
    try {
      setConfirmingOrder(orderNumber);
      await marketplaceApi.confirmDelivery(orderNumber);
      toast.success(`Delivery confirmed for order ${orderNumber}! Escrow released to seller.`);
      fetchRemoteData();
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm delivery");
    } finally {
      setConfirmingOrder(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-100 font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 mb-6 pr-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#226049]">
              {activeTab === "purchases" ? <ShoppingBag size={22} /> : <TrendingUp size={22} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {isConsumer ? "My Orders & Purchases" : "Orders & Sales Activity"}
              </h3>
              <p className="text-xs text-gray-500">
                {isConsumer
                  ? "Track items you have ordered from the YucaChain marketplace"
                  : "Manage your purchases and check Admin payout status on your sales"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchRemoteData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh order history"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-[#226049]" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Tabs (Hidden for Consumer) */}
        {!isConsumer && (
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6 text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab("purchases")}
              className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "purchases"
                ? "bg-white text-gray-900 shadow-xs"
                : "hover:text-gray-900"
                }`}
            >
              <ShoppingBag size={14} />
              <span>My Purchases &amp; Orders ({mergedOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sales")}
              className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "sales"
                ? "bg-white text-gray-900 shadow-xs"
                : "hover:text-gray-900"
                }`}
            >
              <TrendingUp size={14} />
              <span>My Sales &amp; Disbursements ({mergedSales.length})</span>
            </button>
          </div>
        )}

        {/* Content: Purchases Tab */}
        {activeTab === "purchases" && (
          <div className="space-y-3">
            {mergedOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ShoppingBag size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No purchases placed yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Items you checkout from the marketplace will appear here.
                </p>
              </div>
            ) : (
              mergedOrders.map((ord: any) => {
                const isConfirmed = ord.isDelivered || ord.paymentStatus === "Completed" || ord.status === "Delivered";
                const isConfirming = confirmingOrder === ord.orderNumber;

                return (
                  <div
                    key={ord.id || ord.orderNumber}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs hover:border-gray-200 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs text-gray-400">{ord.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={13} />
                          {ord.paymentStatus || "Paid to Escrow"}
                        </span>

                        {!isConfirmed && (
                          <button
                            type="button"
                            onClick={() => handleConfirmDelivery(ord.orderNumber)}
                            disabled={isConfirming}
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#226049] text-white hover:bg-[#1b4d3a] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isConfirming ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            <span>Confirm Delivery</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{ord.productTitle}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Supplier: <span className="font-semibold text-gray-700">{ord.sellerName}</span> ({ord.sellerRole})
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <Truck size={13} className="text-gray-400" />
                          <span>
                            {ord.deliveryMethod === "yucavault-pickup"
                              ? "Assigned to YucaVault for Pickup & Inspection"
                              : "Direct Delivery / Logistics Dispatch"}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-400">Total Paid</p>
                        <p className="text-base font-extrabold text-gray-900">
                          ₦{Number(ord.totalAmount).toLocaleString()}
                        </p>
                        <span className="text-[11px] text-gray-500">
                          ({ord.quantity} {ord.unit})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {!isConsumer && activeTab === "sales" && (
          <div className="space-y-3">


            {mergedSales.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <TrendingUp size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No products or batches sold yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  When buyers purchase your cassava, processed goods, or services, transactions will show here.
                </p>
              </div>
            ) : (
              mergedSales.map((sale: any) => {
                const isPaidOut = sale.payoutStatus === "Paid / Disbursed";
                return (
                  <div
                    key={sale.id || sale.orderNumber}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs hover:border-gray-200 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                          {sale.orderNumber}
                        </span>
                        <span className="text-xs text-gray-400">{sale.date}</span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${isPaidOut
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                          }`}
                      >
                        {isPaidOut ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {isPaidOut ? `Disbursed on ${sale.date || "Recently"}` : "Pending Admin Payout"}
                      </span>
                    </div>

                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{sale.productTitle}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Buyer: <span className="font-semibold text-gray-700">{sale.buyerName}</span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Delivery: {sale.deliveryMethod === "yucavault-pickup" ? "YucaVault Pickup" : "Direct Logistics"}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-400">Total Payout Amount</p>
                        <p className="text-base font-extrabold text-[#226049]">
                          ₦{Number(sale.totalAmount).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          To: {currentUser.bankName?.split(" ")[0] || "Bank"} ****{currentUser.accountNumber?.slice(-4) || "89"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
