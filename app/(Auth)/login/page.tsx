"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import PasswordInput from "@/app/components/ui/PasswordInput";
import Button from "@/app/components/ui/Button";
import { LoginSchema } from "@/app/components/validation/schema";
import AuthCard from "@/app/components/ui/Authcard";
import AuthLayout from "@/app/components/ui/AuthLayout";
import { loginUser } from "@/app/Services/authService";

export default function LoginPage() {
  const router = useRouter();

  const initialValues = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const handleSubmit = async (
    values: typeof initialValues,
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
      await loginUser({
        identifier: values.email,
        password: values.password,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };
 

  return (
    <AuthLayout>
      <AuthCard title="Log In">
        {/* Role Badge */}
        <p className="text-center text-xs text-[#226049] font-medium bg-[#226049]/10 rounded-full px-3 py-1 mb-6 -mt-2 w-fit mx-auto">
          For Marketplace Users
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status, values, handleChange }) => (
            <Form className="space-y-5">
              <FormInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
              />

              <PasswordInput
                name="password"
                label="Password"
                placeholder="••••••••"
              />

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="rememberMe"
                  type="checkbox"
                  name="rememberMe"
                  checked={values.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 accent-[#226049] focus:ring-[#226049]"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              {/* Server Error */}
              {status && <p className="text-sm text-red-500">{status}</p>}

              {/* Login Button */}
              <div className="flex justify-center pt-6">
                <Button
                  fullWidth={false}
                  className="w-40 sm:w-48"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging In..." : "Log In"}
                </Button>
              </div>

              {/* Forgot Password */}
              <div className="text-center text-sm text-gray-600">
                Forgot your password?{" "}
                <Link
                  href="/forgetpassword"
                  className="font-medium text-[#226049]"
                >
                  Reset it here
                </Link>
              </div>
              {/* Partner login crosslink */}
              <div className="text-center text-xs text-gray-400 pt-1">
                Are you a partner?{" "}
                <Link
                  href="/aggregator-login"
                  className="text-[#226049] font-medium"
                >
                  Partner Login
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </AuthCard>
    </AuthLayout>
  );
}
