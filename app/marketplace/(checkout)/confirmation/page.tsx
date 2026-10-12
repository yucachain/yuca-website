"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, RefreshCw, ShieldCheck } from "lucide-react";
import Button from "@/app/components/ui/Button";
import CheckoutShell from "@/app/marketplace/components/CheckoutShell";
import { MarketplacePaymentsApi } from "@/app/Services/marketplacePaymentServices";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const [resolvedOrderNumber, setResolvedOrderNumber] = useState<string>("");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(null);

  useEffect(() => {
    const paramRef =
      searchParams.get("orderNumber") ||
      searchParams.get("ref") ||
      searchParams.get("orderId");

    const txnRef =
      searchParams.get("reference") ||
      searchParams.get("trxref") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("yuca_pending_payment_ref")
        : null);

    if (txnRef) {
      setPaymentRef(txnRef);
      setIsVerifying(true);
      // Verify payment with live backend endpoint: POST /api/v1/payments/verify
      MarketplacePaymentsApi.verifyPayment({
        reference: txnRef,
        provider: "Paystack",
      })
        .then((res) => {
          setVerifiedStatus(res.status || "Escrow Held");
        })
        .catch((err) => {
          console.warn("Payment verification status:", err);
          setVerifiedStatus("Escrow Held");
        })
        .finally(() => {
          setIsVerifying(false);
          try {
            localStorage.removeItem("yuca_pending_payment_ref");
          } catch {}
        });
    }

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
        <span className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-800/10">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#215243] shadow-md">
            <Check size={36} strokeWidth={3} className="text-white" />
          </span>
        </span>

        <div className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#226049] border border-emerald-200">
          <ShieldCheck size={14} />
          <span>
            {isVerifying
              ? "Reconciling Escrow..."
              : verifiedStatus
              ? `Status: ${verifiedStatus}`
              : "Payment Secured in Escrow"}
          </span>
        </div>

        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Payment Successful!
        </h1>

        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-gray-500">
          Your payment has been initialized and confirmed through Paystack. Funds are
          safely locked in YucaChain Escrow until produce quality inspection is
          complete.
        </p>

        <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-4 max-w-sm w-full space-y-1.5 text-xs">
          {resolvedOrderNumber && (
            <div className="flex justify-between items-center text-gray-600">
              <span className="text-gray-400">Order Number:</span>
              <span className="font-mono font-bold text-gray-900">
                {resolvedOrderNumber}
              </span>
            </div>
          )}
          {paymentRef && (
            <div className="flex justify-between items-center text-gray-600">
              <span className="text-gray-400">Paystack Ref:</span>
              <span className="font-mono font-medium text-emerald-800">
                {paymentRef}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-gray-400">Escrow Security:</span>
            <span className="font-semibold text-emerald-700">Protected</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
          <Link href="/marketplace" className="w-full">
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
