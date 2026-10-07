"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import FormInput from "@/app/components/ui/FormInput";
import FormSelect from "@/app/components/ui/FormSelect";
import NumericFormInput from "@/app/components/ui/NumericFormInput";
import PasswordInput from "@/app/components/ui/PasswordInput";
import Button from "@/app/components/ui/Button";
import AuthCard from "@/app/components/ui/Authcard";
import AuthLayout from "@/app/components/ui/AuthLayout";
import { useAuth } from "@/app/Context/AuthContext";
import {
  useMarketplaceRole,
  MarketplaceRole,
} from "@/app/marketplace/context/MarketplaceRoleContext";
import {
  MarketplaceRegisterSchema,
  marketplaceRegisterInitialValues,
  MarketplaceRoleType,
} from "@/app/components/validation/schema";
import {
  NIGERIAN_STATES,
  getLgasForState,
} from "@/app/marketplace/components/locationOptions";
import {
  Sprout,
  Factory,
  Tractor,
  ShoppingBag,
  Building,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface RoleOption {
  id: MarketplaceRoleType;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}

const ROLES: RoleOption[] = [
  {
    id: "farmer",
    title: "Farmer",
    badge: "Producer",
    description: "Sell raw harvested cassava directly to bulk off-takers.",
    icon: <Sprout size={18} />,
  },
  {
    id: "processor",
    title: "Buyer / Processor",
    badge: "Off-taker & Miller",
    description: "Source bulk cassava roots and produce garri, flour & starch.",
    icon: <Factory size={18} />,
  },
  {
    id: "service-provider",
    title: "Service Provider",
    badge: "Machinery & Stems",
    description: "Rent tractors & machinery or supply certified stems.",
    icon: <Tractor size={18} />,
  },
  {
    id: "consumer",
    title: "Consumer",
    badge: "Shopper",
    description: "Order fresh garri, flour and packaged foods for delivery.",
    icon: <ShoppingBag size={18} />,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { setActiveRole, updateCurrentUser } = useMarketplaceRole();
  const [selectedRole, setSelectedRole] = useState<MarketplaceRoleType>("farmer");

  const handleSubmit = async (
    values: typeof marketplaceRegisterInitialValues,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (value: boolean) => void;
      setStatus: (status: string | null) => void;
    }
  ) => {
    setStatus(null);

    try {
      const names = values.fullName.trim().split(/\s+/).filter(Boolean);
      const firstName = names[0] || "User";
      const lastName = names.slice(1).join(" ") || firstName;
      const cleanEmail = values.email ? values.email.trim() : "";

      // Register through AuthContext / API with exact request body contract
      await register({
        role: values.role,
        fullName: values.fullName.trim(),
        firstName,
        lastName,
        phoneNumber: values.phoneNumber.trim(),
        email: cleanEmail,
        password: values.password,
        farmAddress: values.farmAddress || "",
        companyName: values.companyName || "",
        facilityAddress: values.facilityAddress || "",
        businessAddress: values.businessAddress || "",
        deliveryAddress: values.deliveryAddress || "",
        state: values.state || "",
        lga: values.lga || "",
        farmName: values.farmName || "",
        businessName: values.businessName || values.companyName || "",
      });

      // Update role & profile in MarketplaceRoleContext
      setActiveRole(values.role as MarketplaceRole);
      updateCurrentUser({
        name: values.fullName.trim(),
        phone: values.phoneNumber.trim(),
        email: cleanEmail,
        role: values.role as MarketplaceRole,
        farmAddress: values.farmAddress,
        facilityAddress: values.facilityAddress,
        businessAddress: values.businessAddress,
        deliveryAddress: values.deliveryAddress,
        companyName: values.companyName,
        businessName: values.businessName || values.companyName,
      });

      toast.success("Account created successfully! Please log in to continue.");
      router.push("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during registration. Please try again.";
      setStatus(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Create Account" className="max-w-xl sm:max-w-2xl">
        {/* Role Badge */}
        <p className="text-center text-xs text-[#226049] font-medium bg-[#226049]/10 rounded-full px-3 py-1 mb-5 -mt-2 w-fit mx-auto">
          For Marketplace Users
        </p>

        <Formik
          initialValues={marketplaceRegisterInitialValues}
          validationSchema={MarketplaceRegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status, values, setFieldValue, handleChange }) => {
            const handleRoleSelect = (roleId: MarketplaceRoleType) => {
              setSelectedRole(roleId);
              setFieldValue("role", roleId);
            };

            const currentRoleObj = ROLES.find((r) => r.id === values.role) || ROLES[0];
            const lgaOptions = useMemo(() => getLgasForState(values.state), [values.state]);

            return (
              <Form className="space-y-4">
                {/* 4 Marketplace Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-2">
                    Select Your Marketplace Role *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ROLES.map((role) => {
                      const isSelected = values.role === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleRoleSelect(role.id)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${isSelected
                            ? "border-[#226049] bg-emerald-50/70 text-[#226049] font-bold shadow-xs ring-2 ring-[#226049]/20"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                        >
                          <span className={`mb-1 ${isSelected ? "text-[#226049]" : "text-gray-400"}`}>
                            {role.icon}
                          </span>
                          <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                            {role.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-normal">
                    {currentRoleObj.description}
                  </p>
                </div>

                {/* Full Name */}
                <FormInput
                  name="fullName"
                  label="Full Name *"
                  type="text"
                  placeholder={values.role === "farmer" ? "e.g. Musa Ibrahim" : "e.g. John Doe"}
                  autoComplete="name"
                />

                {/* Phone Number & Email (Side by Side) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <NumericFormInput
                    name="phoneNumber"
                    label="Phone Number *"
                    placeholder="08012345678"
                    allowLeadingPlus={true}
                    maxLength={15}
                    helperText="Required for login identifier."
                  />

                  <FormInput
                    name="email"
                    label="Email Address (Optional)"
                    type="email"
                    placeholder="e.g. user@example.com"
                    autoComplete="email"
                    helperText="Optional for notifications."
                  />
                </div>

                {/* State & LGA (Side by Side with Live LGA Selection) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <FormSelect
                    name="state"
                    label="State"
                    placeholder="Select State"
                    options={NIGERIAN_STATES}
                    onChange={(e) => {
                      setFieldValue("state", e.target.value);
                      setFieldValue("lga", "");
                    }}
                  />

                  <FormSelect
                    name="lga"
                    label="LGA / Town"
                    placeholder={values.state ? "Select LGA" : "Select State first"}
                    options={lgaOptions}
                    disabled={!values.state || lgaOptions.length === 0}
                  />
                </div>

                {/* Role Specific Address / Facility Information (Side by Side) */}
                {values.role === "farmer" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <FormInput
                      name="farmName"
                      label="Farm Name"
                      type="text"
                      placeholder="e.g. Green Valley Farm"
                    />
                    <FormInput
                      name="farmAddress"
                      label="Farm Address *"
                      type="text"
                      placeholder="e.g. Block 4B, Iseyin Cluster"
                    />
                  </div>
                )}

                {values.role === "processor" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <FormInput
                      name="companyName"
                      label="Company / Business Name *"
                      type="text"
                      placeholder="e.g. PrimeStarch Mills Ltd"
                    />
                    <FormInput
                      name="facilityAddress"
                      label="Processing Facility Address *"
                      type="text"
                      placeholder="e.g. Plot 14 Industrial Layout, Agbara"
                    />
                  </div>
                )}

                {values.role === "service-provider" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <FormInput
                      name="companyName"
                      label="Business Name *"
                      type="text"
                      placeholder="e.g. AgroMech Tractor Rentals"
                    />
                    <FormInput
                      name="businessAddress"
                      label="Workshop Address *"
                      type="text"
                      placeholder="e.g. Central Yard, Iwo Road, Ibadan"
                    />
                  </div>
                )}

                {values.role === "consumer" && (
                  <FormInput
                    name="deliveryAddress"
                    label="Primary Delivery Address *"
                    type="text"
                    placeholder="e.g. 24 Admiralty Way, Lekki Phase 1, Lagos"
                  />
                )}

                {/* Password & Confirm Password (Side by Side) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <PasswordInput
                    name="password"
                    label="Password *"
                    placeholder="••••••••"
                  />

                  <PasswordInput
                    name="confirmPassword"
                    label="Confirm Password *"
                    placeholder="••••••••"
                  />
                </div>

                {/* Server Error */}
                {status && (
                  <p className="text-xs sm:text-sm text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {status}
                  </p>
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    fullWidth={true}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Account..." : `Register as ${currentRoleObj.title}`}
                  </Button>
                </div>

                {/* Already have an account link */}
                <div className="text-center text-xs sm:text-sm text-gray-600 pt-2">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#226049] hover:underline"
                  >
                    Sign In here
                  </Link>
                </div>
              </Form>
            );
          }}
        </Formik>
      </AuthCard>
    </AuthLayout>
  );
}
