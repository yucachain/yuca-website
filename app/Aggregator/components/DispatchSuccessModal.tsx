"use client";

import React, { useRef } from "react";
import { CheckCircle, Printer, Download, X } from "lucide-react";
import type { DispatchOrderSummary } from "./types";
import type { DispatchLogisticsValues } from "@/app/components/validation/schema";

export interface DispatchSuccessModalProps {
  order: DispatchOrderSummary;
  logistics: DispatchLogisticsValues;
  onClose: () => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-NG");
}

function fmtDate(raw: string) {
  if (!raw) return "—";
  const d = new Date(raw);
  return isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Receipt rows ────────────────────────────────────────────────────────────

interface ReceiptRowProps {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}

function ReceiptRow({ label, value, accent }: ReceiptRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-gray-100 py-3 last:border-0">
      <span className="min-w-[160px] text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <span
        className={[
          "text-right text-sm font-semibold",
          accent ? "text-[#226049]" : "text-gray-800",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Print styles injected into the popup window ─────────────────────────────

const PRINT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', sans-serif;
    padding: 40px;
    color: #111;
    background: #fff;
  }
  .logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .logo-img { height: 36px; }
  .brand { font-size: 18px; font-weight: 700; color: #226049; }
  .subtitle { font-size: 11px; color: #888; margin-bottom: 24px; }
  .badge {
    display: inline-block;
    background: #d1fae5;
    color: #065f46;
    border-radius: 100px;
    padding: 3px 12px;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #aaa;
    margin-bottom: 8px;
    margin-top: 24px;
  }
  table { width: 100%; border-collapse: collapse; }
  tr { border-bottom: 1px solid #f0f0f0; }
  tr:last-child { border-bottom: none; }
  td { padding: 9px 0; font-size: 12px; vertical-align: top; }
  td.label { color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; width: 45%; padding-top: 11px; }
  td.value { font-weight: 600; text-align: right; }
  .total { color: #226049; font-size: 15px; }
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
  .footer { margin-top: 48px; font-size: 10px; color: #bbb; text-align: center; }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function DispatchSuccessModal({
  order,
  logistics,
  onClose,
}: DispatchSuccessModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  // ── Build the receipt HTML string (used by both print & PDF) ──────────────
  const buildReceiptHtml = () => `
    <div class="logo-row">
      <img class="logo-img" src="/images/Yucachain_Logo.png" alt="Yucachain Logo" />
      <span class="brand">Yucachain</span>
    </div>
    <div class="subtitle">Aggregator Dispatch Receipt — Generated ${new Date().toLocaleString("en-NG")}</div>
    <span class="badge">✓ Dispatch Confirmed</span>

    <div class="section-title">Order Details</div>
    <table>
      <tr><td class="label">Order Number</td><td class="value">${order.orderNumber}</td></tr>
      <tr><td class="label">Lot / Batch Code</td><td class="value">${order.lotCode}</td></tr>
      <tr><td class="label">Buyer</td><td class="value">${order.buyer}</td></tr>
      <tr><td class="label">Product Weight</td><td class="value">${fmt(order.lotWeightKg)} kg</td></tr>
      <tr><td class="label">Price per kg</td><td class="value">₦${fmt(order.pricePerKg)}</td></tr>
      <tr><td class="label">Total Amount Paid</td><td class="value total">₦${fmt(order.agreedPriceTotal)}</td></tr>
      <tr><td class="label">Payment Status</td><td class="value">${order.paymentMade ? "✓ Payment Made" : "Pending"}</td></tr>
      <tr><td class="label">Delivery Address</td><td class="value">${order.buyerDeliveryAddress}</td></tr>
    </table>

    <hr class="divider" />

    <div class="section-title">Logistics Information</div>
    <table>
      <tr><td class="label">Assigned Vault</td><td class="value">${logistics.vaultNumber}</td></tr>
      <tr><td class="label">Vault Plate Number</td><td class="value">${logistics.vaultPlateNumber}</td></tr>
      <tr><td class="label">Driver Name</td><td class="value">${logistics.driverName}</td></tr>
      <tr><td class="label">Delivery Date</td><td class="value">${fmtDate(logistics.deliveryDate)}</td></tr>
      <tr><td class="label">Delivery Time</td><td class="value">${logistics.deliveryTime}</td></tr>
      ${logistics.additionalNotes ? `<tr><td class="label">Notes</td><td class="value">${logistics.additionalNotes}</td></tr>` : ""}
    </table>

    <p class="footer">© ${new Date().getFullYear()} Yucachain Aggregator System · This receipt was generated automatically</p>
  `;

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=820,height=680");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Dispatch Receipt — ${order.orderNumber}</title>
          <style>${PRINT_STYLE}</style>
        </head>
        <body>${buildReceiptHtml()}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // ── Download PDF ──────────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const green = "#226049";
      const gray = "#888888";
      const dark = "#111111";
      let y = 20;
      const L = 20;
      const R = 190;
      const COL2 = 110;

      // ── Header ──────────────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(green);
      doc.text("Yucachain", L, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(gray);
      doc.text(
        `Aggregator Dispatch Receipt — Generated ${new Date().toLocaleString("en-NG")}`,
        L,
        y
      );
      y += 5;

      // Badge
      doc.setFillColor(209, 250, 229);
      doc.roundedRect(L, y, 52, 7, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(6, 95, 70);
      doc.text("✓ Dispatch Confirmed", L + 3, y + 5);
      y += 14;

      // ── Section helper ───────────────────────────────────────────────────
      const sectionTitle = (title: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(gray);
        doc.text(title.toUpperCase(), L, y);
        y += 5;
        doc.setDrawColor("#e5e7eb");
        doc.line(L, y, R, y);
        y += 4;
      };

      const row = (label: string, value: string, accentValue = false) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(gray);
        doc.text(label, L, y);
        doc.setFont("helvetica", "semibold");
        doc.setTextColor(accentValue ? green : dark);
        doc.text(value, COL2, y);
        y += 8;
      };

      // ── Order Details ────────────────────────────────────────────────────
      sectionTitle("Order Details");
      row("Order Number", order.orderNumber);
      row("Lot / Batch Code", order.lotCode);
      row("Buyer", order.buyer);
      row("Product Weight", `${fmt(order.lotWeightKg)} kg`);
      row("Price per kg", `₦${fmt(order.pricePerKg)}`);
      row("Total Amount Paid", `₦${fmt(order.agreedPriceTotal)}`, true);
      row("Payment Status", order.paymentMade ? "✓ Payment Made" : "Pending");
      const addr = doc.splitTextToSize(order.buyerDeliveryAddress, 75);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(gray);
      doc.text("Delivery Address", L, y);
      doc.setFont("helvetica", "semibold");
      doc.setTextColor(dark);
      doc.text(addr, COL2, y);
      y += addr.length * 5 + 4;

      // ── Logistics ────────────────────────────────────────────────────────
      sectionTitle("Logistics Information");
      row("Assigned Vault", logistics.vaultNumber);
      row("Vault Plate Number", logistics.vaultPlateNumber);
      row("Driver Name", logistics.driverName);
      row("Delivery Date", fmtDate(logistics.deliveryDate));
      row("Delivery Time", logistics.deliveryTime);
      if (logistics.additionalNotes) row("Notes", logistics.additionalNotes);

      // ── Footer ───────────────────────────────────────────────────────────
      doc.setFontSize(8);
      doc.setTextColor("#aaaaaa");
      doc.text(
        `© ${new Date().getFullYear()} Yucachain Aggregator System · Generated automatically`,
        L,
        285
      );

      doc.save(`dispatch-receipt-${order.orderNumber}.pdf`);
    } catch {
      handlePrint();
    }
  };

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-gray-100">

        {/* ── Close button ──────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* ── Success header ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center bg-gradient-to-b from-emerald-50 to-white px-8 pb-6 pt-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle size={34} strokeWidth={1.6} className="text-[#226049]" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Dispatch Confirmed!</h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Order <span className="font-semibold text-gray-700">{order.orderNumber}</span> has been
            successfully dispatched.
          </p>
        </div>

        {/* ── Receipt body ───────────────────────────────────────────────── */}
        <div ref={receiptRef} className="px-8 pb-6">
          {/* Logo row */}
          <div className="mb-5 flex items-center gap-2.5 border-b border-gray-100 pb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Yucachain_Logo.png"
              alt="Yucachain Logo"
              className="h-8 w-auto object-contain"
            />
            <div>
              <p className="text-sm font-bold text-[#226049]">Yucachain</p>
              <p className="text-xs text-gray-400">Aggregator Dispatch Receipt</p>
            </div>
          </div>

          {/* Order Details section */}
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Order Details
          </p>
          <ReceiptRow label="Order Number" value={order.orderNumber} />
          <ReceiptRow label="Lot / Batch Code" value={order.lotCode} />
          <ReceiptRow label="Buyer" value={order.buyer} />
          <ReceiptRow label="Product Weight" value={`${fmt(order.lotWeightKg)} kg`} />
          <ReceiptRow label="Price per kg" value={`₦${fmt(order.pricePerKg)}`} />
          <ReceiptRow
            label="Total Amount Paid"
            value={`₦${fmt(order.agreedPriceTotal)}`}
            accent
          />
          <ReceiptRow
            label="Payment Status"
            value={
              order.paymentMade ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  ✓ Payment Made
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  Pending
                </span>
              )
            }
          />
          <ReceiptRow label="Delivery Address" value={order.buyerDeliveryAddress} />

          {/* Divider */}
          <div className="my-5 border-t border-dashed border-gray-200" />

          {/* Logistics section */}
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Logistics Information
          </p>
          <ReceiptRow label="Assigned Vault" value={logistics.vaultNumber} />
          <ReceiptRow label="Vault Plate Number" value={logistics.vaultPlateNumber} />
          <ReceiptRow label="Driver Name" value={logistics.driverName} />
          <ReceiptRow label="Delivery Date" value={fmtDate(logistics.deliveryDate)} />
          <ReceiptRow label="Delivery Time" value={logistics.deliveryTime} />
          {logistics.additionalNotes && (
            <ReceiptRow label="Notes" value={logistics.additionalNotes} />
          )}

          <p className="mt-6 text-center text-[10px] text-gray-300">
            © {new Date().getFullYear()} Yucachain Aggregator System · Generated automatically
          </p>
        </div>

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 border-t border-gray-100 px-8 py-5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
          >
            <Printer size={15} strokeWidth={1.8} />
            Print Receipt
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#226049] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1a4336] active:scale-[0.98]"
          >
            <Download size={15} strokeWidth={1.8} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
