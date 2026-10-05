"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  CreditCard,
  Building,
} from "lucide-react";
import jsPDF from "jspdf";
import {
  useMarketplaceRole,
  MarketOrderItem,
} from "@/app/marketplace/context/MarketplaceRoleContext";

export default function TransactionsSection() {
  const { allTransactions } = useMarketplaceRole();

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const matchRole =
        selectedRole === "all" ||
        tx.sellerRole === selectedRole ||
        tx.buyerRole === selectedRole;
      const isPaid = tx.payoutStatus === "Paid / Disbursed";
      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "paid" && isPaid) ||
        (selectedStatus === "pending" && !isPaid);

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        tx.orderNumber.toLowerCase().includes(q) ||
        tx.productTitle.toLowerCase().includes(q) ||
        tx.sellerName.toLowerCase().includes(q) ||
        tx.buyerName.toLowerCase().includes(q);

      return matchRole && matchStatus && matchSearch;
    });
  }, [allTransactions, selectedRole, selectedStatus, search]);

  const stats = useMemo(() => {
    const totalVol = allTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const paidVol = allTransactions
      .filter((t) => t.payoutStatus === "Paid / Disbursed")
      .reduce((acc, t) => acc + t.totalAmount, 0);
    const pendingVol = totalVol - paidVol;

    return {
      totalCount: allTransactions.length,
      totalVol,
      paidVol,
      pendingVol,
    };
  }, [allTransactions]);

  // Export to Excel / CSV
  const handleDownloadExcel = () => {
    const headers = [
      "Order Number",
      "Date",
      "Buyer Name",
      "Buyer Role",
      "Seller Name",
      "Seller Role",
      "Product / Item",
      "Quantity",
      "Total Amount (NGN)",
      "Payment Status",
      "Payout Status",
      "Seller Bank",
      "Seller Account Number",
      "Seller Account Name",
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx.orderNumber}"`,
      `"${tx.date}"`,
      `"${tx.buyerName}"`,
      `"${tx.buyerRole}"`,
      `"${tx.sellerName}"`,
      `"${tx.sellerRole}"`,
      `"${tx.productTitle.replace(/"/g, '""')}"`,
      `"${tx.quantity} ${tx.unit}"`,
      tx.totalAmount,
      `"${tx.paymentStatus}"`,
      `"${tx.payoutStatus}"`,
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
      `YucaChain_Transactions_Audit_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header Banner
    doc.setFillColor(34, 96, 73);
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("YucaChain Technologies - Administrative Transaction Audit", 14, 16);

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
    doc.roundedRect(14, 32, pageWidth - 28, 22, 2, 2, "FD");

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Audit Summary", 18, 40);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Total GMV Volume: NGN ${stats.totalVol.toLocaleString()}`, 18, 48);
    doc.text(`Paid Disbursements: NGN ${stats.paidVol.toLocaleString()}`, 82, 48);
    doc.text(`Pending Payouts: NGN ${stats.pendingVol.toLocaleString()}`, 145, 48);

    // Table Header
    const startY = 60;
    doc.setFillColor(240, 244, 241);
    doc.rect(14, startY, pageWidth - 28, 8, "F");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 58, 42);
    doc.text("Order Ref", 16, startY + 5.5);
    doc.text("Date", 46, startY + 5.5);
    doc.text("Seller & Role", 72, startY + 5.5);
    doc.text("Buyer", 120, startY + 5.5);
    doc.text("Status", 152, startY + 5.5);
    doc.text("Amount (NGN)", pageWidth - 16, startY + 5.5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);

    let currentY = startY + 13;
    filteredTransactions.slice(0, 18).forEach((tx) => {
      if (currentY > 275) return; // avoid overflow on single page

      doc.setFontSize(8);
      doc.text(tx.orderNumber, 16, currentY);
      doc.text(tx.date, 46, currentY);
      doc.text(`${tx.sellerName.substring(0, 22)} (${tx.sellerRole})`, 72, currentY);
      doc.text(tx.buyerName.substring(0, 16), 120, currentY);
      doc.text(
        tx.payoutStatus === "Paid / Disbursed" ? "Paid" : "Pending",
        152,
        currentY
      );
      doc.text(
        tx.totalAmount.toLocaleString(),
        pageWidth - 16,
        currentY,
        { align: "right" }
      );

      // Light separator line
      doc.setDrawColor(240, 240, 240);
      doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);

      currentY += 8;
    });

    doc.save(`YucaChain_Audit_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100/70 px-2.5 py-0.5 text-xs font-bold text-[#226049]">
              FINANCIAL AUDIT
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Platform Transactions &amp; Reports
          </h1>
          <p className="text-xs text-gray-500 max-w-xl">
            Audit all completed orders, track escrow payments, and export formatted reports as Excel spreadsheets or PDF statements.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-2xs transition-colors cursor-pointer"
            title="Download as Excel CSV"
          >
            <FileSpreadsheet size={15} className="text-emerald-700" />
            <span>Export to Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#226049] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4336] shadow-xs transition-colors cursor-pointer"
            title="Download formatted PDF report"
          >
            <FileText size={15} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4.5 shadow-2xs">
          <p className="text-xs font-bold text-gray-400">Total Transaction GMV</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            ₦{stats.totalVol.toLocaleString()}
          </p>
          <span className="text-[11px] text-gray-400 mt-0.5 block">
            Across {stats.totalCount} completed marketplace orders
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4.5">
          <p className="text-xs font-bold text-emerald-800">Total Disbursed to Sellers</p>
          <p className="text-2xl font-extrabold text-[#226049] mt-1">
            ₦{stats.paidVol.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">
            Transferred directly to seller bank accounts
          </span>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4.5">
          <p className="text-xs font-bold text-amber-800">Escrow Held / Pending Payout</p>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">
            ₦{stats.pendingVol.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-700 mt-0.5 block">
            Secured in YucaChain company account
          </span>
        </div>
      </div>

      {/* Search & Role Filters */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-xs font-bold text-gray-600">
            {[
              { id: "all", label: "All Roles" },
              { id: "farmer", label: "Farmers" },
              { id: "processor", label: "Processors" },
              { id: "service-provider", label: "Service Providers" },
              { id: "consumer", label: "Consumers" },
            ].map((tab) => {
              const isSelected = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRole(tab.id)}
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

          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ref, item, or party name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:border-[#226049] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Item / Service Description</th>
                <th className="py-3.5 px-3">Seller (Payee)</th>
                <th className="py-3.5 px-3">Buyer (Payer)</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-3">Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((tx) => {
                const isPaid = tx.payoutStatus === "Paid / Disbursed";
                return (
                  <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900 text-[11px]">
                      {tx.orderNumber}
                    </td>
                    <td className="py-3.5 px-3 text-gray-500">{tx.date}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-gray-900 text-xs">{tx.productTitle}</p>
                      <p className="text-[11px] text-gray-400">
                        {tx.quantity} {tx.unit} • {tx.deliveryMethod}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-gray-900">{tx.sellerName}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">
                        {tx.sellerRole}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-gray-900">{tx.buyerName}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">
                        {tx.buyerRole}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-gray-900 text-sm">
                      ₦{tx.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span>{isPaid ? "Disbursed" : "Pending Payout"}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
