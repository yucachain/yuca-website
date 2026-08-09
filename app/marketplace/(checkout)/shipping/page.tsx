// Stub placeholder
"use client";

import React from "react";
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

export default function ShippingInfoPage() {
  const router = useRouter();

  const handleSubmit = async (
    values: ShippingInfoValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void },
  ) => {
    // Replace with your real "save shipping info" call, e.g.:
    // await fetch("/api/checkout/shipping", { method: "POST", body: JSON.stringify(values) });
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    router.push("/marketplace/review");
  };

  return (
    <CheckoutShell currentStep={1}>
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
        Shipping Information
      </h2>

      <Formik
        initialValues={shippingInfoInitialValues}
        validationSchema={ShippingInfoSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5" noValidate>
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
            <FormInput
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="Phone Number"
              autoComplete="tel"
            />
            <FormInput
              name="email"
              label="Email"
              type="email"
              placeholder="Email"
              autoComplete="email"
            />
            <FormInput
              name="address"
              label="Delivery Address"
              placeholder="Street Address"
            />
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
              label="Postal Code"
              placeholder="Zip Code"
            />

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Field
                  type="checkbox"
                  name="sameBillingAddress"
                  className="h-4 w-4 rounded border-gray-300 accent-[#215243]"
                />
                Billing and delivery address are the same.
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Field
                  type="checkbox"
                  name="saveDetails"
                  className="h-4 w-4 rounded border-gray-300 accent-[#215243]"
                />
                Save details.
              </label>
            </div>

            <div className="mx-auto w-full max-w-[220px] pt-3">
              <Button type="submit" isLoading={isSubmitting}>
                Confirm
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </CheckoutShell>
  );
}
