"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Formik, Form } from "formik";
import PasswordInput from "@/app/components/ui/FormInput";
import Button from "@/app/components/ui/Button";
import { Check } from "lucide-react";

import {
  ResetPasswordSchema,
  resetPasswordInitialValues,
  ResetPasswordValues,
} from "@/app/components/validation/schema";
import AuthCard from "@/app/components/ui/Authcard";
import AuthLayout from "@/app/components/ui/AuthLayout";



function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async (
    values: ResetPasswordValues,
    { setSubmitting, setStatus }: { setSubmitting: (v: boolean) => void; setStatus: (v: string | null) => void }
  ) => {
    setStatus(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setResetDone(true);
    } catch (err) {
      setStatus("This reset link may have expired. Please request a new one.");
    } finally {
      setSubmitting(false);
    }
  };

  if (resetDone) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="flex flex-col items-center text-center">
            <span className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#215243]">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#215243]">
            <Check size={40} strokeWidth={3} className="text-white" />
          </span>
            </span>

            <h1 className="text-xl font-semibold text-gray-900">
              Password Reset Successful
            </h1>

            <p className="mt-4 max-w-xs text-base leading-relaxed text-gray-500">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>

            <Link href="/login" className="mt-8 w-full">
              <Button type="button">Back to Login</Button>
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard title="Reset Password">
        {!token && (
          <div>
          </div>
        )}

        <Formik
          initialValues={resetPasswordInitialValues}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-6" noValidate>
              {status && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {status}
                </div>
              )}

              <PasswordInput
                name="password"
                label="Password"
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <PasswordInput
                name="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <Button type="submit"
                disabled={isSubmitting}
              >
                Reset Password
              </Button>
            </Form>
          )}
        </Formik>
      </AuthCard>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <AuthCard title="Reset Password">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#226049]"></div>
          </div>
        </AuthCard>
      </AuthLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}