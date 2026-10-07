"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import NumericFormInput from "@/app/components/ui/NumericFormInput";
import Button from "@/app/components/ui/Button";
import {
  ForgotPasswordSchema,
  forgotPasswordInitialValues,
  ForgotPasswordValues,
  VerifyOtpSchema,
  verifyOtpInitialValues,
  VerifyOtpValues,
} from "@/app/components/validation/schema";
import AuthLayout from "@/app/components/ui/AuthLayout";
import AuthCard from "@/app/components/ui/Authcard";
import { useAuth } from "@/app/Context/AuthContext";
import { Mail, KeyRound, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, verifyOtp } = useAuth();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [sentEmail, setSentEmail] = useState("");
  const [sentPhone, setSentPhone] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Step 1: Request OTP code
  const handleRequestOtp = async (
    values: ForgotPasswordValues,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (value: boolean) => void;
      setStatus: (status: string | null) => void;
    },
  ) => {
    setStatus(null);

    try {
      const email = values.email.trim();
      const phoneNumber = values.phoneNumber?.trim() || "";

      await forgotPassword({
        email,
        phoneNumber,
      });

      setSentEmail(email);
      setSentPhone(phoneNumber);
      setStep("verify");
      toast.success("Verification code sent! Please check your email or phone.");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't send the verification code. Please try again.";
      setStatus(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyOtp = async (
    values: VerifyOtpValues,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (value: boolean) => void;
      setStatus: (status: string | null) => void;
    },
  ) => {
    setStatus(null);

    try {
      const code = values.code.trim();
      const res = await verifyOtp({
        email: sentEmail,
        phoneNumber: sentPhone,
        code,
      });

      const token =
        res.resetToken ||
        (res.data as any)?.resetToken ||
        (res.data as any)?.token ||
        (res as any)?.token ||
        "";

      toast.success("Verification successful!");

      // Route to reset password with verified query parameters
      const params = new URLSearchParams();
      if (sentEmail) params.set("email", sentEmail);
      if (sentPhone) params.set("phoneNumber", sentPhone);
      params.set("otp", code);
      if (token) params.set("token", token);

      router.push(`/resetpassword?${params.toString()}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid or expired verification code. Please try again.";
      setStatus(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!sentEmail && !sentPhone) return;

    setIsResending(true);
    try {
      await forgotPassword({
        email: sentEmail,
        phoneNumber: sentPhone,
      });
      toast.success("A new verification code has been sent!");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to resend code right now. Please try again shortly.";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title={step === "request" ? "Forgot Password" : "Enter Verification Code"}>
        {step === "request" ? (
          <div>
            <p className="-mt-4 mb-6 text-center text-sm leading-relaxed text-gray-600">
              Enter your email address and registered phone number. We&apos;ll send you an OTP to reset your password.
            </p>

            <Formik
              initialValues={forgotPasswordInitialValues}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleRequestOtp}
            >
              {({ isSubmitting, status }) => (
                <Form className="space-y-5" noValidate>
                  {status && (
                    <div className="rounded-lg bg-red-50 p-3 text-xs sm:text-sm text-red-700 border border-red-200">
                      {status}
                    </div>
                  )}

                  <FormInput
                    name="email"
                    label="Email Address *"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                  <NumericFormInput
                    name="phoneNumber"
                    label="Phone Number (Optional)"
                    placeholder="e.g. 08012345678"
                    allowLeadingPlus={true}
                    maxLength={15}
                    helperText="Required if your account was registered with phone number."
                  />

                  <div className="pt-2">
                    <Button fullWidth type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Sending Code..." : "Send Verification Code"}
                    </Button>
                  </div>

                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-gray-600 hover:text-[#226049] transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Login</span>
                  </Link>
                </Form>
              )}
            </Formik>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-950/15 bg-emerald-50/50 p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#226049] text-white">
                <KeyRound size={20} />
              </div>
              <p className="font-semibold text-sm text-emerald-950">
                Check Your Inbox
              </p>
              <p className="mt-1 text-xs text-gray-600">
                We sent a verification code to{" "}
                <span className="font-medium text-gray-900">{sentEmail || sentPhone}</span>
              </p>
            </div>

            <Formik
              initialValues={verifyOtpInitialValues}
              validationSchema={VerifyOtpSchema}
              onSubmit={handleVerifyOtp}
            >
              {({ isSubmitting, status, values }) => (
                <Form className="space-y-5" noValidate>
                  {status && (
                    <div className="rounded-lg bg-red-50 p-3 text-xs sm:text-sm text-red-700 border border-red-200">
                      {status}
                    </div>
                  )}

                  <FormInput
                    name="code"
                    label="Verification Code (OTP) *"
                    placeholder="e.g. 9802"
                    autoComplete="one-time-code"
                  />

                  <div className="pt-2">
                    <Button
                      fullWidth
                      type="submit"
                      disabled={!values.code.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Verifying..." : "Verify & Continue"}
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-gray-600">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="inline-flex items-center gap-1 font-semibold text-[#226049] hover:underline disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={isResending ? "animate-spin" : ""} />
                      {isResending ? "Resending..." : "Resend Code"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep("request")}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      Change email / phone
                    </button>
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
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
