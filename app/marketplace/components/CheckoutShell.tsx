import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MarketplaceNavbar, { MarketplaceUser } from "./MarketplaceNavbar";
import CheckoutSteps, { CheckoutStepsProps } from "./CheckoutSteps";
import Footer from "@/app/components/Footer";

export interface CheckoutShellProps {
  currentStep: CheckoutStepsProps["currentStep"];
  children: React.ReactNode;
  /** Wraps children in the white rounded card used by Shipping/Payment/Review. Confirmation doesn't use it. */
  cardWrapper?: boolean;
  showBackToCart?: boolean;
  cardMaxWidth?: string;
  user?: MarketplaceUser;
  cartCount?: number;
}

export default function CheckoutShell({
  currentStep,
  children,
  cardWrapper = true,
  showBackToCart = true,
  cardMaxWidth = "max-w-3xl",
  user = { initials: "DF", name: "Drevo Foods Ltd.", role: "Buyer" },
  cartCount = 5,
}: CheckoutShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-100">
      <MarketplaceNavbar user={user} cartCount={cartCount} hasNotifications />

      <main className="flex-1 px-6 py-10 lg:px-10">
        {showBackToCart && (
          <Link
            href="/marketplace"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={18} strokeWidth={1.8} />
            Back to Cart
          </Link>
        )}

        <div className="mb-10 flex flex-wrap items-center gap-x-10 gap-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
          <CheckoutSteps currentStep={currentStep} />
        </div>

        {cardWrapper ? (
          <div
            className={[
              "mx-auto w-full rounded-3xl bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] sm:p-10",
              cardMaxWidth,
            ].join(" ")}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      <Footer />
    </div>
  );
}