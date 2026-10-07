"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Formik, Form } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import NumericFormInput from "@/app/components/ui/NumericFormInput";
import PasswordInput from "@/app/components/ui/PasswordInput";
import Button from "@/app/components/ui/Button";
import { Check, ArrowLeft, KeyRound } from "lucide-react";

import {
  ResetPasswordSchema,
  resetPasswordInitialValues,
  ResetPasswordValues,
} from "@/app/components/validation/schema";
import AuthCard from "@/app/components/ui/Authcard";
import AuthLayout from "@/app/components/ui/AuthLayout";
import { useAuth } from "@/app/Context/AuthContext";
import { toast } from "sonner";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const urlEmail = searchParams.get("email") || "";
  const urlPhone = searchParams.get("phoneNumber") || "";
  const urlOtp = searchParams.get("otp") || "";
  const urlToken = searchParams.get("token") || searchParams.get("resetToken") || "";

  const [resetDone, setResetDone] = useState(false);

  const initialValues: ResetPasswordValues = {
    password: "",
    confirmPassword: "",
    email: urlEmail,
    phoneNumber: urlPhone,
    otp: urlOtp,
  };

  const handleSubmit = async (
    values: ResetPasswordValues,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (value: boolean) => void;
      setStatus: (value: string | null) => void;
    },
  ) => {
    setStatus(null);

    const emailToSend = (values.email || urlEmail).trim();
    const phoneToSend = (values.phoneNumber || urlPhone).trim();
    const otpToSend = (values.otp || urlOtp).trim();
    const tokenToSend = urlToken.trim();

    if (!otpToSend && !tokenToSend) {
      const err = "Please enter your verification OTP code.";
      setStatus(err);
      toast.error(err);
      setSubmitting(false);
      return;
    }

    try {
      await resetPassword({
        phoneNumber: phoneToSend,
        email: emailToSend,
        otp: otpToSend,
        resetToken: tokenToSend,
        newPassword: values.password,
      });
      setResetDone(true);
      toast.success("Password reset successfully! You can now log in.");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Password reset failed. Please request a new verification code.";
      setStatus(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (resetDone) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="flex flex-col items-center text-center">
            <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#226049] text-white">
              <Check size={36} strokeWidth={3} />
            </span>

            <h1 className="text-xl font-bold text-gray-900">
              Password Reset Successful
            </h1>

            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-600">
              Your password has been updated. You can now log in to your account with your new credentials.
            </p>

            <Link href="/login" className="mt-6 w-full">
              <Button fullWidth type="button">
                Back to Login
              </Button>
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard title="Create New Password">
        <p className="-mt-4 mb-5 text-center text-sm leading-relaxed text-gray-600">
          Enter and confirm your new password below to secure your account.
        </p>

        {(urlEmail || urlPhone) && (
          <div className="mb-4 rounded-xl border border-emerald-950/15 bg-emerald-50/50 p-3 text-center">
            <p className="text-xs text-gray-600">
              Resetting password for:{" "}
              <span className="font-semibold text-emerald-900">
                {urlEmail || urlPhone}
              </span>
            </p>
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-4" noValidate>
              {status && (
                <div className="rounded-lg bg-red-50 p-3 text-xs sm:text-sm text-red-700 border border-red-200">
                  {status}
                </div>
              )}

              {/* Only prompt for OTP if not provided in URL */}
              {!urlOtp && !urlToken && (
                <FormInput
                  name="otp"
                  label="Verification Code (OTP) *"
                  placeholder="e.g. 9802"
                />
              )}

              {/* Only prompt for email if not provided in URL */}
              {!urlEmail && !urlPhone && (
                <FormInput
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="user@example.com"
                />
              )}

              <PasswordInput
                name="password"
                label="New Password *"
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <PasswordInput
                name="confirmPassword"
                label="Confirm New Password *"
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <div className="pt-2">
                <Button fullWidth type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting Password..." : "Update Password"}
                </Button>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#226049] transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </AuthCard>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <AuthCard title="Reset Password">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#226049]"></div>
            </div>
          </AuthCard>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
