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

export default function SignUpPage() {
  const router = useRouter();

  const handleSubmit = async (
    values: SignUpValues,
    { setSubmitting, setStatus }: { setSubmitting: (v: boolean) => void; setStatus: (v: string | null) => void }
  ) => {
    setStatus(null);
    try {
      // Replace with your real sign-up call, e.g.:
      // const res = await fetch("/api/auth/signup", { method: "POST", body: JSON.stringify(values) });
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/login");
    } catch (err) {
      setStatus("We couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
     <div className="relative min-h-screen w-full bg-[#f8f9f8] overflow-hidden flex flex-col font-sans text-[#171717]">
    <main  className="min-h-screen flex items-center justify-center p-4 sm:p-6 inset-0 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]" >
      <div className="w-full max-w-md sm:max-w-lg rounded-3xl shadow-xl px-6 py-10 sm:px-10 sm:py-12 inset-0 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]"
        >

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-medium text-center text-gray-900 mb-10 sm:mb-14">
          Sign Up
        </h1>

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
                placeholder="Your First Name"
                autoComplete="given-name"
              />

              <FormInput
                name="lastName"
                label="Last Name"
                placeholder="Your Last Name"
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

              <Button 
              type="submit"   
              disabled={isSubmitting}>
                Sign Up
              </Button>

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
      </div>
    </main>
    </div>
  );
}