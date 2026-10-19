"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import FormSelect from "@/app/components/ui/FormSelect";
import Button from "@/app/components/ui/Button";
import CheckoutShell from "@/app/marketplace/components/CheckoutShell";
import {
  NIGERIAN_STATES,
  COUNTRIES,
} from "@/app/marketplace/components/locationOptions";
import {
  ShippingInfoSchema,
  shippingInfoInitialValues,
  ShippingInfoValues,
} from "@/app/components/validation/schema";
import { useAuth } from "@/app/Context/AuthContext";
import { useMarketplaceRole } from "@/app/marketplace/context/MarketplaceRoleContext";
import { useCart, DeliveryMethodOption } from "@/app/marketplace/context/CartContext";
import { marketplaceApi } from "@/app/Services/marketplaceService";
import { ShieldCheck, Truck, Warehouse, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ShippingInfoPage() {
  const router = useRouter();
  const { activeRole, currentUser } = useMarketplaceRole();
  const { user: authUser, isAuthenticated } = useAuth();
  const { deliveryMethod, setDeliveryMethod } = useCart();
  const [mounted, setMounted] = React.useState(false);

  const hasToken =
    typeof window !== "undefined" &&
    Boolean(
      localStorage.getItem("accessToken") ||
      localStorage.getItem("yuca_access_token") ||
      localStorage.getItem("token")
    );

  React.useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && !hasToken) {
      router.push("/marketplace/cart");
    }
  }, [isAuthenticated, hasToken, router]);

  const initialValues = React.useMemo<ShippingInfoValues>(() => {
    let saved: Partial<ShippingInfoValues> = {};
    if (mounted && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("yuca_shipping_info");
        if (stored) saved = JSON.parse(stored);
      } catch {}
    }

    // Check if saved firstName is a placeholder/demo
    const isSavedNameDemo =
      !saved.firstName ||
      saved.firstName.toLowerCase() === "marketplace" ||
      saved.firstName.toLowerCase() === "demo" ||
      saved.firstName.toLowerCase() === "john";

    // Extract live authenticated user fields
    const liveFirst = authUser?.firstName || currentUser.firstName || "";
    const liveLast = authUser?.lastName || currentUser.lastName || "";
    const liveFullName = (authUser?.name || currentUser.name || "").trim();
    const liveNameParts =
      liveFullName && !liveFullName.toLowerCase().includes("marketplace user")
        ? liveFullName.split(/\s+/)
        : [];

    const resolvedFirst =
      liveFirst ||
      (liveNameParts.length > 0 ? liveNameParts[0] : "") ||
      (!isSavedNameDemo ? saved.firstName : "") ||
      "";

    const resolvedLast =
      liveLast ||
      (liveNameParts.length > 1 ? liveNameParts.slice(1).join(" ") : "") ||
      (!isSavedNameDemo ? saved.lastName : "") ||
      "";

    const liveEmail = authUser?.email || currentUser.email || "";
    const isSavedEmailDemo =
      !saved.email ||
      saved.email.includes("example.com") ||
      saved.email.includes("demo@");

    const resolvedEmail =
      liveEmail || (!isSavedEmailDemo ? saved.email : "") || "";

    const livePhone = authUser?.phoneNumber || currentUser.phone || "";
    const resolvedPhone = livePhone || saved.phone || "";

    const liveAddress =
      authUser?.deliveryAddress ||
      authUser?.address ||
      currentUser.deliveryAddress ||
      currentUser.address ||
      authUser?.facilityAddress ||
      authUser?.businessAddress ||
      authUser?.farmAddress ||
      currentUser.facilityAddress ||
      currentUser.businessAddress ||
      currentUser.farmAddress ||
      "";
    const resolvedAddress = liveAddress || saved.address || "";

    const liveState = authUser?.state || currentUser.state || "";
    const resolvedState = liveState || saved.state || "Oyo";

    const resolvedCountry = saved.country || "Nigeria";
    const resolvedPostalCode = saved.postalCode || "";

    return {
      ...shippingInfoInitialValues,
      firstName: resolvedFirst,
      lastName: resolvedLast,
      email: resolvedEmail,
      phone: resolvedPhone,
      address: resolvedAddress,
      state: resolvedState,
      country: resolvedCountry,
      postalCode: resolvedPostalCode,
    };
  }, [authUser, currentUser]);

  const handleSubmit = async (
    values: ShippingInfoValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    try {
      const merged = {
        ...values,
        deliveryMethod,
        buyerRole: activeRole,
      };
      localStorage.setItem("yuca_shipping_info", JSON.stringify(merged));
      localStorage.setItem("yuca_delivery_method", deliveryMethod);
      if (values.email) {
        localStorage.setItem("yuca_user_email", values.email);
      }
      if (values.firstName || values.lastName) {
        localStorage.setItem(
          "yuca_user_name",
          `${values.firstName} ${values.lastName}`.trim()
        );
      }

      const quotePayload = {
        deliveryMethod: deliveryMethod === "direct-delivery" ? "Delivery" : "SelfPickup",
        deliveryAddress: `${values.address}, ${values.state}, Nigeria`,
        pickupLocation: "YucaVault Central Cluster, Oyo State",
      };

      try {
        const quote = await marketplaceApi.getCheckoutQuote(quotePayload);
        if (quote) {
          localStorage.setItem("yuca_checkout_quote", JSON.stringify(quote));
        }
      } catch (err) {
        console.warn("getCheckoutQuote API fallback:", err);
      }

      setSubmitting(false);
      router.push("/marketplace/review");
    } catch (err: any) {
      console.error("Shipping submit error:", err);
      toast.error("Failed to proceed: " + (err?.message || "Please check your inputs"));
      setSubmitting(false);
    }
  };

  return (
    <CheckoutShell currentStep={1}>
      <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 font-sans">
        Delivery &amp; Fulfillment
      </h2>
      <p className="mb-8 text-center text-xs text-gray-500 max-w-md mx-auto">
        Choose how your cassava batch or products will be collected and transported.
      </p>

      {/* Delivery Method Selection Cards */}
      <div className="mb-8 space-y-3 font-sans" suppressHydrationWarning>
        <label className="block text-xs font-bold text-gray-700">
          Select Delivery / Pickup Method
        </label>

        {/* Option 1: YucaVault Pickup (Highlighted for Processors & Bulk Buyers) */}
        <div
          onClick={() => setDeliveryMethod("yucavault-pickup")}
          className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            deliveryMethod === "yucavault-pickup"
              ? "border-[#226049] bg-emerald-50/40 ring-2 ring-[#226049]/15"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              deliveryMethod === "yucavault-pickup"
                ? "bg-[#226049] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Warehouse size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">
                Assign YucaVault to Pick Up &amp; Inspect
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-[#226049]">
                  5% Haulage Fee
                </span>
                <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-[#226049]">
                  Recommended for Buyers
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              YucaChain’s certified logistics truck will pick up the produce directly from the farm gate, verify weight on calibrated scales, and store or dispatch directly to your factory.
            </p>
          </div>
          <div className="mt-1">
            <input
              type="radio"
              checked={deliveryMethod === "yucavault-pickup"}
              onChange={() => setDeliveryMethod("yucavault-pickup")}
              className="accent-[#226049] h-4 w-4"
            />
          </div>
        </div>

        {/* Option 2: Direct Haulage / Delivery */}
        <div
          onClick={() => setDeliveryMethod("direct-delivery")}
          className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            deliveryMethod === "direct-delivery"
              ? "border-[#226049] bg-emerald-50/40 ring-2 ring-[#226049]/15"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              deliveryMethod === "direct-delivery"
                ? "bg-[#226049] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Truck size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">
                Direct Seller Delivery / Haulage
              </h4>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                ₦0 / No Logistics Fee Added
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Produce is transported directly from seller’s location to your provided delivery address via commercial haulage. No logistics percentage calculated.
            </p>
          </div>
          <div className="mt-1">
            <input
              type="radio"
              checked={deliveryMethod === "direct-delivery"}
              onChange={() => setDeliveryMethod("direct-delivery")}
              className="accent-[#226049] h-4 w-4"
            />
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ShippingInfoSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, submitCount }) => {
          const hasErrors = submitCount > 0 && Object.keys(errors).length > 0;

          return (
            <Form className="space-y-4 font-sans" noValidate>
              {hasErrors && (
                <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle size={14} className="shrink-0 text-red-600" />
                    <span>Please correct the required information:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-600">
                    {Object.entries(errors).map(([k, err]) => (
                      <li key={k}>{String(err)}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  name="firstName"
                  label="First Name"
                  placeholder="First Name"
                />
                <FormInput
                  name="lastName"
                  label="Last Name"
                  placeholder="Last Name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="Phone Number"
                  autoComplete="tel"
                />
                <FormInput
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Email Address"
                  autoComplete="email"
                />
              </div>

              <FormInput
                name="address"
                label="Destination / Delivery Street Address"
                placeholder="e.g. Plot 14 Industrial Layout, Agbara, Ogun State"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormSelect
                  name="state"
                  label="State"
                  placeholder="Select State"
                  options={NIGERIAN_STATES}
                />
                <FormSelect
                  name="country"
                  label="Country"
                  placeholder="Select Country"
                  options={COUNTRIES}
                />
                <FormInput
                  name="postalCode"
                  label="Postal Code (Optional)"
                  placeholder="e.g. 200001"
                />
              </div>

              <div className="mx-auto w-full max-w-[240px] pt-4">
                <Button type="submit" isLoading={isSubmitting}>
                  Continue to Review
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </CheckoutShell>
  );
}
