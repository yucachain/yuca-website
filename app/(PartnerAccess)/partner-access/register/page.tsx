"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { registerAggregator } from "@/app/Services/authService";
import type { AggregatorRegisterRequest } from "@/app/types/auth";
import {
  AggregatorRegisterSchema,
  aggregatorRegisterInitialValues,
  AggregatorRegisterValues,
} from "@/app/components/validation/schema";

/* ── Icons ── */
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a13.2 13.2 0 0 1-3.4 3.9M6.6 6.6C3.7 8.4 2 12 2 12a13.6 13.6 0 0 0 4.2 5.1A10.6 10.6 0 0 0 12 19c1 0 2-.1 2.9-.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Reusable field wrapper ── */
function Field({
  label,
  id,
  error,
  touched,
  required,
  optional,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const hasError = Boolean(touched && error);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {optional && <span className="text-[11px] text-gray-400">Optional</span>}
      </div>
      {children}
      {hasError && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Base input styles ── */
const inputCls = (hasError: boolean) =>
  [
    "w-full rounded-lg border bg-[#f5f7fa] px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-[#226049]/30 focus:border-[#226049] transition-colors duration-150",
    hasError ? "border-red-400" : "border-gray-200",
  ].join(" ");

/* ── Text input ── */
function TInput({
  id, name, type = "text", placeholder, autoComplete, hasError, value, onChange, onBlur, suffix,
}: {
  id: string; name: string; type?: string; placeholder?: string; autoComplete?: string;
  hasError?: boolean; value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={inputCls(!!hasError) + (suffix ? " pr-10" : "")}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ── Select ── */
function TSelect({
  id, name, placeholder, options, hasError, value, onChange, onBlur,
}: {
  id: string; name: string; placeholder: string; options: { value: string; label: string }[];
  hasError?: boolean; value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  onBlur: React.FocusEventHandler<HTMLSelectElement>;
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={[
        "w-full rounded-lg border bg-[#f5f7fa] px-3 py-2 text-sm text-gray-900 appearance-none",
        "focus:outline-none focus:ring-2 focus:ring-[#226049]/30 focus:border-[#226049] transition-colors duration-150",
        hasError ? "border-red-400" : "border-gray-200",
        value === "" ? "text-gray-400" : "text-gray-900",
      ].join(" ")}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* ── Step indicator ── */
const STEPS = [
  { label: "Personal Details", num: 1 },
  { label: "Hub Configuration", num: 2 },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-7">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                  done
                    ? "border-[#226049] bg-[#226049] text-white"
                    : active
                    ? "border-[#226049] bg-white text-[#226049]"
                    : "border-gray-200 bg-white text-gray-400",
                ].join(" ")}
              >
                {done ? <CheckIcon /> : s.num}
              </div>
              <span
                className={[
                  "mt-1 text-[10px] font-medium tracking-tight",
                  active ? "text-[#226049] font-semibold" : done ? "text-[#226049]" : "text-gray-400",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "h-[2px] w-20 mx-2 mb-4 rounded-full transition-all duration-300",
                  done ? "bg-[#226049]" : "bg-gray-200",
                ].join(" ")}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Nigerian states ── */
const NG_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

/* ── Step field lists for validation ── */
const STEP_FIELDS: (keyof AggregatorRegisterValues)[][] = [
  ["firstName", "lastName", "email", "phoneNumber", "password", "confirmPassword"],
  ["hubName", "hubState", "hubLga"], // licenseNumber is optional
];

/* ── Step 1: Personal ── */
function StepPersonal({
  v, e, t, ch, cb, showPw, setShowPw, showCpw, setShowCpw,
}: {
  v: AggregatorRegisterValues;
  e: Partial<Record<keyof AggregatorRegisterValues, string>>;
  t: Partial<Record<keyof AggregatorRegisterValues, boolean>>;
  ch: React.ChangeEventHandler<HTMLInputElement>;
  cb: React.FocusEventHandler<HTMLInputElement>;
  showPw: boolean; setShowPw: (x: boolean) => void;
  showCpw: boolean; setShowCpw: (x: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="First Name" id="firstName" error={e.firstName} touched={t.firstName} required>
        <TInput
          id="firstName"
          name="firstName"
          placeholder="e.g. Emeka"
          autoComplete="given-name"
          hasError={!!(t.firstName && e.firstName)}
          value={v.firstName}
          onChange={ch}
          onBlur={cb}
        />
      </Field>

      <Field label="Last Name" id="lastName" error={e.lastName} touched={t.lastName} required>
        <TInput
          id="lastName"
          name="lastName"
          placeholder="e.g. Okafor"
          autoComplete="family-name"
          hasError={!!(t.lastName && e.lastName)}
          value={v.lastName}
          onChange={ch}
          onBlur={cb}
        />
      </Field>

      <div className="col-span-2">
        <Field label="Email Address" id="email" error={e.email} touched={t.email} required>
          <TInput
            id="email"
            name="email"
            type="email"
            placeholder="hubmanager@example.com"
            autoComplete="email"
            hasError={!!(t.email && e.email)}
            value={v.email}
            onChange={ch}
            onBlur={cb}
          />
        </Field>
      </div>

      <div className="col-span-2">
        <Field label="Phone Number" id="phoneNumber" error={e.phoneNumber} touched={t.phoneNumber} required>
          <TInput
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="+234 801 234 5678"
            autoComplete="tel"
            hasError={!!(t.phoneNumber && e.phoneNumber)}
            value={v.phoneNumber}
            onChange={ch}
            onBlur={cb}
          />
        </Field>
      </div>

      <Field label="Password" id="password" error={e.password} touched={t.password} required>
        <TInput
          id="password"
          name="password"
          type={showPw ? "text" : "password"}
          placeholder="Min. 8 chars"
          autoComplete="new-password"
          hasError={!!(t.password && e.password)}
          value={v.password}
          onChange={ch}
          onBlur={cb}
          suffix={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              tabIndex={-1}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="hover:text-gray-600 transition-colors"
            >
              <EyeIcon open={showPw} />
            </button>
          }
        />
      </Field>

      <Field label="Confirm Password" id="confirmPassword" error={e.confirmPassword} touched={t.confirmPassword} required>
        <TInput
          id="confirmPassword"
          name="confirmPassword"
          type={showCpw ? "text" : "password"}
          placeholder="Repeat password"
          autoComplete="new-password"
          hasError={!!(t.confirmPassword && e.confirmPassword)}
          value={v.confirmPassword}
          onChange={ch}
          onBlur={cb}
          suffix={
            <button
              type="button"
              onClick={() => setShowCpw(!showCpw)}
              tabIndex={-1}
              aria-label={showCpw ? "Hide password" : "Show password"}
              className="hover:text-gray-600 transition-colors"
            >
              <EyeIcon open={showCpw} />
            </button>
          }
        />
      </Field>
    </div>
  );
}

/* ── Step 2: Hub Configuration ── */
function StepHub({
  v, e, t, ch, cb,
}: {
  v: AggregatorRegisterValues;
  e: Partial<Record<keyof AggregatorRegisterValues, string>>;
  t: Partial<Record<keyof AggregatorRegisterValues, boolean>>;
  ch: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  cb: React.FocusEventHandler<HTMLInputElement | HTMLSelectElement>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Auto-filled Partner & Role Banner */}
      <div className="rounded-xl bg-[#226049]/5 border border-[#226049]/15 p-3.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#226049]">
            Aggregator Network
          </p>
          <p className="text-sm font-bold text-gray-900">YucaChain</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#226049]">
            Assigned Role
          </p>
          <span className="inline-flex items-center rounded-md bg-[#226049] px-2.5 py-0.5 text-xs font-semibold text-white">
            Hub Manager
          </span>
        </div>
      </div>

      <Field label="Hub Name" id="hubName" error={e.hubName} touched={t.hubName} required>
        <TInput
          id="hubName"
          name="hubName"
          placeholder="e.g. Ogun Central Collection Hub"
          hasError={!!(t.hubName && e.hubName)}
          value={v.hubName}
          onChange={ch as React.ChangeEventHandler<HTMLInputElement>}
          onBlur={cb as React.FocusEventHandler<HTMLInputElement>}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Hub State" id="hubState" error={e.hubState} touched={t.hubState} required>
          <TSelect
            id="hubState"
            name="hubState"
            placeholder="Select State"
            options={NG_STATES.map((s) => ({ value: s, label: s }))}
            hasError={!!(t.hubState && e.hubState)}
            value={v.hubState}
            onChange={ch as React.ChangeEventHandler<HTMLSelectElement>}
            onBlur={cb as React.FocusEventHandler<HTMLSelectElement>}
          />
        </Field>

        <Field label="Hub LGA" id="hubLga" error={e.hubLga} touched={t.hubLga} required>
          <TInput
            id="hubLga"
            name="hubLga"
            placeholder="e.g. Abeokuta North"
            hasError={!!(t.hubLga && e.hubLga)}
            value={v.hubLga}
            onChange={ch as React.ChangeEventHandler<HTMLInputElement>}
            onBlur={cb as React.FocusEventHandler<HTMLInputElement>}
          />
        </Field>
      </div>

      <Field label="License / Registration Number" id="licenseNumber" error={e.licenseNumber} touched={t.licenseNumber} optional>
        <TInput
          id="licenseNumber"
          name="licenseNumber"
          placeholder="e.g. AGR-2024-0012345 (optional)"
          hasError={!!(t.licenseNumber && e.licenseNumber)}
          value={v.licenseNumber}
          onChange={ch as React.ChangeEventHandler<HTMLInputElement>}
          onBlur={cb as React.FocusEventHandler<HTMLInputElement>}
        />
      </Field>

      {/* Review summary before submission */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3.5 mt-1 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          Review details before submitting
        </p>
        {[
          { label: "Name", value: `${v.firstName} ${v.lastName}`.trim() || "—" },
          { label: "Email", value: v.email || "—" },
          { label: "Phone", value: v.phoneNumber || "—" },
          { label: "Hub", value: v.hubName ? `${v.hubName} (${v.hubState || "—"})` : "—" },
          { label: "Role & Network", value: "Hub Manager · YucaChain" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between text-xs">
            <span className="text-gray-400">{row.label}</span>
            <span className="text-gray-700 font-medium truncate max-w-[220px]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main partner register page ── */
export default function PartnerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (
    values: AggregatorRegisterValues,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (v: boolean) => void;
      setStatus: (s: string | null) => void;
    },
  ) => {
    setStatus(null);
    try {
      const payload: AggregatorRegisterRequest = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phoneNumber: values.phoneNumber.trim(),
        password: values.password,
        businessName: "YucaChain",
        hubName: values.hubName.trim(),
        hubState: values.hubState.trim(),
        hubLga: values.hubLga.trim(),
        accountType: "hub_manager",
        ...(values.licenseNumber?.trim() ? { licenseNumber: values.licenseNumber.trim() } : {}),
      };

      await registerAggregator(payload);
      setSuccessMsg("Account registered successfully! Redirecting to login…");
      setTimeout(() => router.push("/partner-access/login?registered=1"), 2000);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const validateStep = async (
    validateForm: () => Promise<Partial<Record<string, string>>>,
    setTouched: (t: Partial<Record<keyof AggregatorRegisterValues, boolean>>, shouldValidate?: boolean) => void,
  ) => {
    const fields = STEP_FIELDS[step];
    const touchedObj: Partial<Record<keyof AggregatorRegisterValues, boolean>> = {};
    fields.forEach((f) => { touchedObj[f] = true; });
    setTouched(touchedObj, true);
    const errors = await validateForm();
    return !fields.some((f) => errors[f]);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px]">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/Yucachain_Logo.png"
            alt="YucaChain"
            width={150}
            height={46}
            className="object-contain"
            priority
          />
        </div>

        {/* White card */}
        <div className="w-full rounded-3xl bg-white p-7 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-emerald-900/8">

          {/* Title + badge */}
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Partner Registration
          </h1>
          <div className="flex justify-center mb-6">
            <span className="inline-block rounded-full bg-[#226049]/10 px-4 py-1 text-xs font-semibold text-[#226049]">
              Hub Manager · Aggregator Portal
            </span>
          </div>

          {/* Step bar */}
          <StepBar current={step} />

          {/* Step title row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#226049]/70">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-sm font-semibold text-gray-800">
                {step === 0 ? "Personal Information" : "Hub Configuration"}
              </h2>
            </div>
          </div>

          {/* Success banner */}
          {successMsg && (
            <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#226049] text-white text-xs flex-shrink-0">
                <CheckIcon />
              </span>
              <p className="text-sm text-emerald-800 font-medium">{successMsg}</p>
            </div>
          )}

          <Formik
            initialValues={aggregatorRegisterInitialValues}
            validationSchema={AggregatorRegisterSchema}
            validateOnChange={false}
            validateOnBlur
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status, validateForm, setTouched }) => (
              <Form noValidate>

                {step === 0 && (
                  <StepPersonal
                    v={values}
                    e={errors}
                    t={touched}
                    ch={handleChange}
                    cb={handleBlur}
                    showPw={showPw}
                    setShowPw={setShowPw}
                    showCpw={showCpw}
                    setShowCpw={setShowCpw}
                  />
                )}

                {step === 1 && (
                  <StepHub
                    v={values}
                    e={errors}
                    t={touched}
                    ch={handleChange}
                    cb={handleBlur}
                  />
                )}

                {/* Server error banner */}
                {status && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                    {status}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-3 mt-6">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-150"
                    >
                      Back
                    </button>
                  )}

                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const valid = await validateStep(validateForm, setTouched);
                        if (valid) setStep((s) => s + 1);
                      }}
                      className="flex-1 rounded-xl bg-[#226049] py-2.5 text-sm font-semibold text-white hover:bg-[#1a4336] transition-all duration-150 shadow-md hover:scale-[1.01] active:scale-[0.99]"
                    >
                      Next: Hub Configuration →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={[
                        "flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-150 shadow-md",
                        "hover:scale-[1.01] active:scale-[0.99]",
                        isSubmitting
                          ? "cursor-not-allowed bg-gray-300 text-gray-400"
                          : "bg-[#226049] hover:bg-[#1a4336]",
                      ].join(" ")}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
                          </svg>
                          Registering Hub Manager...
                        </span>
                      ) : (
                        "Complete Registration"
                      )}
                    </button>
                  )}
                </div>

                {/* Footer link */}
                <p className="mt-6 text-center text-xs text-gray-500">
                  Already registered?{" "}
                  <Link
                    href="/partner-access/login"
                    className="font-semibold text-[#226049] hover:text-[#1a4336] transition-colors"
                  >
                    Sign in to Partner Portal
                  </Link>
                </p>

              </Form>
            )}
          </Formik>

        </div>
      </div>
    </main>
  );
}
