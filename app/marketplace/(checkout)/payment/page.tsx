// Stub placeholder
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutShell from "@/app/marketplace/components/CheckoutShell";
import PaymentMethodSelector, {
  PaymentMethodId,
} from "@/app/marketplace/components/PaymentMethodSelector";
import CardPaymentForm from "@/app/marketplace/components/CardPaymentForm";
import type { CardPaymentValues } from "@/app/components/validation/schema";

export default function PaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethodId>("card");

  const handleProceed = async (values: CardPaymentValues) => {
    // Replace with your real "save payment method" call, e.g.:
    // await fetch("/api/checkout/payment", { method: "POST", body: JSON.stringify({ method, ...values }) });
    await new Promise((resolve) => setTimeout(resolve, 600));
    router.push("/marketplace/confirmation");
  };

  return (
    <CheckoutShell currentStep={2} cardMaxWidth="max-w-5xl">
      <div className="grid grid-cols-1 font-sans gap-10 lg:grid-cols-2">
        <PaymentMethodSelector value={method} onChange={setMethod} />

        {method === "card" ? (
          <CardPaymentForm onProceed={handleProceed} />
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center text-sm text-gray-500">
            {method === "bank-transfer"
              ? "Bank transfer instructions would go here."
              : "Yuca Wallet is coming soon."}
          </div>
        )}
      </div>
    </CheckoutShell>
  );
}
