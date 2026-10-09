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
import { toast } from "sonner";

import { AdminApiService } from "@/app/Services/admin";
import { Sliders } from "lucide-react";
import type { PlatformAdminSettings, UpdateAdminSettingsRequest } from "@/app/types/admin/admin";

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

const DEFAULT_PLATFORM_SETTINGS: PlatformAdminSettings = {
  escrowFeePercent: 1.5,
  logisticsPerKmRate: 150,
  cassavaPricePerTonFloor: 85000,
  payoutAutomationEnabled: true,
  platformCommissionPercent: 2.5,
  defaultLogisticsFeeNgn: 5000,
  spoilageRiskThresholdHours: 72,
  maintenanceMode: false,
  supportEmail: "support@yucachain.com.ng",
  supportPhone: "+234 800 982 2242",
};

export default function SettingsSection() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "platform" | "profile" | "capacity" | "payout" | "notifications" | "security"
  >("platform");
  const [settings, setSettings] = useState<AdminSettings>(BLANK_SETTINGS);
  const [platformSettings, setPlatformSettings] = useState<PlatformAdminSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const userDisplayName = resolveDisplayName(authUser, "");
      try {
        const [hubRes, platformRes] = await Promise.allSettled([
          adminService.getSettings(),
          AdminApiService.getSettings(),
        ]);

        if (platformRes.status === "fulfilled" && platformRes.value) {
          const p = platformRes.value;
          setPlatformSettings((prev) => ({
            ...prev,
            escrowFeePercent: p.escrowFeePercent ?? prev.escrowFeePercent,
            logisticsPerKmRate: p.logisticsPerKmRate ?? prev.logisticsPerKmRate,
            cassavaPricePerTonFloor: p.cassavaPricePerTonFloor ?? prev.cassavaPricePerTonFloor,
            payoutAutomationEnabled: p.payoutAutomationEnabled ?? prev.payoutAutomationEnabled,
            platformCommissionPercent: p.platformCommissionPercent ?? prev.platformCommissionPercent,
            defaultLogisticsFeeNgn: p.defaultLogisticsFeeNgn ?? prev.defaultLogisticsFeeNgn,
            spoilageRiskThresholdHours: p.spoilageRiskThresholdHours ?? prev.spoilageRiskThresholdHours,
            maintenanceMode: p.maintenanceMode ?? prev.maintenanceMode,
            supportEmail: p.supportEmail || prev.supportEmail,
            supportPhone: p.supportPhone || prev.supportPhone,
          }));
        }

        const res = hubRes.status === "fulfilled" ? hubRes.value : null;
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

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setPlatformSettings((prev) => ({ ...prev, [name]: checked }));
    } else {
      setPlatformSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (activeTab === "platform") {
        // Target: PUT /api/v1/admin/settings (UpdateAdminSettingsRequest)
        const payload: UpdateAdminSettingsRequest = {
          escrowFeePercent: Number(platformSettings.escrowFeePercent) || 0,
          logisticsPerKmRate: Number(platformSettings.logisticsPerKmRate) || 0,
          cassavaPricePerTonFloor: Number(platformSettings.cassavaPricePerTonFloor) || 0,
          payoutAutomationEnabled: Boolean(platformSettings.payoutAutomationEnabled),
          platformCommissionPercent: Number(platformSettings.platformCommissionPercent) || 0,
          defaultLogisticsFeeNgn: Number(platformSettings.defaultLogisticsFeeNgn) || 0,
          spoilageRiskThresholdHours: Number(platformSettings.spoilageRiskThresholdHours) || 24,
          maintenanceMode: Boolean(platformSettings.maintenanceMode),
          supportEmail: platformSettings.supportEmail?.trim() || "support@yucachain.com.ng",
          supportPhone: platformSettings.supportPhone?.trim() || "+234 800 982 2242",
        };

        await AdminApiService.updateSettings(payload);
        setSavedSuccess(true);
        toast.success("Platform financial and operational policy settings saved successfully!");
      } else {
        const payload = {
          businessName: settings.businessName || "YucaChain",
          hubName: settings.hubName,
          hubId: settings.hubId,
          licenseNumber: settings.licenseNumber,
          hubState: settings.hubState,
          hubLga: settings.hubLga,
          contactName: settings.contactName,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          maxCapacityTonnes: Number(settings.maxCapacityTonnes) || 0,
          maxTonnesCapacity: Number(settings.maxCapacityTonnes) || 0,
          spoilageRiskThresholdHours: Number(settings.spoilageRiskThresholdHours) || 0,
          bankName: settings.bankName,
          accountNumber: settings.accountNumber,
          accountName: settings.accountName,
          settlementFrequency: settings.settlementFrequency || "Daily",
          spoilageAlertsEmail: Boolean(settings.spoilageAlertsEmail),
          orderAlertsSms: Boolean(settings.orderAlertsSms),
          twoFactorEnabled: Boolean(settings.twoFactorEnabled),
        };

        await adminService.updateSettings(payload);
        setSavedSuccess(true);
        toast.success("Facility and operator settings saved successfully!");
      }
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error("Failed to update settings on server:", err);
      toast.error(err?.message || "Failed to update settings on server. Please try again.");
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
          onClick={() => setActiveTab("platform")}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "platform"
              ? "bg-[#226049] text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <Sliders size={16} /> Platform Policies &amp; Rates
        </button>

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

        {activeTab === "platform" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">
                Platform Operations &amp; Monetary Policies
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage global rates, floor prices, automated disbursement toggles, and emergency maintenance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Escrow Fee (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="escrowFeePercent"
                  value={platformSettings.escrowFeePercent ?? ""}
                  onChange={handlePlatformChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  placeholder="e.g. 1.5"
                />
                <p className="text-[11px] text-gray-400 mt-1">Escrow fee percentage charged on escrow payments.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="platformCommissionPercent"
                  value={platformSettings.platformCommissionPercent ?? ""}
                  onChange={handlePlatformChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  placeholder="e.g. 2.5"
                />
                <p className="text-[11px] text-gray-400 mt-1">Global platform cut on completed transactions.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Logistics Rate Per KM (₦)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="logisticsPerKmRate"
                  value={platformSettings.logisticsPerKmRate ?? ""}
                  onChange={handlePlatformChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  placeholder="e.g. 150"
                />
                <p className="text-[11px] text-gray-400 mt-1">Distance billing multiplier for dispatch transports.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Default Base Logistics Fee (₦)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="defaultLogisticsFeeNgn"
                  value={platformSettings.defaultLogisticsFeeNgn ?? ""}
                  onChange={handlePlatformChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  placeholder="e.g. 5000"
                />
                <p className="text-[11px] text-gray-400 mt-1">Base freight handling fee applied to each order.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Cassava Price Floor Per Ton (₦)
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  name="cassavaPricePerTonFloor"
                  value={platformSettings.cassavaPricePerTonFloor ?? ""}
                  onChange={handlePlatformChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  placeholder="e.g. 85000"
                />
                <p className="text-[11px] text-gray-400 mt-1">Guaranteed minimum price threshold protecting farmers.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Spoilage Risk Threshold (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  name="spoilageRiskThresholdHours"
                  value={platformSettings.spoilageRiskThresholdHours ?? ""}
                  onChange={handlePlatformChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  placeholder="e.g. 72"
                />
                <p className="text-[11px] text-gray-400 mt-1">Hours before fresh tubers trigger urgency warnings.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Support Email
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  value={platformSettings.supportEmail ?? ""}
                  onChange={handlePlatformChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  placeholder="support@yucachain.com.ng"
                />
                <p className="text-[11px] text-gray-400 mt-1">Official escalation address displayed to users.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Support Phone
                </label>
                <input
                  type="tel"
                  name="supportPhone"
                  value={platformSettings.supportPhone ?? ""}
                  onChange={handlePlatformChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-700"
                  placeholder="+234 800 982 2242"
                />
                <p className="text-[11px] text-gray-400 mt-1">Official platform helpline for logistics dispatchers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="payoutAutomationEnabled"
                  checked={Boolean(platformSettings.payoutAutomationEnabled)}
                  onChange={handlePlatformChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#226049] focus:ring-emerald-700 cursor-pointer"
                />
                <div>
                  <span className="block text-xs font-bold text-gray-900">
                    Automated Seller Payouts
                  </span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">
                    Automatically trigger disbursement when dispatch is marked Delivered.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50/40 cursor-pointer hover:bg-red-50/70 transition-colors">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={Boolean(platformSettings.maintenanceMode)}
                  onChange={handlePlatformChange}
                  className="mt-0.5 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div>
                  <span className="block text-xs font-bold text-red-900">
                    Platform Maintenance Mode
                  </span>
                  <span className="block text-[11px] text-red-700 mt-0.5">
                    Pause order placements and new listings during scheduled system upgrades.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

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
