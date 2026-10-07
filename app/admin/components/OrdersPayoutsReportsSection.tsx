"use client";

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  FileText,
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
  Copy,
  Check,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import jsPDF from "jspdf";
import {
  useMarketplaceRole,
  MarketplaceRole,
  MarketOrderItem,
} from "@/app/marketplace/context/MarketplaceRoleContext";
import { toast } from "sonner";

const ROLE_BADGES: Record<
  MarketplaceRole,
  { label: string; icon: React.ReactNode; color: string }
> = {
  farmer: {
    label: "Farmer",
    icon: <Sprout size={11} />,
    color: "bg-emerald-50 text-[#226049] border-emerald-200",
  },
  processor: {
    label: "Buyer / Processor",
    icon: <Factory size={11} />,
    color: "bg-blue-50 text-blue-800 border-blue-200",
  },
  "service-provider": {
    label: "Service Provider",
    icon: <Tractor size={11} />,
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  consumer: {
    label: "Consumer",
    icon: <CreditCard size={11} />,
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

type ViewFilterTab = "all" | "pending" | "paid";

export default function OrdersPayoutsReportsSection() {
  const { allTransactions, disbursePayout } = useMarketplaceRole();

  const [activeTab, setActiveTab] = useState<ViewFilterTab>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Disbursement Modal state
  const [selectedOrderForPayout, setSelectedOrderForPayout] =
    useState<MarketOrderItem | null>(null);
  const [payoutNotes, setPayoutNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalGMV = allTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const paidList = allTransactions.filter(
      (t) => t.payoutStatus === "Paid / Disbursed"
    );
    const pendingList = allTransactions.filter(
      (t) => t.payoutStatus !== "Paid / Disbursed"
    );

    const paidVol = paidList.reduce((acc, t) => acc + t.totalAmount, 0);
    const pendingVol = pendingList.reduce((acc, t) => acc + t.totalAmount, 0);
    const settlementRate =
      allTransactions.length > 0
        ? Math.round((paidList.length / allTransactions.length) * 100)
        : 100;

    return {
      totalCount: allTransactions.length,
      totalGMV,
      paidCount: paidList.length,
      paidVol,
      pendingCount: pendingList.length,
      pendingVol,
      settlementRate,
    };
  }, [allTransactions]);

  // Filtered transactions
  const filteredList = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Tab filter
      const isPaid = tx.payoutStatus === "Paid / Disbursed";
      if (activeTab === "pending" && isPaid) return false;
      if (activeTab === "paid" && !isPaid) return false;

      // Role filter
      if (
        selectedRole !== "all" &&
        tx.sellerRole !== selectedRole &&
        tx.buyerRole !== selectedRole
      ) {
        return false;
      }

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        tx.orderNumber.toLowerCase().includes(q) ||
        tx.productTitle.toLowerCase().includes(q) ||
        tx.sellerName.toLowerCase().includes(q) ||
        tx.buyerName.toLowerCase().includes(q) ||
        tx.sellerBankDetails.bankName.toLowerCase().includes(q) ||
        tx.sellerBankDetails.accountNumber.includes(q)
      );
    });
  }, [allTransactions, activeTab, selectedRole, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedAccount(text);
    toast.success("Account details copied to clipboard!");
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleConfirmDisbursement = () => {
    if (!selectedOrderForPayout) return;
    setProcessing(true);

    setTimeout(() => {
      disbursePayout(selectedOrderForPayout.id);
      setProcessing(false);
      const msg = `Disbursed ₦${selectedOrderForPayout.totalAmount.toLocaleString()} to ${
        selectedOrderForPayout.sellerName
      } (${selectedOrderForPayout.sellerBankDetails.bankName}). Order settled!`;
      setSuccessToast(msg);
      toast.success(msg);
      setSelectedOrderForPayout(null);
      setPayoutNotes("");
      setTimeout(() => setSuccessToast(null), 5000);
    }, 800);
  };

  // Export to CSV/Excel
  const handleDownloadExcel = () => {
    const headers = [
      "Order Number",
      "Date",
      "Product / Item",
      "Quantity",
      "Total Amount (NGN)",
      "Seller Name",
      "Seller Role",
      "Buyer Name",
      "Payout Status",
      "Disbursement Date",
      "Seller Bank",
      "Seller Account Number",
      "Seller Account Name",
    ];

    const rows = filteredList.map((tx) => [
      `"${tx.orderNumber}"`,
      `"${tx.date}"`,
      `"${tx.productTitle.replace(/"/g, '""')}"`,
      `"${tx.quantity} ${tx.unit}"`,
      tx.totalAmount,
      `"${tx.sellerName}"`,
      `"${tx.sellerRole}"`,
      `"${tx.buyerName}"`,
      `"${tx.payoutStatus}"`,
      `"${tx.payoutDate || "Pending"}"`,
      `"${tx.sellerBankDetails.bankName}"`,
      `"${tx.sellerBankDetails.accountNumber}"`,
      `"${tx.sellerBankDetails.accountName}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `YucaChain_Financial_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Financial report exported as CSV successfully!");
  };

  // Export to PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header Banner
    doc.setFillColor(34, 96, 73);
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("YucaChain - Orders & Settlement Financial Report", 14, 16);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} | Admin Console`,
      pageWidth - 65,
      16
    );

    // Summary Box
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 250, 248);
    doc.roundedRect(14, 32, pageWidth - 28, 20, 2, 2, "FD");

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 18, 39);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Total GMV: NGN ${stats.totalGMV.toLocaleString()}`, 18, 46);
    doc.text(`Disbursed: NGN ${stats.paidVol.toLocaleString()}`, 82, 46);
    doc.text(`Pending Escrow: NGN ${stats.pendingVol.toLocaleString()}`, 145, 46);

    // Table Header
    const startY = 58;
    doc.setFillColor(240, 244, 241);
    doc.rect(14, startY, pageWidth - 28, 8, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 58, 42);
    doc.text("Order Ref", 16, startY + 5.5);
    doc.text("Date", 46, startY + 5.5);
    doc.text("Seller & Role", 72, startY + 5.5);
    doc.text("Buyer", 120, startY + 5.5);
    doc.text("Payout", 152, startY + 5.5);
    doc.text("Amount (NGN)", pageWidth - 16, startY + 5.5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);

    let currentY = startY + 13;
    filteredList.slice(0, 20).forEach((tx) => {
      if (currentY > 275) return;

      doc.setFontSize(7.5);
      doc.text(tx.orderNumber, 16, currentY);
      doc.text(tx.date, 46, currentY);
      doc.text(`${tx.sellerName.substring(0, 20)} (${tx.sellerRole})`, 72, currentY);
      doc.text(tx.buyerName.substring(0, 16), 120, currentY);
      doc.text(
        tx.payoutStatus === "Paid / Disbursed" ? "Disbursed" : "Pending",
        152,
        currentY
      );
      doc.text(
        tx.totalAmount.toLocaleString(),
        pageWidth - 16,
        currentY,
        { align: "right" }
      );

      doc.setDrawColor(240, 240, 240);
      doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);
      currentY += 8;
    });

    doc.save(`YucaChain_Financial_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Financial PDF report generated and downloaded successfully!");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {successToast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Orders, Payouts &amp; Reports
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track marketplace orders, disburse escrow payments directly to seller bank accounts, and export audit statements.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all cursor-pointer"
            title="Download CSV / Excel audit file"
          >
            <FileSpreadsheet size={15} className="text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#226049] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a4336] shadow-xs transition-all cursor-pointer"
            title="Download PDF statement"
          >
            <FileText size={15} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards matching Overview Inspiration Design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Sales / GMV */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs font-semibold text-gray-500">Marketplace GMV</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
              <ShoppingCart size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-1.5 mt-2.5">
            <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              ₦{stats.totalGMV.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100 shrink-0">
              <ArrowUpRight size={10} strokeWidth={2.5} />
              <span>12.4%</span>
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
            Across {stats.totalCount} completed orders
          </p>
        </div>

        {/* Card 2: Pending Remittances */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs font-semibold text-gray-500">Pending Remittances</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
              <Clock size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-1.5 mt-2.5">
            <span className="text-lg sm:text-xl font-bold text-amber-950 tracking-tight">
              ₦{stats.pendingVol.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100 shrink-0">
              <span>{stats.pendingCount} pending</span>
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Awaiting admin bank transfer</p>
        </div>

        {/* Card 3: Disbursed Funds */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs font-semibold text-gray-500">Disbursed Funds</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
              <CheckCircle2 size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-1.5 mt-2.5">
            <span className="text-lg sm:text-xl font-bold text-[#226049] tracking-tight">
              ₦{stats.paidVol.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100 shrink-0">
              <ArrowUpRight size={10} strokeWidth={2.5} />
              <span>{stats.paidCount} settled</span>
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Settled to seller accounts</p>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Orders ({allTransactions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "pending"
                  ? "bg-white text-amber-900 shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>Awaiting Payout</span>
              {stats.pendingCount > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                  {stats.pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paid")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "paid"
                  ? "bg-white text-emerald-900 shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>Disbursed &amp; Settled</span>
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                {stats.paidCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search order ref, seller, buyer, or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#226049] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Role Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll pt-1 border-t border-gray-100 no-scrollbar">
          <span className="text-[11px] font-semibold text-gray-400 mr-1 shrink-0">
            Role:
          </span>
          {[
            { id: "all", label: "All Roles" },
            { id: "farmer", label: "Farmers" },
            { id: "processor", label: "Buyers / Processors" },
            { id: "service-provider", label: "Service Providers" },
            { id: "consumer", label: "Consumers" },
          ].map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-[#226049] text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders & Payouts Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Order &amp; Item</th>
                <th className="py-3 px-3">Participants</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Bank Details</th>
                <th className="py-3 px-3">Payout Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Receipt size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                    <p className="font-semibold text-gray-600">No matching records found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Try clearing search filters or switching tabs.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((tx) => {
                  const isPaid = tx.payoutStatus === "Paid / Disbursed";
                  const roleBadge = ROLE_BADGES[tx.sellerRole] || ROLE_BADGES.farmer;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      {/* Order Ref & Item */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                            {tx.orderNumber}
                          </span>
                        </div>
                        <p className="font-bold text-gray-900 text-xs mt-1">
                          {tx.productTitle}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {tx.quantity} {tx.unit} • {tx.date}
                        </p>
                      </td>

                      {/* Participants */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900 text-xs">
                            {tx.sellerName}
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold border ${roleBadge.color}`}
                          >
                            {roleBadge.icon}
                            <span>{roleBadge.label}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Buyer: <span className="font-medium text-gray-700">{tx.buyerName}</span>
                        </p>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-3">
                        <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                          ₦{tx.totalAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* Recipient Bank Details */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 text-xs">
                            {tx.sellerBankDetails.bankName}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(tx.sellerBankDetails.accountNumber)
                            }
                            className="text-gray-400 hover:text-gray-700 p-0.5 transition-colors cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedAccount === tx.sellerBankDetails.accountNumber ? (
                              <Check size={11} className="text-emerald-700" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                        <p className="font-mono text-gray-600 text-[11px]">
                          {tx.sellerBankDetails.accountNumber}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[150px]">
                          {tx.sellerBankDetails.accountName}
                        </p>
                      </td>

                      {/* Payout Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span>{isPaid ? "Disbursed" : "Awaiting Transfer"}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isPaid ? (
                          <div className="text-right">
                            <span className="text-[11px] text-gray-400 font-medium">
                              Settled {tx.payoutDate || "Recently"}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForPayout(tx)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#226049] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a4336] shadow-2xs transition-all cursor-pointer active:scale-95"
                          >
                            <Send size={12} />
                            <span>Disburse ₦{tx.totalAmount.toLocaleString()}</span>
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
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-gray-100 font-sans">
            <button
              type="button"
              onClick={() => setSelectedOrderForPayout(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#226049]">
                <Send size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Confirm Bank Disbursement
                </h3>
                <p className="text-xs text-gray-500">
                  Transfer funds from escrow to seller bank account
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Order Info */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Reference:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {selectedOrderForPayout.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Product / Quantity:</span>
                  <span className="font-medium text-gray-900">
                    {selectedOrderForPayout.productTitle} ({selectedOrderForPayout.quantity}{" "}
                    {selectedOrderForPayout.unit})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Seller / Recipient:</span>
                  <span className="font-bold text-gray-900">
                    {selectedOrderForPayout.sellerName}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-bold">Transfer Amount:</span>
                  <span className="text-base font-extrabold text-[#226049]">
                    ₦{selectedOrderForPayout.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bank Details */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#226049] font-bold mb-1">
                  <CreditCard size={14} />
                  <span>Designated Bank Account</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-bold text-gray-900">
                    {selectedOrderForPayout.sellerBankDetails.bankName}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {selectedOrderForPayout.sellerBankDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-medium text-gray-900">
                    {selectedOrderForPayout.sellerBankDetails.accountName}
                  </span>
                </div>
              </div>

              {/* Disbursement Reference Note */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Payment Reference Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`Settlement for ${selectedOrderForPayout.orderNumber}`}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPayout(null)}
                  disabled={processing}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDisbursement}
                  disabled={processing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#226049] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4336] shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {processing ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Processing Transfer...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Confirm &amp; Disburse</span>
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
