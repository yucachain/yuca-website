"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Formik, Form } from "formik";
import PasswordInput from "@/app/components/ui/FormInput";
import Button from "@/app/components/ui/Button";

import {
  ResetPasswordSchema,
  resetPasswordInitialValues,
  ResetPasswordValues,
} from "@/app/components/validation/schema";

function CheckIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 9.5 17 19 7"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async (
    values: ResetPasswordValues,
    { setSubmitting, setStatus }: { setSubmitting: (v: boolean) => void; setStatus: (v: string | null) => void }
  ) => {
    setStatus(null);
    try {
      // Replace with your real reset call, e.g.:
      // await fetch("/api/auth/reset-password", {
      //   method: "POST",
      //   body: JSON.stringify({ ...values, token }),
      // });
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
       <main  className="min-h-screen flex items-center justify-center p-4 sm:p-6 inset-0 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]" >
      <div className="w-full max-w-md sm:max-w-lg rounded-3xl shadow-xl px-6 py-10 sm:px-10 sm:py-12 inset-0 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]"
        >
          <div className="flex flex-col items-center text-center">
            <span className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#215243]">
              <CheckIcon />
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
        </div>
      </main>
    );
  }

  return (
     <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]">
      <div className="w-full max-w-md sm:max-w-lg  rounded-[40px] shadow-xl px-6 py-10 sm:px-10 sm:py-12 inset-0 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]">
        {!token && (
          <div>
             <h1 className="text-2xl sm:text-3xl font-medium text-center text-gray-900 mb-10 sm:mb-14">
          Reset Password
        </h1>
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

              <Button type="submit" isLoading={isSubmitting}>
                Reset Password
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}