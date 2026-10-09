"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminNavbar from "@/app/admin/components/AdminNavbar";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import AdminOverviewSection from "@/app/admin/components/AdminOverviewSection";
import OrdersPayoutsReportsSection from "@/app/admin/components/OrdersPayoutsReportsSection";
import DispatchOrderSection from "@/app/admin/components/DispatchOrderSection";
import MarketOrdersSection from "@/app/admin/components/MarketOrdersSection";
import SettingsSection from "@/app/admin/components/SettingsSection";
import AdminUserManagementSection from "@/app/admin/components/AdminUserManagementSection";
import { AdminApiService } from "@/app/Services/admin";
import type { AdminOverviewStats } from "@/app/types/admin/admin";

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setError(null);
        const data = await AdminApiService.getOverviewStats();
        setStats(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load dashboard statistics";
        if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
          setError("Your admin session is missing or has expired. Please sign in to the Admin Console.");
        } else {
          setError(msg);
        }
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="flex h-screen flex-col font-sans bg-[#f9f9f9] overflow-hidden">
      <AdminNavbar
        onToggleMobileSidebar={() => setShowMobileSidebar((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sticky Fixed Sidebar */}
        <div className="hidden lg:block h-full shrink-0">
          <AdminSidebar
            activeItemId={activeSection}
            onItemChange={setActiveSection}
          />
        </div>

        {/* Mobile & Tablet Sidebar Drawer */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="relative z-10 w-full max-w-[280px] bg-white h-full shadow-2xl">
              <AdminSidebar
                activeItemId={activeSection}
                onItemChange={setActiveSection}
                onCloseMobileDrawer={() => setShowMobileSidebar(false)}
              />
            </div>
          </div>
        )}

        {/* Scrollable Tab Content Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-w-0">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in"
            >
              <div>
                <p className="font-bold text-red-900">Admin Console Notice</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
              <Link
                href="/admin-login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#226049] text-white font-bold text-xs hover:bg-[#1a4336] transition-colors shrink-0 w-fit shadow-xs"
              >
                Sign In to Admin Console
              </Link>
            </div>
          )}

          {activeSection === "overview" && (
            <AdminOverviewSection
              stats={stats}
              onNavigateToOrders={() => setActiveSection("orders-payouts")}
            />
          )}

          {activeSection === "user-management" && <AdminUserManagementSection />}
          {(activeSection === "orders-payouts" ||
            activeSection === "sellers-payouts" ||
            activeSection === "transactions") && <OrdersPayoutsReportsSection />}
          {activeSection === "dispatch-order" && <DispatchOrderSection />}
          {activeSection === "market-orders" && <MarketOrdersSection />}
          {activeSection === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}
