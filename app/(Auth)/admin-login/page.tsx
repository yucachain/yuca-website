"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import PasswordInput from "@/app/components/ui/PasswordInput";
import Button from "@/app/components/ui/Button";
import { AdminLoginSchema, adminLoginInitialValues } from "@/app/components/validation/schema";
import AuthCard from "@/app/components/ui/Authcard";
import AuthLayout from "@/app/components/ui/AuthLayout";
import { useAuth } from "@/app/Context/AuthContext";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, login } = useAuth();

  const handleSubmit = async (
    values: typeof adminLoginInitialValues,
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
      const doLogin = adminLogin || login;
      await doLogin({
        email: values.email.trim(),
        identifier: values.email.trim(),
        password: values.password,
      });
      toast.success("Admin authenticated successfully. Welcome to the Console.");
      router.push("/admin");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please verify your admin credentials.";
      setStatus(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Admin Console Login">
        {/* Admin Badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#226049] font-semibold bg-[#226049]/10 rounded-full px-3 py-1 mb-6 -mt-2 w-fit mx-auto">
          <ShieldCheck size={14} />
          <span>System Administration Access</span>
        </div>

        <Formik
          initialValues={adminLoginInitialValues}
          validationSchema={AdminLoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-5">
              {/* Only Email Address */}
              <FormInput
                name="email"
                label="Admin Email Address"
                type="email"
                placeholder="admin@yucachain.com"
                autoComplete="email"
              />

              {/* Password */}
              <PasswordInput
                name="password"
                label="Password"
                placeholder="••••••••"
              />

              {/* Server Error */}
              {status && <p className="text-sm text-red-500">{status}</p>}

              {/* Login Button */}
              <div className="flex justify-center pt-4">
                <Button
                  fullWidth={true}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Authenticating..." : "Sign In to Admin Console"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </AuthCard>
    </AuthLayout>
  );
}
