"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  Printer,
  Search,
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
} from "lucide-react";
import jsPDF from "jspdf";
import Pagination from "./Pagination";
import type { TransactionRecord, TransactionType, TransactionStatus } from "./types";

const TRANSACTIONS: TransactionRecord[] = [
  {
    id: "tx-101",
    referenceNo: "TXN-2026-08912",
    date: "Aug 13, 2026 · 10:15 AM",
    type: "Marketplace Sale",
    partyName: "Drevo Foods Ltd.",
    description: "Marketplace sale order MO-2026-014 (incl. 5% logistics)",
    amount: 1512000,
    paymentMethod: "Bank Transfer (Escrow)",
    status: "Escrow Held",
  },
  {
    id: "tx-102",
    referenceNo: "TXN-2026-08890",
    date: "Aug 12, 2026 · 04:30 PM",
    type: "Seller Payout",
    partyName: "Agbetoba Farms",
    description: "Payout settlement for Batch YC-2026-00142 (3,300 kg)",
    amount: 396000,
    paymentMethod: "Zenith Bank (Direct)",
    status: "Completed",
  },
  {
    id: "tx-103",
    referenceNo: "TXN-2026-08854",
    date: "Aug 12, 2026 · 02:40 PM",
    type: "Marketplace Sale",
    partyName: "Sahel Foods Ltd.",
    description: "Marketplace sale release for Order MO-2026-015 (Fresh Cassava)",
    amount: 924000,
    paymentMethod: "YucaPay Escrow",
    status: "Completed",
  },
  {
    id: "tx-104",
    referenceNo: "TXN-2026-08810",
    date: "Aug 11, 2026 · 11:20 AM",
    type: "Vault Storage Fee",
    partyName: "YucaVault #1 Ilorin",
    description: "Storage & maintenance fee allocation for Unit A-24",
    amount: 45000,
    paymentMethod: "System Deduction",
    status: "Completed",
  },
  {
    id: "tx-105",
    referenceNo: "TXN-2026-08795",
    date: "Aug 11, 2026 · 09:30 AM",
    type: "Marketplace Sale",
    partyName: "Ibadan Millers Co.",
    description: "Marketplace sale order MO-2026-011 (incl. logistics)",
    amount: 1417500,
    paymentMethod: "Credit Line",
    status: "Processing",
  },
  {
    id: "tx-106",
    referenceNo: "TXN-2026-08722",
    date: "Aug 10, 2026 · 03:15 PM",
    type: "Seller Payout",
    partyName: "Nino Farms",
    description: "Payout settlement for Batch YC-2026-00122 (6,000 kg)",
    amount: 720000,
    paymentMethod: "Access Bank",
    status: "Completed",
  },
  {
    id: "tx-107",
    referenceNo: "TXN-2026-08690",
    date: "Aug 10, 2026 · 11:20 AM",
    type: "Marketplace Sale",
    partyName: "Kano Starch Mills",
    description: "Marketplace sale MO-2026-009 final settlement",
    amount: 882000,
    paymentMethod: "GTBank Escrow",
    status: "Completed",
  },
  {
    id: "tx-108",
    referenceNo: "TXN-2026-08610",
    date: "Aug 09, 2026 · 01:45 PM",
    type: "Seller Payout",
    partyName: "Garba Farms",
    description: "Partial payout for Batch YC-2026-00104",
    amount: 240000,
    paymentMethod: "Zenith Bank",
    status: "Completed",
  },
];

const ITEMS_PER_PAGE = 5;

const typeBadgeStyles: Record<TransactionType, string> = {
  "Marketplace Sale": "bg-emerald-50 text-emerald-800 border-emerald-200",
  "Seller Payout": "bg-blue-50 text-blue-800 border-blue-200",
  "Vault Storage Fee": "bg-purple-50 text-purple-800 border-purple-200",
};

const statusBadgeStyles: Record<TransactionStatus, string> = {
  Completed: "bg-emerald-100/70 text-emerald-900",
  "Escrow Held": "bg-amber-100/70 text-amber-900",
  Processing: "bg-blue-100/70 text-blue-900",
  Failed: "bg-red-100/70 text-red-900",
};

