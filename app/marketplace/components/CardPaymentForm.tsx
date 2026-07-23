"use client";

import { Formik, Form, Field } from "formik";
import { Lock, ShieldCheck, Info } from "lucide-react";
import FormInput from "@/app/components/ui/FormInput";
import Button from "@/app/components/ui/Button";
import {
  CardPaymentSchema,
  cardPaymentInitialValues,
  CardPaymentValues,
} from "@/app/components/validation/schema";

export interface CardPaymentFormProps {
  onProceed: (values: CardPaymentValues) => void | Promise<void>;
}

export default function CardPaymentForm({ onProceed }: CardPaymentFormProps) {
  const handleSubmit = async (
    values: CardPaymentValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    await onProceed(values);
    setSubmitting(false);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">Card Payment</h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
        <Lock size={12} strokeWidth={2} />
        Your payment is secured and encrypted
      </p>

      <Formik
        initialValues={cardPaymentInitialValues}
        validationSchema={CardPaymentSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="mt-6 space-y-5" noValidate>
            <FormInput
              name="cardNumber"
              label="Card Number"
              placeholder="1234 5678 9876 5432"
              inputMode="numeric"
            />
            <FormInput
              name="cardHolderName"
              label="Card Holder Name"
              placeholder="Card Holder Name"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput name="expDate" label="Exp Date" placeholder="09/30" />
              <div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <label htmlFor="cvv" className="text-sm font-medium text-gray-800">
                    CVV
                  </label>
                  <Info size={13} strokeWidth={2} className="text-gray-400" />
                </div>
                <FormInput name="cvv" placeholder="333" inputMode="numeric" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Field
                type="checkbox"
                name="saveCard"
                className="h-4 w-4 rounded border-gray-300 accent-[#215243]"
              />
              Save card for future payments
            </label>

            <div className="flex gap-2.5 rounded-lg bg-emerald-50/70 px-4 py-3 text-xs leading-relaxed text-emerald-900">
              <ShieldCheck size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-emerald-700" />
              Your payment information is safe with us, we use industry standard encryption to
              protect your data.
            </div>

            <Button type="submit" isLoading={isSubmitting}>
              Proceed
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}