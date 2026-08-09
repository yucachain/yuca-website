// Checkout — Step 4: Order Confirmation (Thank You screen, order number, delivery address, order summary table, New Arrivals section)
"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import Button from "@/app/components/ui/Button";
import CheckoutShell from "@/app/marketplace/components/CheckoutShell";

export interface OrderConfirmationPageProps {
  orderNumber?: string;
}

export default function OrderConfirmationPage({
  orderNumber = "Yuca7320994",
}: OrderConfirmationPageProps) {
  return (
    <CheckoutShell currentStep={4} cardWrapper={false} showBackToCart={false}>
      <div className="flex flex-col font-sans items-center px-4 py-16 text-center">
        <span className="flex h-40 w-40 items-center justify-center rounded-full bg-emerald-800/10">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#215243]">
            <Check size={40} strokeWidth={3} className="text-white" />
          </span>
        </span>

        <h1 className="mt-10 text-5xl font-bold text-gray-900">
          Order Successful!
        </h1>

        <p className="mt-4 max-w-md text-base leading-relaxed text-gray-500">
          You will receive a confirmation email once we have processed your
          order.
        </p>

        <p className="mt-2 text-base font-semibold text-gray-900">
          Order number: {orderNumber}
        </p>

        <div className="mt-10 w-full max-w-md">
          <Link href="/marketplace">
            <Button type="button">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    </CheckoutShell>
  );
}
