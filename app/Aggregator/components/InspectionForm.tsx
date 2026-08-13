"use client";

import React from "react";
import { Formik, Form, Field, useField } from "formik";
import { MapPin, ChevronDown, ShieldCheck, CheckCircle2 } from "lucide-react";
import FormInput from "@/app/components/ui/FormInput";
import Button from "@/app/components/ui/Button";
import {
  ReceiveBatchSchema,
  receiveBatchInitialValues,
  ReceiveBatchValues,
  QualityGradeOption,
} from "@/app/components/validation/schema";

const GRADE_OPTIONS: { value: QualityGradeOption; label: string }[] = [
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
  { value: "reject", label: "Reject" },
];

const COLLECTION_POINTS = [
  "Ilorin Kwara State Hub",
  "Offa Collection Point",
  "Ogbomoso Hub",
];

function GradeSelector() {
  const [field, , helpers] = useField<QualityGradeOption | "">("qualityGrade");

  return (
    <div>
      <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-800">
        Quality grade <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GRADE_OPTIONS.map((opt) => {
          const isSelected = field.value === opt.value;
          const isReject = opt.value === "reject";

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => helpers.setValue(opt.value)}
              className={[
                "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors",
                isReject
                  ? "border-red-300 text-red-600 hover:bg-red-50"
                  : isSelected
                    ? "border-emerald-800 bg-emerald-50/60 text-emerald-900"
                    : "border-gray-300 text-gray-700 hover:border-gray-400",
              ].join(" ")}
            >
              {opt.label}
              {isSelected && !isReject && (
                <CheckCircle2
                  size={15}
                  strokeWidth={2}
                  className="text-emerald-700"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CollectionPointSelect() {
  const [field] = useField("collectionPoint");

  return (
    <div>
      <label
        htmlFor="collectionPoint"
        className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-800"
      >
        Collection point location <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <MapPin
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <select
          id="collectionPoint"
          {...field}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/30"
        >
          <option value="" disabled>
            Select a collection point
          </option>
          {COLLECTION_POINTS.map((point) => (
            <option key={point} value={point}>
              {point}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  );
}

function SignOffTrigger() {
  const [field, , helpers] = useField<boolean>("signedOff");

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">
        Farmer confirmation sign-off
      </label>
      <button
        type="button"
        onClick={() => helpers.setValue(!field.value)}
        className={[
          "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-sm font-medium transition-colors",
          field.value
            ? "border-emerald-700 bg-emerald-50/60 text-emerald-800"
            : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100",
        ].join(" ")}
      >
        <ShieldCheck size={16} strokeWidth={1.8} />
        {field.value ? "Signed off by farmer" : "In app OTP / Sign-off"}
      </button>
    </div>
  );
}

export interface InspectionFormProps {
  onSubmit: (values: ReceiveBatchValues) => void | Promise<void>;
}

export default function InspectionForm({ onSubmit }: InspectionFormProps) {
  const handleSubmit = async (
    values: ReceiveBatchValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void },
  ) => {
    await onSubmit(values);
    setSubmitting(false);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-900">Inspection form</h3>

      <Formik
        initialValues={receiveBatchInitialValues}
        validationSchema={ReceiveBatchSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="mt-5 space-y-5" noValidate>
            <FormInput
              name="confirmedWeight"
              label="Confirmed weight (kg)"
              placeholder="Enter actual verified weight"
              inputMode="decimal"
            />

            <GradeSelector />

            <div className="w-full">
              <label
                htmlFor="qualityNotes"
                className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-800"
              >
                Quality notes <span className="text-red-500">*</span>
              </label>
              <Field
                as="textarea"
                id="qualityNotes"
                name="qualityNotes"
                rows={3}
                placeholder="Note slight damages, moisture content, etc."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/30"
              />
            </div>

            <CollectionPointSelect />
            <SignOffTrigger />

            <Button type="submit" isLoading={isSubmitting}>
              Confirm receipt and issue ticket
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
