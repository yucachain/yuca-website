"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { login } from "@/app/Services/Axios";
import FormInput from "@/app/components/ui/FormInput";
import PasswordInput from "@/app/components/ui/PasswordInput";
import Button from "@/app/components/ui/Button";
import { LoginSchema } from "@/app/components/validation/schema";
import AuthCard from "@/app/components/ui/Authcard";
import AuthLayout from "@/app/components/ui/AuthLayout";

interface AggregatorLoginValues {
  email: string;
  password: string;
}

export default function AggregatorLoginPage() {
  const router = useRouter();

  const initialValues: AggregatorLoginValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (
    values: AggregatorLoginValues,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (value: boolean) => void;
      setStatus: (status?: string) => void;
    }
  ) => {
    try {
      setStatus(undefined);

      const response = await login(values);

      // Store access token
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("userRole", "aggregator");

      router.push("/aggregator/dashboard");
    } catch (error: any) {
      setStatus(
        error?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Partner Login">
        {/* Role Badge */}
        <p className="text-center text-xs text-[#226049] font-medium bg-[#226049]/10 rounded-full px-3 py-1 mb-6 -mt-2 w-fit mx-auto">
          For Aggregators &amp; Partners
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({
            isSubmitting,
            status,
          }) => (
            <Form className="space-y-5">

              <FormInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="partner@example.com"
              />

              <PasswordInput
                name="password"
                label="Password"
                placeholder="••••••••"
              />

              {/* Server Error */}
              {status && (
                <p className="text-sm text-red-500">{status}</p>
              )}

              {/* Login Button */}
              <div className="flex justify-center pt-6">
                <Button
                  fullWidth={false}
                  className="w-40 sm:w-48"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
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

              {/* Back to marketplace login */}
              <div className="text-center text-xs text-gray-400 pt-1">
                Not a partner?{" "}
                <Link href="/login" className="text-[#226049] font-medium">
                  Marketplace login
                </Link>
              </div>

            </Form>
          )}
        </Formik>
      </AuthCard>
    </AuthLayout>
  );
}
