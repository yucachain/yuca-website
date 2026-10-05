"use client";

import React, { useState } from "react";
import {
  X,
  User,
  MapPin,
  CreditCard,
  Camera,
  CheckCircle2,
  Building,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useMarketplaceRole } from "../context/MarketplaceRoleContext";

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

  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    phone: currentUser.phone || "",
    email: currentUser.email || "",
    farmAddress: currentUser.farmAddress || "",
    facilityAddress: currentUser.facilityAddress || "",
    businessAddress: currentUser.businessAddress || "",
    deliveryAddress: currentUser.deliveryAddress || "",
    bankName: currentUser.bankName || "First Bank of Nigeria",
    accountNumber: currentUser.accountNumber || "",
    accountName: currentUser.accountName || currentUser.name || "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentUser.avatarUrl || null
  );
  const [saved, setSaved] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

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
    setFormData({ ...formData, phone: cleaned });
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: formData.name,
      phone: formData.phone,
      farmAddress: formData.farmAddress,
      facilityAddress: formData.facilityAddress,
      businessAddress: formData.businessAddress,
      deliveryAddress: formData.deliveryAddress,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      avatarUrl: avatarPreview || undefined,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
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
                : "Manage your profile, farm/business location, and bank account for Admin payouts"}
            </p>
          </div>
        </div>

        {saved ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="text-emerald-600 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-gray-900">Settings Saved Successfully!</h4>
            <p className="text-xs text-gray-500 mt-1">Your profile has been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="relative">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#226049] bg-white flex items-center justify-center shadow-xs">
                  {avatarPreview ? (
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
                  <Camera size={12} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <p className="font-bold text-gray-900 text-sm">Profile Picture</p>
                <p className="text-[11px] text-gray-500">
                  Click the camera icon to upload a new profile photo.
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-[#226049] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  Role: {activeRole.toUpperCase().replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
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

            {/* Address fields according to role */}
            {activeRole === "farmer" && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">Farm Address &amp; Cluster</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.farmAddress}
                    onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeRole === "processor" && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">Factory / Processing Facility Address</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.facilityAddress}
                    onChange={(e) => setFormData({ ...formData, facilityAddress: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeRole === "service-provider" && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">Business / Operational Base Address</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                  />
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
                    <select
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                    >
                      <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                      <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                      <option value="Sterling Bank">Sterling Bank</option>
                      <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                      <option value="Fidelity Bank">Fidelity Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      required
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
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#226049] py-2.5 font-bold text-white hover:bg-[#1a4336] transition-colors shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