export default function TransactionsSection() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((tx) => {
      const typeMatch = selectedType === "All" || tx.type === selectedType;
      const statusMatch = selectedStatus === "All" || tx.status === selectedStatus;
      const searchMatch =
        search === "" ||
        tx.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
        tx.partyName.toLowerCase().includes(search.toLowerCase()) ||
        tx.description.toLowerCase().includes(search.toLowerCase());
      return typeMatch && statusMatch && searchMatch;
    });
  }, [search, selectedType, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalVolume = useMemo(() => TRANSACTIONS.reduce((acc, t) => acc + t.amount, 0), []);
  const escrowHeld = useMemo(
    () => TRANSACTIONS.filter((t) => t.status === "Escrow Held").reduce((acc, t) => acc + t.amount, 0),
    []
  );
  const completedPayouts = useMemo(
    () => TRANSACTIONS.filter((t) => t.type === "Seller Payout").reduce((acc, t) => acc + t.amount, 0),
    []
  );

  // Generate and Download PDF Report using jsPDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Title
    doc.setFillColor(34, 96, 73); // #226049 brand color
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("YucaChain - Financial Transactions Statement", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Verified Aggregator Hub`, pageWidth - 80, 18);

    // Summary Box
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 250, 248);
    doc.roundedRect(14, 34, pageWidth - 28, 24, 2, 2, "FD");

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Aggregator Statement Summary", 20, 43);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Volume: NGN ${totalVolume.toLocaleString()}`, 20, 52);
    doc.text(`Escrow Held: NGN ${escrowHeld.toLocaleString()}`, 85, 52);
    doc.text(`Completed Payouts: NGN ${completedPayouts.toLocaleString()}`, 145, 52);

    // Table Header
    let startY = 66;
    doc.setFillColor(240, 244, 241);
    doc.rect(14, startY, pageWidth - 28, 8, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 58, 42);
    doc.text("Ref No", 18, startY + 5.5);
    doc.text("Date", 52, startY + 5.5);
    doc.text("Type", 90, startY + 5.5);
    doc.text("Party Name", 125, startY + 5.5);
    doc.text("Amount (NGN)", pageWidth - 20, startY + 5.5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);

    let currentY = startY + 12;

    filtered.forEach((tx, idx) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, currentY - 4, pageWidth - 28, 8, "F");
      }

      doc.text(tx.referenceNo, 18, currentY);
      doc.text(tx.date.split("·")[0].trim(), 52, currentY);
      doc.text(tx.type, 90, currentY);
      doc.text(tx.partyName, 125, currentY);
      doc.text(tx.amount.toLocaleString(), pageWidth - 20, currentY, { align: "right" });

      currentY += 9;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text("YucaChain Digital Ecosystem Limited © 2026. Confidential Transaction Record.", 14, 288);

    doc.save(`YucaChain_Transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Browser Print Trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            View all marketplace payments, escrow deposits, hub fees, and seller payouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
          >
            <Download size={15} className="text-emerald-700" />
            Download PDF Report
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[#226049] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1a4b39] transition-colors cursor-pointer shadow-xs"
          >
            <Printer size={15} />
            Print Statement
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Total Processed Volume</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Receipt size={16} />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold text-gray-900">₦{totalVolume.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-gray-400">All recorded transactions</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Escrow Balance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700">
              <Clock size={16} />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold text-[#226049]">₦{escrowHeld.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-gray-400">Held pending order dispatch</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Seller Payouts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold text-gray-900">₦{completedPayouts.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-gray-400">Successfully disbursed</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Total Transactions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-700">
              <CreditCard size={16} />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold text-gray-900">{TRANSACTIONS.length}</p>
          <p className="mt-1 text-[11px] text-gray-400">Ledger records logged</p>
        </div>
      </div>

      {/* Filter Header Bar */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reference, party, or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Filter size={13} />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-700 outline-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Marketplace Sale">Marketplace Sale</option>
            <option value="Seller Payout">Seller Payout</option>
            <option value="Vault Storage Fee">Vault Storage Fee</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-700 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Escrow Held">Escrow Held</option>
            <option value="Processing">Processing</option>
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="overflow-x-auto touch-scroll rounded-2xl border border-gray-100 bg-white shadow-xs">
        <table className="w-full min-w-[760px] text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 font-semibold">
              <th className="py-3.5 px-4">Reference No</th>
              <th className="py-3.5 px-4">Date &amp; Time</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Party</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-right">Amount (₦)</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                  {tx.referenceNo}
                </td>
                <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">{tx.date}</td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={[
                      "inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      typeBadgeStyles[tx.type],
                    ].join(" ")}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium text-gray-800 whitespace-nowrap">
                  {tx.partyName}
                </td>
                <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">{tx.description}</td>
                <td className="py-3.5 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                  ₦{tx.amount.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={[
                      "inline-block rounded-lg px-2.5 py-1 text-xs font-semibold",
                      statusBadgeStyles[tx.status],
                    ].join(" ")}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-gray-500">
                  No transaction records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="print:hidden">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            resultsLabel={`Showing ${paginated.length} of ${filtered.length} Records`}
          />
        </div>
      )}
    </div>
  );
}
