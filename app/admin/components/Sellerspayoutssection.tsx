"use client";

import React, { useState, useMemo } from "react";
import {
  HandCoins,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Building,
  CreditCard,
  Sprout,
  Factory,
  Tractor,
  X,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  useMarketplaceRole,
  MarketplaceRole,
  MarketOrderItem,
} from "@/app/marketplace/context/MarketplaceRoleContext";

const ROLE_BADGES: Record<
  MarketplaceRole,
  { label: string; icon: React.ReactNode; color: string }
> = {
  farmer: {
    label: "Farmer",
    icon: <Sprout size={12} />,
    color: "bg-emerald-50 text-[#226049] border-emerald-200",
  },
  processor: {
    label: "Buyer / Processor",
    icon: <Factory size={12} />,
    color: "bg-blue-50 text-blue-800 border-blue-200",
  },
  "service-provider": {
    label: "Service Provider",
    icon: <Tractor size={12} />,
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  consumer: {
    label: "Consumer",
    icon: <CreditCard size={12} />,
    color: "bg-gray-50 text-gray-800 border-gray-200",
  },
};

export default function SellersPayoutsSection() {
  const { allTransactions, disbursePayout } = useMarketplaceRole();

  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderForPayout, setSelectedOrderForPayout] =
    useState<MarketOrderItem | null>(null);
  const [payoutNotes, setPayoutNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Orders eligible for payout (sold by farmer, processor, service-provider)
  const sellerOrders = useMemo(() => {
    return allTransactions.filter((t) => t.sellerRole !== "consumer");
  }, [allTransactions]);

  const filteredOrders = useMemo(() => {
    return sellerOrders.filter((ord) => {
      const matchRole = filterRole === "all" || ord.sellerRole === filterRole;
      const isPaid = ord.payoutStatus === "Paid / Disbursed";
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" && !isPaid) ||
        (filterStatus === "paid" && isPaid);

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.sellerName.toLowerCase().includes(q) ||
        ord.productTitle.toLowerCase().includes(q) ||
        ord.sellerBankDetails.bankName.toLowerCase().includes(q) ||
        ord.sellerBankDetails.accountNumber.includes(q);

      return matchRole && matchStatus && matchSearch;
    });
  }, [sellerOrders, filterRole, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const pendingList = sellerOrders.filter(
      (o) => o.payoutStatus !== "Paid / Disbursed"
    );
    const paidList = sellerOrders.filter(
      (o) => o.payoutStatus === "Paid / Disbursed"
    );

    const pendingTotal = pendingList.reduce((acc, o) => acc + o.totalAmount, 0);
    const paidTotal = paidList.reduce((acc, o) => acc + o.totalAmount, 0);

    return {
      pendingCount: pendingList.length,
      pendingTotal,
      paidCount: paidList.length,
      paidTotal,
    };
  }, [sellerOrders]);

  const handleConfirmDisbursement = () => {
    if (!selectedOrderForPayout) return;
    setProcessing(true);

    setTimeout(() => {
      disbursePayout(selectedOrderForPayout.id);
      setProcessing(false);
      setSuccessToast(
        `Successfully transferred ₦${selectedOrderForPayout.totalAmount.toLocaleString()} to ${selectedOrderForPayout.sellerName} (${selectedOrderForPayout.sellerBankDetails.bankName}).`
      );
      setSelectedOrderForPayout(null);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 900);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100/70 px-2.5 py-0.5 text-xs font-bold text-[#226049]">
              ADMIN DISBURSEMENT CONSOLE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Seller Payouts &amp; Remittances
          </h1>
          <p className="text-xs text-gray-500 max-w-xl">
            Send money directly to bank accounts provided by Farmers, Buyers/Processors, and Service Providers once deliveries are completed.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4.5">
          <p className="text-xs font-bold text-amber-800">Pending Remittances</p>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">
            ₦{stats.pendingTotal.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-700 mt-1 block">
            {stats.pendingCount} orders awaiting bank transfer
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4.5">
          <p className="text-xs font-bold text-emerald-800">Disbursed Payouts</p>
          <p className="text-2xl font-extrabold text-[#226049] mt-1">
            ₦{stats.paidTotal.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            {stats.paidCount} orders settled to seller accounts
          </span>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4.5 shadow-2xs">
          <p className="text-xs font-bold text-gray-500">Farmers Credited</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            ₦{(stats.paidTotal * 0.55).toLocaleString()}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Cassava root harvest batches
          </span>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4.5 shadow-2xs">
          <p className="text-xs font-bold text-gray-500">Processors &amp; Services Credited</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            ₦{(stats.paidTotal * 0.45).toLocaleString()}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Processed products &amp; machinery
          </span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Role Filter */}
          <div className="flex flex-wrap gap-1.5 text-xs font-bold text-gray-600">
            {[
              { id: "all", label: "All Sellers" },
              { id: "farmer", label: "Farmers (Cassava Sales)" },
              { id: "processor", label: "Buyers/Processors (Flour/Garri)" },
              { id: "service-provider", label: "Service Providers (Machinery/Stems)" },
            ].map((tab) => {
              const isSelected = filterRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterRole(tab.id)}
                  className={`rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#226049] text-white shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search order ref, seller, or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:border-[#226049] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order / Item</th>
                <th className="py-3.5 px-3">Seller &amp; Role</th>
                <th className="py-3.5 px-3">Buyer (Paid Escrow)</th>
                <th className="py-3.5 px-3">Recipient Bank Details</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-3">Payout Status</th>
                <th className="py-3.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <HandCoins size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-gray-600">No payout records found</p>
                    <p className="text-[11px] text-gray-400">All matching seller payouts have been settled.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isPaid = ord.payoutStatus === "Paid / Disbursed";
                  const badge = ROLE_BADGES[ord.sellerRole];
                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Order info */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                          {ord.orderNumber}
                        </span>
                        <p className="font-bold text-gray-900 text-xs mt-1">{ord.productTitle}</p>
                        <p className="text-[11px] text-gray-400">
                          {ord.quantity} {ord.unit} • {ord.date}
                        </p>
                      </td>

                      {/* Seller & Role */}
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-gray-900 text-xs">{ord.sellerName}</p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-bold border mt-0.5 ${badge.color}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Buyer */}
                      <td className="py-3.5 px-3">
                        <p className="font-medium text-gray-900">{ord.buyerName}</p>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          Escrow Held
                        </span>
                      </td>

                      {/* Bank Details */}
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-gray-900">{ord.sellerBankDetails.bankName}</p>
                        <p className="font-mono text-gray-700 tracking-wider">
                          {ord.sellerBankDetails.accountNumber}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">
                          {ord.sellerBankDetails.accountName}
                        </p>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-3">
                        <span className="font-extrabold text-sm text-gray-900">
                          ₦{ord.totalAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span>{isPaid ? "Disbursed" : "Pending Payout"}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-right">
                        {isPaid ? (
                          <span className="text-[11px] text-gray-400 font-semibold italic">
                            Settled on {ord.payoutDate || "Recently"}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForPayout(ord)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#226049] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1a4336] shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <Send size={13} />
                            <span>Send Money</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Money Payout Modal */}
      {selectedOrderForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 font-sans">
            <button
              type="button"
              onClick={() => setSelectedOrderForPayout(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#226049]">
                <Send size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Disburse Payment to Seller
                </h3>
                <p className="text-xs text-gray-500">
                  Transfer funds from YucaChain Escrow directly to the seller&apos;s account
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Reference:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {selectedOrderForPayout.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Item Fulfilled:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedOrderForPayout.productTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Seller / Recipient:</span>
                  <span className="font-bold text-gray-900">
                    {selectedOrderForPayout.sellerName} ({selectedOrderForPayout.sellerRole})
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-bold">Payout Amount to Transfer:</span>
                  <span className="text-lg font-extrabold text-[#226049]">
                    ₦{selectedOrderForPayout.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#226049] font-bold">
                  <CreditCard size={15} />
                  <span>Seller Designated Bank Account</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-bold text-gray-900">
                    {selectedOrderForPayout.sellerBankDetails.bankName}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    {selectedOrderForPayout.sellerBankDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedOrderForPayout.sellerBankDetails.accountName}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Payment Reference / Disbursement Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. YC-DISB-TRF-091823"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPayout(null)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmDisbursement}
                  className="flex-1 rounded-xl bg-[#226049] py-2.5 font-bold text-white hover:bg-[#1a4336] transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  {processing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending Money...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Confirm &amp; Send Money</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}