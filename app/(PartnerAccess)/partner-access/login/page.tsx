"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { useAuth } from "@/app/Context/AuthContext";
import {
  AggregatorLoginSchema,
  aggregatorLoginInitialValues,
  AggregatorLoginValues,
} from "@/app/components/validation/schema";

/* ── Eye icon ── */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a13.2 13.2 0 0 1-3.4 3.9M6.6 6.6C3.7 8.4 2 12 2 12a13.6 13.6 0 0 0 4.2 5.1A10.6 10.6 0 0 0 12 19c1 0 2-.1 2.9-.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Field wrapper ── */
function Field({
  label,
  id,
  error,
  touched,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}) {
  const hasError = Boolean(touched && error);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-800">
        {label}
      </label>
      {children}
      {hasError && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default function PartnerLoginPage() {
  const router = useRouter();
  const { aggregatorLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values: AggregatorLoginValues,
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
      await aggregatorLogin({ email: values.identifier, password: values.password });
      router.push("/Aggregator/dashboard");
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Unable to sign in. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex flex-1 min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">

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

        {/* White Card */}
        <div
          className="w-full rounded-3xl bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-emerald-900/8"
        >
          {/* Title */}
          <h1 className="mb-3 text-center text-2xl font-bold text-gray-900">
            Partner Login
          </h1>

          {/* Role badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-block rounded-full bg-[#226049]/10 px-4 py-1 text-xs font-medium text-[#226049]">
              For Aggregators &amp; Partners
            </span>
          </div>

          <Formik
            initialValues={aggregatorLoginInitialValues}
            validationSchema={AggregatorLoginSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status }) => (
              <Form className="flex flex-col gap-5" noValidate>

                {/* Identifier */}
                <Field label="Email / Username" id="identifier" error={errors.identifier} touched={touched.identifier}>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="partner@example.com"
                    value={values.identifier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={[
                      "w-full rounded-lg border bg-[#f5f7fa] px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-800/30 focus:border-emerald-800 transition-colors duration-150",
                      touched.identifier && errors.identifier
                        ? "border-red-400"
                        : "border-gray-200",
                    ].join(" ")}
                  />
                </Field>

                {/* Password */}
                <Field label="Password" id="partner-password" error={errors.password} touched={touched.password}>
                  <div className="relative">
                    <input
                      id="partner-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={[
                        "w-full rounded-lg border bg-[#f5f7fa] px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-800/30 focus:border-emerald-800 transition-colors duration-150",
                        touched.password && errors.password
                          ? "border-red-400"
                          : "border-gray-200",
                      ].join(" ")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </Field>

                {/* Remember me */}
                <div className="flex items-center gap-2 -mt-1">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-[#226049] focus:ring-[#226049]"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                {/* Server error */}
                {status && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
                    {status}
                  </div>
                )}

                {/* Submit button */}
                <button
                  id="partner-login-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className={[
                    "mt-1 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-800/40 focus:ring-offset-2",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    isSubmitting
                      ? "cursor-not-allowed bg-gray-300 text-gray-400"
                      : "bg-[#226049] hover:bg-[#1a4336] shadow-lg",
                  ].join(" ")}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
                      </svg>
                      Signing In...
                    </span>
                  ) : "Sign In"}
                </button>

                {/* Footer links */}
                <p className="text-center text-sm text-gray-600">
                  Forgot your password?{" "}
                  <Link href="/forgetpassword" className="font-semibold text-[#226049] hover:text-[#1a4336]">
                    Reset it here
                  </Link>
                </p>

                <p className="text-center text-xs text-gray-400">
                  New partner?{" "}
                  <Link href="/partner-access/register" className="font-semibold text-[#226049] hover:text-[#1a4336]">
                    Register your account
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
