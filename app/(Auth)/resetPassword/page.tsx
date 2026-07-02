"use client";

import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import InputText from "@/components/InputText";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    values: { password: string; confirmPassword: string },
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) => {
    try {
      // TODO: integrate with your password reset API (token comes from URL params)
      console.log("New password set:", values.password);
      await new Promise((r) => setTimeout(r, 1000)); // simulate API call
      setSuccess(true);
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
          {!success ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Lock className="text-white" size={28} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Set a new password
                </h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  Your new password must be at least 8 characters long and
                  include an uppercase letter and a number.
                </p>
              </div>

              {/* Form */}
              <Formik
                initialValues={{ password: "", confirmPassword: "" }}
                validationSchema={ResetPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="flex flex-col gap-5">
                    <InputText
                      name="password"
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      theme="dark"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="text-white/60 hover:text-white transition-colors"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />

                    <InputText
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      theme="dark"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="text-white/60 hover:text-white transition-colors"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-white text-[#215243] font-semibold rounded-lg
                                 hover:bg-white/90 active:scale-[0.98] transition-all duration-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Updating..." : "Reset Password"}
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
                Password updated!
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>
              <Link
                href="/login"
                className="inline-block py-2.5 px-6 bg-white text-[#215243] font-semibold rounded-lg
                           hover:bg-white/90 transition-colors text-sm"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Need help?{" "}
          <Link href="/forgetPassword" className="text-white/70 hover:text-white underline">
            Request a new reset link
          </Link>
        </p>
      </div>
    </div>
  );
}
