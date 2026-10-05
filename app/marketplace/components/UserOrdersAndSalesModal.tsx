"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useMarketplaceRole } from "../context/MarketplaceRoleContext";

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
  const { activeRole, currentUser, myOrders, mySales } = useMarketplaceRole();
  const isConsumer = activeRole === "consumer";

  const [activeTab, setActiveTab] = useState<"purchases" | "sales">(
    isConsumer ? "purchases" : initialTab
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-100 font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
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

        {/* Tabs (Hidden for Consumer) */}
        {!isConsumer && (
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6 text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab("purchases")}
              className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "purchases"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "hover:text-gray-900"
              }`}
            >
              <ShoppingBag size={14} />
              <span>My Purchases &amp; Orders ({myOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sales")}
              className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "sales"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "hover:text-gray-900"
              }`}
            >
              <TrendingUp size={14} />
              <span>My Sales &amp; Disbursements ({mySales.length})</span>
            </button>
          </div>
        )}

        {/* Content: Purchases Tab */}
        {activeTab === "purchases" && (
          <div className="space-y-3">
            {myOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ShoppingBag size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No purchases placed yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Items you checkout from the marketplace will appear here.
                </p>
              </div>
            ) : (
              myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-white hover:border-gray-200 hover:shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#226049] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">{ord.date}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      <CheckCircle2 size={12} />
                      {ord.paymentStatus}
                    </span>
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
                        ₦{ord.totalAmount.toLocaleString()}
                      </p>
                      <span className="text-[11px] text-gray-500">
                        ({ord.quantity} {ord.unit})
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Content: Sales Tab (Farmer / Processor / Service Provider) */}
        {!isConsumer && activeTab === "sales" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5 mb-2 text-xs text-emerald-950 flex items-start gap-2.5">
              <CreditCard size={18} className="text-[#226049] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Administrative Payout Policy</p>
                <p className="text-[11px] text-emerald-900 mt-0.5">
                  When a buyer completes payment, YucaChain Admin verifies fulfillment and transfers funds directly to your registered bank account: <span className="font-bold">{currentUser.bankName} - {currentUser.accountNumber || "..."} ({currentUser.accountName || currentUser.name})</span>.
                </p>
              </div>
            </div>

            {mySales.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <TrendingUp size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No products or batches sold yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  When buyers purchase your cassava, processed goods, or services, transactions will show here.
                </p>
              </div>
            ) : (
              mySales.map((sale) => {
                const isPaidOut = sale.payoutStatus === "Paid / Disbursed";
                return (
                  <div
                    key={sale.id}
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
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                          isPaidOut
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                        }`}
                      >
                        {isPaidOut ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {isPaidOut ? `Disbursed on ${sale.payoutDate || "Recently"}` : "Pending Admin Payout"}
                      </span>
                    </div>

                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{sale.productTitle}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Buyer: <span className="font-semibold text-gray-700">{sale.buyerName}</span> ({sale.buyerRole})
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Delivery: {sale.deliveryMethod === "yucavault-pickup" ? "YucaVault Pickup" : "Direct Logistics"}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-400">Total Payout Amount</p>
                        <p className="text-base font-extrabold text-[#226049]">
                          ₦{sale.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          To: {currentUser.bankName?.split(" ")[0]} ****{currentUser.accountNumber?.slice(-4) || "89"}
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
            className="rounded-xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
