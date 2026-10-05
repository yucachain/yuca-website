"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Database,
  CreditCard,
  Bell,
  Shield,
  Check,
  Save,
  Smartphone,
  Loader2,
} from "lucide-react";
import type { AdminSettings } from "./types";
import { adminService } from "@/app/Services/adminService";
import { useAuth } from "@/app/Context/AuthContext";
import { resolveDisplayName } from "@/app/Services/authService";

const BLANK_SETTINGS: AdminSettings = {
  businessName: "",
  hubName: "",
  hubId: "",
  licenseNumber: "",
  hubState: "",
  hubLga: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  maxCapacityTonnes: 0,
  spoilageRiskThresholdHours: 24,
  bankName: "",
  accountNumber: "",
  accountName: "",
  settlementFrequency: "Daily",
  spoilageAlertsEmail: false,
  orderAlertsSms: false,
  twoFactorEnabled: false,
};

export default function SettingsSection() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "capacity" | "payout" | "notifications" | "security">("profile");
  const [settings, setSettings] = useState<AdminSettings>(BLANK_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const userDisplayName = resolveDisplayName(authUser, "");
      try {
        const res = await adminService.getSettings();
        setSettings({
          businessName: res?.businessName || authUser?.businessName || "YucaChain",
          hubName: res?.hubName || authUser?.hubName || "",
          hubId: res?.hubId || "",
          licenseNumber: res?.licenseNumber || "",
          hubState: res?.hubState || authUser?.hubState || "",
          hubLga: res?.hubLga || authUser?.hubLga || "",
          contactName: res?.contactName || userDisplayName || "",
          email: res?.email || authUser?.email || "",
          phone: res?.phone || authUser?.phoneNumber || "",
          address: res?.address || "",
          maxCapacityTonnes: Number(res?.maxTonnesCapacity ?? res?.maxCapacityTonnes ?? 0),
          spoilageRiskThresholdHours: Number(res?.spoilageRiskThresholdHours ?? 24),
          bankName: res?.bankName || "",
          accountNumber: res?.accountNumber || "",
          accountName: res?.accountName || "",
          settlementFrequency: (res?.settlementFrequency as any) || "Daily",
          spoilageAlertsEmail: Boolean(res?.spoilageAlertsEmail),
          orderAlertsSms: Boolean(res?.orderAlertsSms),
          twoFactorEnabled: Boolean(res?.twoFactorEnabled),
        });
      } catch (err: any) {
        console.warn("Could not load settings from server:", err);
        // Fallback to real logged-in user profile, NOT fake demo data
        setSettings({
          ...BLANK_SETTINGS,
          businessName: authUser?.businessName || "YucaChain",
          hubName: authUser?.hubName || "",
          hubState: authUser?.hubState || "",
          hubLga: authUser?.hubLga || "",
          contactName: userDisplayName || "",
          email: authUser?.email || "",
          phone: authUser?.phoneNumber || "",
        });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [authUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updateSettings({
        businessName: settings.businessName || "YucaChain",
        hubName: settings.hubName,
        hubId: settings.hubId,
        licenseNumber: settings.licenseNumber,
        hubState: settings.hubState,
        hubLga: settings.hubLga,
        maxTonnesCapacity: Number(settings.maxCapacityTonnes) || 0,
        spoilageRiskThresholdHours: Number(settings.spoilageRiskThresholdHours) || 0,
        settlementFrequency: settings.settlementFrequency || "Daily",
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error("Failed to update settings on server:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">System &amp; Platform Settings</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Configure facility details, storage capacity thresholds, payout accounts, and security controls.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
            <Check size={16} /> Settings saved successfully!
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "profile"
              ? "bg-[#226049] text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <Building2 size={16} /> Hub Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("capacity")}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "capacity"
              ? "bg-[#226049] text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <Database size={16} /> Storage &amp; Capacity
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payout")}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "payout"
              ? "bg-[#226049] text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <CreditCard size={16} /> Bank &amp; Settlement
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "notifications"
              ? "bg-[#226049] text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <Bell size={16} /> Notifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "security"
              ? "bg-[#226049] text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <Shield size={16} /> Security &amp; 2FA
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-16 text-center shadow-xs">
          <Loader2 size={24} className="animate-spin text-[#226049] mb-3" />
          <p className="text-sm font-semibold text-gray-900">Loading Settings...</p>
          <p className="text-xs text-gray-500 mt-1">Connecting to live admin API</p>
        </div>
      ) : (
      <form onSubmit={handleSave} className="space-y-6">

        {activeTab === "profile" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Facility &amp; Operator Profile
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Business / Organization Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={settings.businessName || "YucaChain"}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Hub / Facility Name</label>
                <input
                  type="text"
                  name="hubName"
                  value={settings.hubName}
                  onChange={handleChange}
                  placeholder="e.g. Ogun Central Hub"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Contact Admin Person</label>
                <input
                  type="text"
                  name="contactName"
                  value={settings.contactName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Official Email</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="hub@example.com"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  placeholder="+234 800 000 0000"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Hub State</label>
                <input
                  type="text"
                  name="hubState"
                  value={settings.hubState || ""}
                  onChange={handleChange}
                  placeholder="e.g. Ogun"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Hub LGA</label>
                <input
                  type="text"
                  name="hubLga"
                  value={settings.hubLga || ""}
                  onChange={handleChange}
                  placeholder="e.g. Abeokuta North"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Physical Address</label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  placeholder="e.g. Plot 14 Agro-Industrial Estate"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "capacity" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Warehouse &amp; Capacity Thresholds
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Maximum Vault Capacity (Tonnes)</label>
                <input
                  type="number"
                  name="maxCapacityTonnes"
                  value={settings.maxCapacityTonnes}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
                <p className="mt-1 text-[11px] text-gray-400">Combined storage volume of all active vault units.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Spoilage Warning Risk Threshold (Hours)</label>
                <input
                  type="number"
                  name="spoilageRiskThresholdHours"
                  value={settings.spoilageRiskThresholdHours}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
                <p className="mt-1 text-[11px] text-gray-400">Triggers alert badge if unprocessed cassava sits longer.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Payout */}
        {activeTab === "payout" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Bank Account &amp; Settlement Details
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={settings.bankName}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={settings.accountNumber}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Account Name</label>
                <input
                  type="text"
                  name="accountName"
                  value={settings.accountName}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Settlement Frequency</label>
                <select
                  name="settlementFrequency"
                  value={settings.settlementFrequency}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700 cursor-pointer"
                >
                  <option value="Instant">Instant (Per Order)</option>
                  <option value="Daily">Daily Summary Settlement</option>
                  <option value="Weekly">Weekly Batch Settlement</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Notification &amp; Alert Preferences
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 cursor-pointer hover:bg-gray-50">
                <div>
                  <span className="block text-sm font-semibold text-gray-900">Email Spoilage Risk Alerts</span>
                  <span className="block text-xs text-gray-500">Send urgent email alerts when batches exceed storage window.</span>
                </div>
                <input
                  type="checkbox"
                  name="spoilageAlertsEmail"
                  checked={settings.spoilageAlertsEmail}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 accent-[#226049]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 cursor-pointer hover:bg-gray-50">
                <div>
                  <span className="block text-sm font-semibold text-gray-900">SMS Marketplace Order Notifications</span>
                  <span className="block text-xs text-gray-500">Receive instant SMS when buyers accept new orders.</span>
                </div>
                <input
                  type="checkbox"
                  name="orderAlertsSms"
                  checked={settings.orderAlertsSms}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 accent-[#226049]"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 5: Security */}
        {activeTab === "security" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Security &amp; Account Protection
            </h2>

            <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <Smartphone className="text-emerald-700" size={20} />
                <div>
                  <span className="block text-sm font-semibold text-emerald-900">Two-Factor Authentication (2FA)</span>
                  <span className="block text-xs text-emerald-700">Require SMS/Authenticator code on admin login.</span>
                </div>
              </div>
              <input
                type="checkbox"
                name="twoFactorEnabled"
                checked={settings.twoFactorEnabled}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 accent-[#226049]"
              />
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Change Password</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all cursor-pointer shadow-sm",
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#226049] hover:bg-[#1a4b39] active:scale-[0.99]",
            ].join(" ")}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving Settings...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
