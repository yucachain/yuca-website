"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  MapPin,
  CreditCard,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  Sprout,
  Factory,
  Tractor,
  ShoppingBag,
  Bell,
} from "lucide-react";
import { useMarketplaceRole } from "../context/MarketplaceRoleContext";
import {
  getUserProfile,
  updateUserProfile,
  getUserBankDetails,
  updateUserBankDetails,
  uploadUserAvatar,
  getUserSettings,
  updateUserSettings,
  type UserSettingsPayload,
} from "@/app/Services/userService";
import { NIGERIAN_STATES } from "@/app/marketplace/components/locationOptions";
import { toast } from "sonner";

interface RoleProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleProfileSettingsModal({
  isOpen,
  onClose,
}: RoleProfileSettingsModalProps) {
  const { activeRole, currentUser, updateCurrentUser } = useMarketplaceRole();
  const isConsumer = activeRole === "consumer";

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    firstName: currentUser.firstName || "",
    lastName: currentUser.lastName || "",
    phoneNumber: currentUser.phone || "",
    email: currentUser.email || "",
    address: currentUser.address || "",
    farmAddress: currentUser.farmAddress || "",
    facilityAddress: currentUser.facilityAddress || "",
    businessAddress: currentUser.businessAddress || "",
    deliveryAddress: currentUser.deliveryAddress || "",
    state: currentUser.state || "Oyo",
    lga: currentUser.lga || "",
    farmName: currentUser.farmName || "",
    businessName: currentUser.businessName || "",
    companyName: currentUser.companyName || "",
    bankName: currentUser.bankName || "",
    accountNumber: currentUser.accountNumber || "",
    accountName: currentUser.accountName || currentUser.name || "",
  });

  const [settings, setSettings] = useState<UserSettingsPayload>({
    smsAlertsEnabled: true,
    emailAlertsEnabled: true,
    pushAlertsEnabled: true,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentUser.avatarUrl || null
  );
  const [saved, setSaved] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Fetch remote profile, bank details, and settings when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    async function fetchData() {
      try {
        const [profileRes, bankRes, settingsRes] = await Promise.allSettled([
          getUserProfile(),
          !isConsumer ? getUserBankDetails() : Promise.resolve(null),
          getUserSettings(),
        ]);

        if (!isMounted) return;

        let profile: any = null;
        if (profileRes.status === "fulfilled" && profileRes.value) {
          profile = profileRes.value?.data || profileRes.value;
        }

        let bank: any = null;
        if (bankRes.status === "fulfilled" && bankRes.value) {
          bank = bankRes.value?.data || bankRes.value;
        }

        if (settingsRes.status === "fulfilled" && settingsRes.value) {
          const s: any = (settingsRes.value as any)?.data || settingsRes.value;
          if (s && typeof s === "object") {
            setSettings({
              smsAlertsEnabled: s.smsAlertsEnabled !== false,
              emailAlertsEnabled: s.emailAlertsEnabled !== false,
              pushAlertsEnabled: s.pushAlertsEnabled !== false,
            });
          }
        }

        const fullName = profile?.name || currentUser.name || "";
        const parts = fullName.trim().split(" ");
        const first = profile?.firstName || parts[0] || "";
        const last = profile?.lastName || parts.slice(1).join(" ") || "";

        setFormData((prev) => ({
          ...prev,
          name: fullName,
          firstName: first,
          lastName: last,
          phoneNumber: profile?.phoneNumber || currentUser.phone || "",
          email: profile?.email || currentUser.email || "",
          address: profile?.address || prev.address,
          farmAddress: profile?.farmAddress || currentUser.farmAddress || "",
          facilityAddress: profile?.facilityAddress || currentUser.facilityAddress || "",
          businessAddress: profile?.businessAddress || currentUser.businessAddress || "",
          deliveryAddress: profile?.deliveryAddress || currentUser.deliveryAddress || "",
          state: profile?.state || currentUser.state || prev.state,
          lga: profile?.lga || currentUser.lga || prev.lga,
          farmName: profile?.farmName || currentUser.farmName || "",
          businessName: profile?.businessName || currentUser.businessName || "",
          companyName: profile?.companyName || currentUser.companyName || "",
          bankName: bank?.bankName || bank?.data?.bankName || profile?.bankName || currentUser.bankName || prev.bankName || "",
          accountNumber: bank?.accountNumber || bank?.data?.accountNumber || profile?.accountNumber || currentUser.accountNumber || prev.accountNumber || "",
          accountName: bank?.accountName || bank?.data?.accountName || profile?.accountName || currentUser.accountName || prev.accountName || fullName,
        }));

        if (profile?.avatarUrl) {
          setAvatarPreview(profile.avatarUrl);
        }
      } catch {
        // Fallback to existing context values
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, isConsumer, currentUser]);

  if (!isOpen) return null;

  const handleNumericKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    setError: (err: string | null) => void,
    allowPlus: boolean = false
  ) => {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End" ||
      ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x", "z", "y"].includes(e.key.toLowerCase()))
    ) {
      setError(null);
      return;
    }

    if (allowPlus && e.key === "+" && (e.currentTarget.selectionStart === 0 || !e.currentTarget.value.includes("+"))) {
      setError(null);
      return;
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      setError("Number is required here. Text is not allowed.");
    } else {
      setError(null);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/[a-zA-Z]/.test(raw)) {
      setPhoneError("Number is required here. Text is not allowed.");
    } else {
      setPhoneError(null);
    }
    const cleaned = raw.replace(/[^0-9+]/g, "");
    setFormData({ ...formData, phoneNumber: cleaned });
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/[a-zA-Z]/.test(raw)) {
      setAccountError("Number is required here. Text is not allowed.");
    } else {
      setAccountError(null);
    }
    const cleaned = raw.replace(/[^0-9]/g, "").slice(0, 10);
    setFormData({ ...formData, accountNumber: cleaned });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show temporary local preview immediately for great UX
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const uploadedUrl = await uploadUserAvatar(file);
      if (uploadedUrl && (uploadedUrl.startsWith("http://") || uploadedUrl.startsWith("https://"))) {
        setAvatarPreview(uploadedUrl);
        toast.success("Profile photo uploaded successfully!");
      } else {
        toast.info("Photo selected.");
      }
    } catch (err: any) {
      console.warn("Avatar upload error:", err);
      toast.warning("Photo selected locally. (Avatar upload: " + (err?.message || "server error") + ")");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullName = (formData.name || currentUser.name || "User").trim();
      const parts = fullName.split(/\s+/).filter(Boolean);
      const firstName = formData.firstName.trim() || parts[0] || fullName || "User";
      const lastName =
        formData.lastName.trim() ||
        (parts.length > 1 ? parts.slice(1).join(" ") : parts[0] || "User");

      const resolvedAddress = (
        formData.address ||
        formData.farmAddress ||
        formData.facilityAddress ||
        formData.businessAddress ||
        formData.deliveryAddress ||
        currentUser.address ||
        "Nigeria"
      ).trim();

      const resolvedFarmAddress = (
        formData.farmAddress || (activeRole === "farmer" ? resolvedAddress : "")
      ).trim();

      const resolvedFacilityAddress = (
        formData.facilityAddress || (activeRole === "processor" ? resolvedAddress : "")
      ).trim();

      const resolvedBusinessAddress = (
        formData.businessAddress || (activeRole === "service-provider" ? resolvedAddress : "")
      ).trim();

      const resolvedDeliveryAddress = (
        formData.deliveryAddress || (activeRole === "consumer" ? resolvedAddress : "")
      ).trim();

      // Only pass valid remote URLs to PUT /api/v1/user/profile to avoid 422 errors
      const cleanAvatarUrl =
        avatarPreview && (avatarPreview.startsWith("http://") || avatarPreview.startsWith("https://"))
          ? avatarPreview
          : currentUser.avatarUrl && (currentUser.avatarUrl.startsWith("http://") || currentUser.avatarUrl.startsWith("https://"))
          ? currentUser.avatarUrl
          : "";

      let backendErrorMsg = "";

      // 1. Authoritative Update Profile call (PUT /api/v1/user/profile)
      try {
        await updateUserProfile({
          name: fullName,
          firstName,
          lastName,
          phoneNumber: formData.phoneNumber.trim(),
          address: resolvedAddress,
          farmAddress: resolvedFarmAddress,
          facilityAddress: resolvedFacilityAddress,
          businessAddress: resolvedBusinessAddress,
          deliveryAddress: resolvedDeliveryAddress,
          avatarUrl: cleanAvatarUrl,
          state: (formData.state || currentUser.state || "Oyo").trim(),
          lga: (formData.lga || currentUser.lga || "Ibadan").trim(),
          farmName: formData.farmName.trim(),
          businessName: formData.businessName.trim(),
          companyName: formData.companyName.trim(),
        });
      } catch (err: any) {
        backendErrorMsg = err?.message || "Failed to update profile";
      }

      // 2. Authoritative Update Bank Details (PUT /api/v1/user/bank-details) for non-consumers
      if (!isConsumer && (formData.bankName || formData.accountNumber)) {
        try {
          await updateUserBankDetails({
            bankName: formData.bankName.trim(),
            accountNumber: formData.accountNumber.trim(),
            accountName: formData.accountName.trim() || fullName,
          });
        } catch (err: any) {
          if (!backendErrorMsg) {
            backendErrorMsg = err?.message || "Failed to update bank details";
          }
        }
      }

      // 3. Authoritative Update User Notification Settings (PUT /api/v1/user/settings)
      try {
        await updateUserSettings({
          smsAlertsEnabled: Boolean(settings.smsAlertsEnabled),
          emailAlertsEnabled: Boolean(settings.emailAlertsEnabled),
          pushAlertsEnabled: Boolean(settings.pushAlertsEnabled),
        });
      } catch (err: any) {
        console.warn("User settings update failed:", err);
      }

      // 4. Update local context with skipBackendSync to prevent duplicate/triple calls
      await updateCurrentUser({
        name: fullName,
        firstName,
        lastName,
        phone: formData.phoneNumber.trim(),
        address: resolvedAddress,
        farmAddress: resolvedFarmAddress,
        facilityAddress: resolvedFacilityAddress,
        businessAddress: resolvedBusinessAddress,
        deliveryAddress: resolvedDeliveryAddress,
        state: (formData.state || currentUser.state || "Oyo").trim(),
        lga: (formData.lga || currentUser.lga || "Ibadan").trim(),
        farmName: formData.farmName.trim(),
        businessName: formData.businessName.trim(),
        companyName: formData.companyName.trim(),
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        accountName: formData.accountName.trim() || fullName,
        avatarUrl: cleanAvatarUrl || undefined,
        skipBackendSync: true,
      });

      setSaved(true);
      if (backendErrorMsg) {
        if (
          backendErrorMsg.toLowerCase().includes("session") ||
          backendErrorMsg.toLowerCase().includes("unauthorized") ||
          backendErrorMsg.toLowerCase().includes("401")
        ) {
          toast.warning("Profile saved locally! Please sign in again to sync changes to the cloud.");
        } else {
          toast.warning(`Saved locally: ${backendErrorMsg}`);
        }
      } else {
        toast.success("Profile & settings saved successfully!");
      }

      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please verify your connection.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-100 font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#226049]">
            <User size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isConsumer ? "My Profile & Delivery Address" : "Account & Payout Settings"}
            </h3>
            <p className="text-xs text-gray-500">
              {isConsumer
                ? "Update your personal details and delivery location"
                : "Manage your profile, business information, and bank account for Admin payouts"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Loader2 size={32} className="text-[#226049] animate-spin mb-3" />
            <p className="text-xs font-semibold text-gray-600">Loading user profile details...</p>
          </div>
        ) : saved ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="text-emerald-600 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-gray-900">Settings Saved Successfully!</h4>
            <p className="text-xs text-gray-500 mt-1">Your profile has been updated on YucaChain.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="relative">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#226049] bg-white flex items-center justify-center shadow-xs">
                  {isUploadingAvatar ? (
                    <Loader2 size={24} className="text-[#226049] animate-spin" />
                  ) : avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-[#226049]">
                      {formData.name.substring(0, 2).toUpperCase() || "YU"}
                    </span>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#226049] text-white flex items-center justify-center shadow-xs cursor-pointer hover:bg-[#1a4336]">
                  {isUploadingAvatar ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Camera size={12} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingAvatar}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <p className="font-bold text-gray-900 text-sm">Profile Picture</p>
                <p className="text-[11px] text-gray-500">
                  {isUploadingAvatar
                    ? "Uploading photo to server..."
                    : "Click the camera icon to upload a new profile photo."}
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-[#226049] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  Account Role: {activeRole.toUpperCase().replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onKeyDown={(e) => handleNumericKeyDown(e, setPhoneError, true)}
                  onChange={handlePhoneChange}
                  className={`w-full rounded-xl border px-3 py-2 text-gray-900 focus:outline-none ${
                    phoneError
                      ? "border-red-500 bg-red-50/20 focus:border-red-500"
                      : "border-gray-200 focus:border-[#226049]"
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 animate-in fade-in">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* State & LGA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">LGA / City</label>
                <input
                  type="text"
                  placeholder="e.g. Iseyin / Ikeja"
                  value={formData.lga}
                  onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            {/* Role Specific Names and Addresses */}
            {activeRole === "farmer" && (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Farm Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Green Harvest Farm"
                    value={formData.farmName}
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Farm Address &amp; Cluster</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Iseyin Agro Cluster, Farm Block 4B, Oyo State"
                      value={formData.farmAddress}
                      onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeRole === "processor" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. PrimeStarch Mills Ltd"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. PrimeStarch Processing Hub"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Processing Facility Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Plot 14 Industrial Layout, Agbara, Ogun State"
                      value={formData.facilityAddress}
                      onChange={(e) => setFormData({ ...formData, facilityAddress: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeRole === "service-provider" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AgroMech Solutions Ltd"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AgroMech Tractor Rentals"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Business / Operational Base Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Central Mechanization Yard, Iwo Road, Ibadan"
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeRole === "consumer" && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">Delivery Address</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24 Admiralty Way, Lekki Phase 1, Lagos"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Bank Details (Farmer, Processor, Service Provider only) */}
            {!isConsumer && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <CreditCard size={15} className="text-[#226049]" />
                  <span className="font-bold text-gray-900 text-xs">
                    Bank Account for Admin Payouts
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  Admin will disburse proceeds from your cassava batches, processed sales, and machinery rentals into this designated account.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Access Bank, Zenith Bank, GTBank, OPay..."
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="0123456789"
                      value={formData.accountNumber}
                      onKeyDown={(e) => handleNumericKeyDown(e, setAccountError, false)}
                      onChange={handleAccountChange}
                      className={`w-full rounded-xl border px-3 py-2 font-mono text-gray-900 focus:outline-none ${
                        accountError
                          ? "border-red-500 bg-red-50/20 focus:border-red-500"
                          : "border-gray-200 focus:border-[#226049]"
                      }`}
                    />
                    {accountError && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 animate-in fade-in">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{accountError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block font-semibold text-gray-600 mb-1">Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Account name as registered with your bank"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Notification & Alert Preferences (PUT /api/v1/user/settings) */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Bell size={15} className="text-[#226049]" />
                <span className="font-bold text-gray-900 text-xs">
                  Notification &amp; Alert Preferences
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">
                Manage your real-time alerts and communication channels for orders, marketplace updates, and payouts.
              </p>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">SMS Alerts</p>
                    <p className="text-[11px] text-gray-500">Receive urgent dispatch and order status messages via SMS text</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsAlertsEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, smsAlertsEnabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-[#226049] focus:ring-[#226049] border-gray-300 accent-[#226049] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">Email Alerts</p>
                    <p className="text-[11px] text-gray-500">Receive email summaries, invoices, and payout confirmations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailAlertsEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, emailAlertsEnabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-[#226049] focus:ring-[#226049] border-gray-300 accent-[#226049] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">Push Notifications</p>
                    <p className="text-[11px] text-gray-500">Instant browser notifications and in-app updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pushAlertsEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, pushAlertsEnabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-[#226049] focus:ring-[#226049] border-gray-300 accent-[#226049] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-[#226049] py-2.5 font-bold text-white hover:bg-[#1a4336] transition-colors shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
