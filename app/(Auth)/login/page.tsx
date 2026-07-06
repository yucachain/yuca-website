"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { login } from "@/app/Services/Axios";
import FormInput from "@/app/components/ui/FormInput";
import PasswordInput from "@/app/components/ui/PasswordInput";
import Button from "@/app/components/ui/Button";
import { LoginSchema } from "@/app/components/validation/schema";

interface LoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();

  const initialValues: LoginValues = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const handleSubmit = async (
    values: LoginValues,
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

      // Store your access token
      localStorage.setItem("accessToken", response.accessToken);

      router.push("/dashboard");
    } catch (error: any) {
      setStatus(
        error?.message || "Invalid email or password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f8f9f8] overflow-hidden flex flex-col font-sans text-[#171717]">
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]">
        <div className="w-full max-w-md sm:max-w-lg  rounded-[40px] shadow-xl px-6 py-10 sm:px-10 sm:py-12 inset-0 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]">

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-medium text-center text-gray-900 mb-10 sm:mb-14">
            Log In
          </h1>

          <Formik
            initialValues={initialValues}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({
              isSubmitting,
              status,
              values,
              handleChange,
            }) => (
              <Form className="space-y-5">

                <FormInput
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"

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
                    className="h-4 w-4 rounded border-gray-300 accent-[#3F9142] focus:ring-emerald-800"
                  />

                  <label
                    htmlFor="rememberMe"
                    className="text-sm sm:text-base text-gray-800"
                  >
                    Remember me
                  </label>
                </div>

                {/* Server Error */}

                {status && (
                  <p className="text-sm text-red-500">
                    {status}
                  </p>
                )}

                {/* Login Button */}
                <div className="pt-10 sm:pt-14 space-y-5">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Logging In..."
                      : "Log In"}
                  </Button>
                </div>

                {/* Forgot Password */}

                <div className="text-center text-sm sm:text-base text-gray-700">
                  Forgot Password?{" "}
                  <Link
                    href="/forgetpassword"
                    className="font-bold text-emerald-800"
                  >
                    Click here...
                  </Link>
                </div>

                {/* Request Access */}

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