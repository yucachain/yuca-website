"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Truck, Warehouse, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";

interface CartSummaryProps {
  totalItems: number;
  subtotal: number;
  vat: number;
  total: number;
}

export default function CartSummary({ totalItems, subtotal, vat, total }: CartSummaryProps) {
  const router = useRouter();
  const { logisticsFee, hasLogistics, deliveryMethod, setDeliveryMethod } = useCart();

  const isYucaVault = deliveryMethod === "yucavault-pickup";

  return (
    <div className="sticky top-6 w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-xs font-sans">
      <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

      {/* Logistics / Haulage Selection */}
      <div className="mb-5 space-y-2 text-xs">
        <label className="block text-xs font-bold text-gray-800">
          Cassava Transportation &amp; Logistics
        </label>

        {/* Option 1: YucaVault Pickup & Transport (5% calculated) */}
        <div
          onClick={() => setDeliveryMethod("yucavault-pickup")}
          className={`flex items-start gap-2.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
            isYucaVault
              ? "border-[#226049] bg-emerald-50/60 ring-1 ring-[#226049]/20"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="cart-logistics"
            checked={isYucaVault}
            onChange={() => setDeliveryMethod("yucavault-pickup")}
            className="mt-0.5 h-4 w-4 accent-[#226049] cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <Warehouse size={14} className="text-[#226049]" /> Assign YucaVault to Carry Order
              </span>
              <span className="text-[10px] font-bold text-[#226049] bg-emerald-100 px-1.5 py-0.5 rounded">
                5% Haulage
              </span>
            </div>
            <span className="block text-gray-500 text-[11px] mt-0.5 leading-snug">
              Certified YucaChain truck will pick up, weigh, and carry the cassava batch to your destination.
            </span>
          </div>
        </div>

        {/* Option 2: Another option (Self Pickup / Direct Haulage - 0% calculated) */}
        <div
          onClick={() => setDeliveryMethod("direct-delivery")}
          className={`flex items-start gap-2.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
            !isYucaVault
              ? "border-[#226049] bg-emerald-50/60 ring-1 ring-[#226049]/20"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="cart-logistics"
            checked={!isYucaVault}
            onChange={() => setDeliveryMethod("direct-delivery")}
            className="mt-0.5 h-4 w-4 accent-[#226049] cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <Truck size={14} className="text-gray-600" /> Self Pickup / Direct Arrangement
              </span>
              <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                ₦0 (None)
              </span>
            </div>
            <span className="block text-gray-500 text-[11px] mt-0.5 leading-snug">
              You or the seller arrange independent transportation. Logistics percentage will not be added.
            </span>
          </div>
        </div>
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
            <span>Logistics Fee</span>
            {isYucaVault ? (
              <span className="text-[11px] text-[#226049] font-semibold">(5% YucaVault)</span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">(Excluded)</span>
            )}
          </span>
          <span className={`font-semibold ${isYucaVault ? "text-emerald-800" : "text-gray-400"}`}>
            {isYucaVault ? `₦${logisticsFee.toLocaleString()}` : "₦0"}
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
        Escrow Protected &amp; Verified Fulfillment
      </div>
    </div>
  );
}