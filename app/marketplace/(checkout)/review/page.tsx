// Stub placeholder
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Button from "@/app/components/ui/Button";
import CheckoutShell from "@/app/marketplace/components/CheckoutShell";
import ReviewSection from "@/app/marketplace/components/ReviewSection";

interface ReviewItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Sample data standing in for the cart/shipping/payment state that would
// normally come from a cart store and the previous two checkout steps.
const INITIAL_ITEMS: ReviewItem[] = [
  { id: "1", name: "TME 419 Stems", quantity: 4, price: 420 },
  { id: "2", name: "Fresh Cassava", quantity: 2, price: 400 },
  { id: "3", name: "Cassava Roots", quantity: 5, price: 500 },
  { id: "4", name: "Quality Cassava", quantity: 1, price: 500 },
  { id: "5", name: "TME 419 Stems", quantity: 2, price: 1000 },
  { id: "6", name: "TME 419 Stems", quantity: 2, price: 500 },
];

const VAT = 50;

export default function ReviewOrderPage() {
  const router = useRouter();
  const [items, setItems] = useState(INITIAL_ITEMS);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + VAT;

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmOrder = async () => {
    // Replace with your real "place order" call, e.g.:
    // await fetch("/api/checkout/confirm", { method: "POST", body: JSON.stringify({ items }) });
    router.push("/marketplace/payment");
  };

  return (
    <CheckoutShell currentStep={3} >
      <h2 className="mb-8 text-2xl font-sans font-bold text-gray-900">Review Your Order</h2>

      <div className="space-y-6 font-sans">
        <ReviewSection title="Items">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-800">
                  {item.name} ({item.quantity})
                </span>
                <div className="flex items-center gap-6">
                  <span className="font-medium text-gray-900">
                    #{item.price.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-gray-500">No items left in this order.</p>
            )}
          </div>
        </ReviewSection>

    {/*     <ReviewSection title="Shipping Address" actionLabel="Edit" onAction={() => router.push("/checkout/shipping")}>
          <div className="space-y-1 text-sm text-gray-700">
            <p className="font-medium text-gray-900">Damilare Muhammed</p>
            <p>+2347065876121</p>
            <p>muhammmeddamilare99@gmail.com</p>
            <p className="pt-2">42, Igbasan avenue, akowonjo area, Ilorin, Kwara State, Nigeria.</p>
          </div>
        </ReviewSection> */}

       {/*  <ReviewSection title="Payment Method" actionLabel="Change" onAction={() => router.push("/checkout/payment")}>
          <p className="mb-3 text-sm font-medium text-gray-900">Card Payment</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Card Name</p>
              <p className="mt-0.5 font-bold italic text-blue-700">VISA</p>
            </div>
            <div>
              <p className="text-gray-500">Cardholder Name</p>
              <p className="mt-0.5 text-gray-900">Penpal Active</p>
            </div>
            <div>
              <p className="text-gray-500">Card Number</p>
              <p className="mt-0.5 text-gray-900">xxxx xxxx xxxx 5432</p>
            </div>
          </div>
        </ReviewSection> */}

        <ReviewSection title="Order Summary">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Item ({items.length})</span>
              <span>#{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>VAT</span>
              <span>#{VAT.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
              <span>Total</span>
              <span>#{total.toLocaleString()}</span>
            </div>
          </div>
        </ReviewSection>
      </div>

      <div className="mt-8 font-sans">
        <Button 
        fullWidth={false}
        className="mx-auto w-full max-w-[220px] pt-3"
        type="button" 
        onClick={handleConfirmOrder}>
          Confirm Order
        </Button>
      </div>
    </CheckoutShell>
  );
}

