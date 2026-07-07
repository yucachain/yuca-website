"use client";

import { useState } from "react";
import Link from "next/link";
import { Formik, Form } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import Button from "@/app/components/ui/Button";
import {
  ForgotPasswordSchema,
  forgotPasswordInitialValues,
  ForgotPasswordValues,
  VerifyResetLinkSchema,
  verifyResetLinkInitialValues,
  VerifyResetLinkValues,
} from "@/app/components/validation/schema";
import AuthLayout from "@/app/components/ui/AuthLayout";
import AuthCard from "@/app/components/ui/Authcard";

function EnvelopeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m3.5 6 8.5 7 8.5-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const handleSendLink = async (
    values: ForgotPasswordValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    // Replace with your real "send reset link" call, e.g.:
    // await fetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(values) });
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSentEmail(values.email);
    setSent(true);
    setSubmitting(false);
  };

  const handleResend = async () => {
    // Replace with your real resend call, reusing sentEmail.
    await new Promise((resolve) => setTimeout(resolve, 600));
  };

  const handleVerifyLink = async (
    values: VerifyResetLinkValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
  };

  return (
    //<div className="relative min-h-screen w-full bg-[#f8f9f8] overflow-hidden flex flex-col font-sans text-[#171717]">
      <AuthLayout>
      <AuthCard title="Forgot Password">
          <p className="-mt-4 pt-0 mb-8 text-center text-base leading-relaxed text-gray-600">
            No worries! Enter your email and we&apos;ll send you a link to reset
            password.
          </p>

          {!sent && (
            <Formik
              initialValues={forgotPasswordInitialValues}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleSendLink}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-8" noValidate>
                  <FormInput
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                  <Button type="submit" disabled={isSubmitting}>
                    Send Reset Link
                  </Button>

                  <Link
                    href="/login"
                    className="block text-center text-base font-medium text-gray-900"
                  >
                    Back to Login
                  </Link>
                </Form>
              )}
            </Formik>
          )}

          {sent && (
            <div className="space-y-8">
              <Formik
                initialValues={verifyResetLinkInitialValues}
                validationSchema={VerifyResetLinkSchema}
                onSubmit={handleVerifyLink}
              >
                {({ isSubmitting, values }) => (
                  <Form className="space-y-8" noValidate>
                    <FormInput
                      name="resetLink"
                      label="Reset Link"
                      placeholder="Paste reset link"
                    />

                    <Button
                      type="submit"
                      disabled={!values.resetLink.trim()}
                    >
                      Verify Link
                    </Button>

                    <Link
                      href="/login"
                      className="block text-center text-base font-medium text-gray-900"
                    >
                      Back to Login
                    </Link>
                  </Form>
                )}
              </Formik>

              <div className="flex gap-4 rounded-2xl border border-emerald-950/25  p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                  <EnvelopeIcon />
                </span>
                <div>
                  <p className="font-semibold text-emerald-900">Check your email</p>
                  <p className="mt-1 text-sm leading-relaxed text-emerald-900">
                    We&apos;ve sent a password reset link to {sentEmail || "your email"}.
                    The link will expire in 15 minutes..
                  </p>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                Didn&apos;t receive email? Check your spam folder, or{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-bold text-emerald-800"
                >
                  Resend reset link
                </button>
              </p>
            </div>
          )}
          </AuthCard>
    </AuthLayout>
    //</div>
  );
}