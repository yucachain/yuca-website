"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Truck, Warehouse, MapPin, User, ShieldCheck } from "lucide-react";
import Button from "@/app/components/ui/Button";
import CheckoutShell from "@/app/marketplace/components/CheckoutShell";
import ReviewSection from "@/app/marketplace/components/ReviewSection";
import { useCart } from "@/app/marketplace/context/CartContext";

const VAT = 50;

export default function ReviewOrderPage() {
  const router = useRouter();
  const { cartItems, subtotal, logisticsFee, hasLogistics, total, removeFromCart } = useCart();
  const [shippingInfo, setShippingInfo] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("yuca_shipping_info");
      if (stored) {
        setShippingInfo(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  const handleConfirmOrder = () => {
    router.push("/marketplace/payment");
  };

  const isYucaVault = shippingInfo?.deliveryMethod === "yucavault-pickup";

  return (
    <CheckoutShell currentStep={2}>
      <h2 className="mb-6 text-2xl font-sans font-bold text-gray-900 text-center">
        Review Your Order &amp; Fulfillment
      </h2>

      <div className="space-y-6 font-sans text-xs">
        {/* Fulfillment Summary */}
        <ReviewSection title="Delivery &amp; Collection Method">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#226049] text-white">
              {isYucaVault ? <Warehouse size={18} /> : <Truck size={18} />}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">
                {isYucaVault
                  ? "Assigned to YucaVault (Mobile Pickup & Inspection)"
                  : "Direct Haulage / Doorstep Delivery"}
              </p>
              <p className="text-gray-500 mt-0.5 leading-relaxed text-xs">
                {isYucaVault
                  ? "YucaVault mobile weighbridge truck will inspect and verify produce quality at harvest gate before intake."
                  : `Delivering to: ${shippingInfo?.address || "Provided destination"}, ${shippingInfo?.state || "Oyo"}, Nigeria.`}
              </p>
            </div>
          </div>
        </ReviewSection>

        {/* Recipient Details */}
        {shippingInfo && (
          <ReviewSection title="Recipient &amp; Contact">
            <div className="flex justify-between items-center text-xs text-gray-700">
              <div>
                <p className="font-bold text-gray-900">
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </p>
                <p className="text-gray-500 mt-0.5">
                  {shippingInfo.phone} • {shippingInfo.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/marketplace/shipping")}
                className="text-xs font-semibold text-[#226049] hover:underline"
              >
                Edit Details
              </button>
            </div>
          </ReviewSection>
        )}

        {/* Order Items */}
        <ReviewSection title="Order Items">
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <span className="font-bold text-gray-900 block text-sm">
                    {item.title}
                  </span>
                  <span className="text-gray-500">
                    Quantity: {item.quantity} {item.unit} • Grade {item.grade}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-gray-900 text-sm">
                    ₦{(item.pricePerTonne * item.quantity).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
            {cartItems.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">
                Your cart is empty. Add products from the marketplace to proceed.
              </p>
            )}
          </div>
        </ReviewSection>

        {/* Pricing Breakdown */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-gray-900">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>YucaChain Escrow Protection:</span>
            <span className="font-bold text-emerald-800">FREE / Covered</span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
            <span>Total Payable:</span>
            <span className="text-base text-[#226049]">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={handleConfirmOrder}
            disabled={cartItems.length === 0}
          >
            Proceed to Bank Transfer Payment
          </Button>
        </div>
      </div>
    </CheckoutShell>
  );
}
