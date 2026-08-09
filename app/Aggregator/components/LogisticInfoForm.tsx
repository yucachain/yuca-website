"use client";

import React from "react";
import { Formik, Form } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import {
  DispatchLogisticsSchema,
  dispatchLogisticsInitialValues,
  DispatchLogisticsValues,
} from "@/app/components/validation/schema";

export interface LogisticInfoFormProps {
  onConfirmDispatch: (values: DispatchLogisticsValues) => void | Promise<void>;
  onIssueReceipt: (values: DispatchLogisticsValues) => void | Promise<void>;
}

export default function LogisticInfoForm({
  onConfirmDispatch,
  onIssueReceipt,
}: LogisticInfoFormProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <h3 className="text-lg font-bold text-gray-900">Logistic Information</h3>

      <Formik
        initialValues={dispatchLogisticsInitialValues}
        validationSchema={DispatchLogisticsSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onConfirmDispatch(values);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, values, validateForm, setTouched }) => (
          <Form className="mt-5 space-y-5" noValidate>
            <FormInput
              name="transportCompany"
              label="Transport Company"
              placeholder="e.g. Penpal Logistics"
            />
            <FormInput
              name="vehiclePlateNumber"
              label="Vehicle plate number"
              placeholder="e.g. ABC-XYZ-123"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                name="deliveryDate"
                label="Delivery date"
                type="date"
              />
              <FormInput
                name="deliveryTime"
                label="Delivery Time"
                type="time"
              />
            </div>

            <FormInput
              name="additionalNotes"
              label="Additional notes"
              placeholder="e.g. Handle with care, and keep dry"
            />

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[#215243] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                Confirm Dispatch
              </button>

              <button
                type="button"
                onClick={async () => {
                  const errors = await validateForm();
                  if (Object.keys(errors).length > 0) {
                    setTouched(
                      Object.keys(dispatchLogisticsInitialValues).reduce(
                        (acc, key) => ({ ...acc, [key]: true }),
                        {},
                      ),
                    );
                    return;
                  }
                  await onIssueReceipt(values);
                }}
                className="rounded-xl border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                Issue Receipt
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
