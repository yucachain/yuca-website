// CartSummary — sticky right panel that auto-updates from CartContext.
// Shows: Items (count), VAT, Total, and Checkout button.
"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface CartSummaryProps {
  totalItems: number;
  subtotal: number;
  vat: number;
  total: number;
}

export default function CartSummary({ totalItems, subtotal, vat, total }: CartSummaryProps) {
  const router = useRouter();

  return (
    <div className="sticky top-6 w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      {/* Heading */}
      <h2 className="text-base font-bold text-gray-900 mb-5">Summary</h2>

      {/* Items row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">Items ({totalItems})</span>
        <span className="text-sm font-semibold text-gray-900">
          ₦{subtotal.toLocaleString()}
        </span>
      </div>

      {/* VAT row */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-gray-500">VAT</span>
        <span className="text-sm font-semibold text-gray-900">
          ₦{vat.toLocaleString()}
        </span>
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* Total row */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-bold text-gray-900">Total</span>
        <span className="text-base font-extrabold text-gray-900">
          ₦{total.toLocaleString()}
        </span>
      </div>

      {/* Checkout button */}
      <button
        type="button"
        onClick={() => router.push("/marketplace/checkout")}
        disabled={totalItems === 0}
        className="w-full rounded-xl bg-[#0B6B46] py-3.5 text-sm font-semibold text-white transition hover:bg-[#09573A] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Checkout
      </button>

      {totalItems === 0 && (
        <p className="mt-3 text-center text-xs text-gray-400">Your cart is empty</p>
      )}
    </div>
  );
}