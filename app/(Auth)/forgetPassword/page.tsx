"use client";

import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import InputText from "@/components/InputText";

const ForgetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

export default function ForgetPassword() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (
    values: { email: string },
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) => {
    try {
      // TODO: integrate with your password reset API
      console.log("Password reset requested for:", values.email);
      await new Promise((r) => setTimeout(r, 1000)); // simulate API call
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a3a2e] via-[#215243] to-[#0f2419] px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="text-white" size={28} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Forgot your password?
                </h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  No worries! Enter your email address and we&apos;ll send you a
                  link to reset your password.
                </p>
              </div>

              {/* Form */}
              <Formik
                initialValues={{ email: "" }}
                validationSchema={ForgetPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="flex flex-col gap-5">
                    <InputText
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      theme="dark"
                      rightIcon={<Mail size={16} />}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-white text-[#215243] font-semibold rounded-lg
                                 hover:bg-white/90 active:scale-[0.98] transition-all duration-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </button>
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="text-green-400" size={56} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Check your inbox
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                We&apos;ve sent a password reset link to your email. It may take
                a minute to arrive — also check your spam folder.
              </p>
              <Link
                href="/login"
                className="inline-block py-2.5 px-6 bg-white text-[#215243] font-semibold rounded-lg
                           hover:bg-white/90 transition-colors text-sm"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-white/70 hover:text-white underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
