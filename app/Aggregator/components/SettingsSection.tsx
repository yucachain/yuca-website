"use client";

import React, { useState } from "react";
import {
  Building2,
  Database,
  CreditCard,
  Bell,
  Shield,
  Check,
  Save,
  Lock,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import type { AggregatorSettings } from "./types";

const INITIAL_SETTINGS: AggregatorSettings = {
  hubName: "YucaVault #1 Ilorin Hub",
  hubId: "AGG-HUB-KWR-001",
  licenseNumber: "YUC-AGGR-LIC-2026-994",
  contactName: "Penpal Aggregator Admin",
  email: "penpal@yucachain.com",
  phone: "+234 803 123 4567",
  address: "Plot 14 Agro-Industrial Estate, Offa Road, Ilorin, Kwara State",
  maxCapacityTonnes: 1500,
  spoilageRiskThresholdHours: 24,
  bankName: "Zenith Bank Plc",
  accountNumber: "1012345678",
  accountName: "Penpal Yuca Hub Ltd",
  settlementFrequency: "Daily",
  spoilageAlertsEmail: true,
  orderAlertsSms: true,
  twoFactorEnabled: true,
};

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState<"profile" | "capacity" | "payout" | "notifications" | "security">("profile");
  const [settings, setSettings] = useState<AggregatorSettings>(INITIAL_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Aggregator Hub Settings</h1>
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

      {/* Tabs Bar */}
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
          <CreditCard size={16} /> Payout Details
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Profile */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Facility &amp; Operator Profile
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Hub / Facility Name</label>
                <input
                  type="text"
                  name="hubName"
                  value={settings.hubName}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Operating License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={settings.licenseNumber}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-700 outline-none"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Contact Admin Person</label>
                <input
                  type="text"
                  name="contactName"
                  value={settings.contactName}
                  onChange={handleChange}
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
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Hub ID Code</label>
                <input
                  type="text"
                  name="hubId"
                  value={settings.hubId}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-700 outline-none"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Physical Address</label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-700"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Capacity */}
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

        {/* Tab 4: Notifications */}
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

        {/* Save Button Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#226049] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1a4b39] transition-all cursor-pointer shadow-sm"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
