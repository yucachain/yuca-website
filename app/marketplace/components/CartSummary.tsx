
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Truck, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";

interface CartSummaryProps {
  totalItems: number;
  subtotal: number;
  vat: number;
  total: number;
}

export default function CartSummary({ totalItems, subtotal, vat, total }: CartSummaryProps) {
  const router = useRouter();
  const { logisticsFee, hasLogistics, setHasLogistics } = useCart();

  return (
    <div className="sticky top-6 w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
      <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

      {/* Logistics Delivery Option Selector */}
      <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={hasLogistics}
            onChange={(e) => setHasLogistics(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-800 accent-[#0B6B46]"
          />
          <div>
            <span className="font-bold text-emerald-950 flex items-center gap-1">
              <Truck size={14} className="text-emerald-800" /> Standard Logistics Delivery
            </span>
            <span className="block text-emerald-800 mt-0.5">
              Verified haulage &amp; cold-chain tracking (5% of goods total: ₦{logisticsFee.toLocaleString()})
            </span>
          </div>
        </label>
      </div>

      <div className="space-y-3 border-b border-gray-100 pb-4 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <span>Goods Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
          <span className="font-semibold text-gray-900">
            ₦{subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-600">
          <span className="flex items-center gap-1">
            <span>Logistics Fee (5%)</span>
            {!hasLogistics && <span className="text-[10px] text-red-500 font-medium">(Excluded)</span>}
          </span>
          <span className={["font-semibold", hasLogistics ? "text-emerald-800" : "text-gray-400 line-through"].join(" ")}>
            ₦{logisticsFee.toLocaleString()}
          </span>
        </div>

        {vat > 0 && (
          <div className="flex items-center justify-between text-gray-600">
            <span>VAT</span>
            <span className="font-semibold text-gray-900">
              ₦{vat.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between py-4 mb-2">
        <span className="text-sm font-bold text-gray-900">Total Order Price</span>
        <span className="text-lg font-extrabold text-[#0B6B46]">
          ₦{total.toLocaleString()}
        </span>
      </div>

      <button
        type="button"
        onClick={() => router.push("/marketplace/shipping")}
        disabled={totalItems === 0}
        className="w-full rounded-xl bg-[#0B6B46] py-3.5 text-sm font-semibold text-white transition hover:bg-[#09573A] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
      >
        Proceed to Checkout
      </button>

      {totalItems === 0 && (
        <p className="mt-3 text-center text-xs text-gray-400">Your cart is empty</p>
      )}

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <ShieldCheck size={14} className="text-emerald-700" />
        Escrow Protected &amp; Verified Logistics
      </div>
    </div>
  );
}