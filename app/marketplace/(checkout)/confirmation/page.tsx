"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, RefreshCw } from "lucide-react";
import Button from "@/app/components/ui/Button";
import CheckoutShell from "@/app/marketplace/components/CheckoutShell";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const [resolvedOrderNumber, setResolvedOrderNumber] = useState<string>("");

  useEffect(() => {
    const paramRef = searchParams.get("orderNumber") || searchParams.get("ref");
    if (paramRef) {
      setResolvedOrderNumber(paramRef);
      return;
    }

    try {
      const stored = localStorage.getItem("yuca_last_order_ref");
      if (stored) {
        setResolvedOrderNumber(stored);
        return;
      }
    } catch {}

    const generated = `ORD-${Date.now().toString().slice(-6)}`;
    setResolvedOrderNumber(generated);
  }, [searchParams]);

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

        {resolvedOrderNumber && (
          <p className="mt-2 text-base font-semibold text-gray-900 font-mono">
            Order number: {resolvedOrderNumber}
          </p>
        )}

        <div className="mt-10 w-full max-w-md">
          <Link href="/marketplace">
            <Button type="button">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    </CheckoutShell>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <RefreshCw size={24} className="animate-spin text-[#226049]" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
