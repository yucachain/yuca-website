"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Formik, Form } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import Button from "@/app/components/ui/Button";
import {
  ForgotPasswordSchema,
  forgotPasswordInitialValues,
  ForgotPasswordValues,
} from "@/app/components/validation/schema";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = async (
    values: ForgotPasswordValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    // Replace with your real "send reset link" call, e.g.:
    // await fetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(values) });
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitting(false);
    setSent(true);
  };

  return (
   <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]">
      <div className="w-[400px] max-w-[751px] h-[600px]  rounded-[40px] shadow-xl px-6 py-10 sm:px-10 sm:py-12 inset-0 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]">
        {sent ? (
          <div className="space-y-8 text-center">
            <p className="text-base text-gray-500">
              If an account exists for that email, we&apos;ve sen a link to reset
              your password. Check your inbox and spam folder.
            </p>
            <Link href="/login">
              <Button type="button">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <Formik
            initialValues={forgotPasswordInitialValues}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-8" noValidate>
                <h1 className="text-2xl sm:text-3xl font-medium text-center text-gray-900 mb-4 sm:mb-5">
          Forgot Password
           </h1>
                <p className="mt-0 text-center text-base leading-relaxed text-gray-500">
                  No worries! Enter your email and 
                  we&apos;ll send you a link to
                  reset password.
                </p>

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
                  className="block text-center text-base font-medium text-gray-900 hover:underline"
                >
                  Back to Login
                </Link>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </main>
  );
}