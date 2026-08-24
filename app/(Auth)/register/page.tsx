"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import PasswordInput from "@/app/components/ui/PasswordInput";
import Button from "@/app/components/ui/Button";

import {
  SignUpSchema,
  signUpInitialValues,
  SignUpValues,
} from "@/app/components/validation/schema";
import AuthCard from "@/app/components/ui/Authcard";
import AuthLayout from "@/app/components/ui/AuthLayout";
import { useAuth } from "@/app/Context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (
    values: SignUpValues,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (v: boolean) => void;
      setStatus: (v: string | null) => void;
    },
  ) => {
    setStatus(null);
    try {
      await register({
        fullName: `${values.firstName} ${values.lastName}`.trim(),
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        password: values.password,
      });
      router.push("/marketplace");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "We couldn't create your account. Please try again.";
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // <div className="relative min-h-screen w-full bg-[#f8f9f8] overflow-hidden flex flex-col font-sans text-[#171717]">
    <AuthLayout>
      <AuthCard title="SIGN UP">
        <Formik
          initialValues={signUpInitialValues}
          validationSchema={SignUpSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-6" noValidate>
              {status && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {status}
                </div>
              )}

              <FormInput
                name="firstName"
                label="First Name"
                placeholder="John"
                autoComplete="given-name"
              />

              <FormInput
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                autoComplete="family-name"
              />

              <FormInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />

              <PasswordInput
                name="password"
                label="Password"
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <PasswordInput
                name="confirmPassword"
                label="Re-type Password"
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="w-40 sm:w-48"
                  disabled={isSubmitting}
                >
                  Sign Up
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-emerald-800">
                  Log In
                </Link>
              </p>

              <div className="pt-2 text-center">
                <Link
                  href="/request-acess"
                  className="text-sm font-bold text-emerald-800"
                >
                  Request Access
                </Link>
                <p className="mt-0.5 text-xs text-gray-700">
                  (For industrial buyers and processors)
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </AuthCard>
    </AuthLayout>
    //  </div>
  );
}
