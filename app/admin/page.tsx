"use client";

import React, { useEffect, useState } from "react";
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
        const data = await AdminApiService.getOverviewStats();
        setStats(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard statistics"
        );
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
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              Dashboard statistics could not be loaded: {error}
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
