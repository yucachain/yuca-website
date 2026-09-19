"use client";

import React, { useState } from "react";
import {
  ArrowDownToLine,
  Database,
  AlertTriangle,
  ClipboardList,
  ShoppingCart,
  HandCoins,
} from "lucide-react";
import AggregatorNavbar from "@/app/Aggregator/components/AggregatorNavbar";
import AggregatorSidebar from "@/app/Aggregator/components/AggregatorSidebar";
import StatCard from "@/app/Aggregator/components/StatCard";
import QuickActions from "@/app/Aggregator/components/Quickactions";
import RecentActivity from "@/app/Aggregator/components/Recentactivity";
import ActiveBatchesTable from "@/app/Aggregator/components/Activebatchestable";
import ReceiveBatchSection from "@/app/Aggregator/components/ReceiveBatchSection";
import DispatchOrderSection from "@/app/Aggregator/components/DispatchOrderSection";
import MarketOrdersSection from "@/app/Aggregator/components/MarketOrdersSection";
import SellersPayoutsSection from "@/app/Aggregator/components/Sellerspayoutssection";
import TransactionsSection from "@/app/Aggregator/components/TransactionsSection";
import SettingsSection from "@/app/Aggregator/components/SettingsSection";

import Footer from "@/app/components/Footer";
import type {
  StatCardData,
  ActivityItem,
  BatchRow,
  QuickAction,
} from "@/app/Aggregator/components/types";

const STATS: StatCardData[] = [
  {
    id: "received",
    label: "Batches Received",
    value: "77",
    icon: <ArrowDownToLine size={18} strokeWidth={1.8} />,
    trendDirection: "up",
    trendPercent: 15,
    trendLabel: "Compared to last week",
  },
  {
    id: "in-storage",
    label: "In Storage",
    value: "123",
    icon: <Database size={18} strokeWidth={1.8} />,
    trendDirection: "down",
    trendPercent: 15,
    trendLabel: "Compared to last week",
  },
  {
    id: "awaiting-consolidation",
    label: "Awaiting Consolidation",
    value: "21",
    icon: <AlertTriangle size={18} strokeWidth={1.8} />,
    trendDirection: "down",
    trendPercent: 5,
    trendLabel: "Compared to lastweek",
  },
  {
    id: "inventory-value",
    label: "Inventory Value",
    value: "₦5,215,000",
    icon: <ClipboardList size={18} strokeWidth={1.8} />,
    trendDirection: "up",
    trendPercent: 12,
    trendLabel: "Compared to last week",
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "receive-batch",
    label: "Receive Batch",
    icon: <ArrowDownToLine size={15} strokeWidth={1.8} />,
  },
  {
    id: "assign-storage",
    label: "Assign Storage",
    icon: <Database size={15} strokeWidth={1.8} />,
  },
  {
    id: "market-orders",
    label: "Market Orders",
    icon: <ShoppingCart size={15} strokeWidth={1.8} />,
  },
  {
    id: "sellers-payouts",
    label: "Sellers / Payouts",
    icon: <HandCoins size={15} strokeWidth={1.8} />,
  },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    description: "Batch AGG-000234 received from Alaba Farms",
    time: "09:45 AM",
  },
  {
    id: "2",
    description: "Batch AGG-000221 assigned to YucaVault #1",
    time: "09:12 AM",
  },
  { id: "3", description: "Order MO-2026-011 dispatched", time: "08:50 AM" },
];

const ACTIVE_BATCHES: BatchRow[] = [
  {
    id: "1",
    batchCode: "YC-2026-00142",
    seller: "Musa Ibrahim",
    weightKg: 5000,
    status: "Assign Storage",
  },
  {
    id: "2",
    batchCode: "YC-2026-00134",
    seller: "Aloba Farms",
    weightKg: 2000,
    status: "In Storage",
  },
  {
    id: "3",
    batchCode: "YC-2026-00142",
    seller: "Kays & Sons",
    weightKg: 500,
    status: "Pending Transfer",
  },
  {
    id: "4",
    batchCode: "YC-2026-00142",
    seller: "Garba Farms",
    weightKg: 10000,
    status: "Assign Storage",
  },
  {
    id: "5",
    batchCode: "YC-2026-00142",
    seller: "Musa Ibrahim",
    weightKg: 5000,
    status: "In Storage",
  },
];

export default function AggregatorOverviewPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="flex min-h-screen flex-col font-sans bg-[#f9f9f9]">
      <AggregatorNavbar
        onToggleMobileSidebar={() => setShowMobileSidebar((prev) => !prev)}
      />

      <div className="flex flex-1 relative">
        {/* Desktop Sticky Sidebar */}
        <div className="hidden lg:block">
          <AggregatorSidebar
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
              <AggregatorSidebar
                activeItemId={activeSection}
                onItemChange={setActiveSection}
                onCloseMobileDrawer={() => setShowMobileSidebar(false)}
              />
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-w-0">
          {activeSection === "overview" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Overview</h1>
                  <p className="mt-1 max-w-md text-xs sm:text-sm text-gray-500">
                    Manage batch aggregation, storage, marketplace orders, and
                    dispatch operations.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STATS.map((stat) => (
                  <StatCard key={stat.id} data={stat} />
                ))}
              </div>

              {/* Main content row: Active Batches (left) | Quick Actions + Recent Activity (right) */}
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
                {/* Left: Active Batches table */}
                <div className="flex flex-col overflow-x-auto touch-scroll">
                  <ActiveBatchesTable batches={ACTIVE_BATCHES} />
                </div>

                {/* Right: Quick Actions stacked above Recent Activity */}
                <div className="flex flex-col gap-4">
                  <QuickActions
                    actions={QUICK_ACTIONS}
                    onSelect={(action) => setActiveSection(action.id)}
                  />
                  <RecentActivity items={RECENT_ACTIVITY} />
                </div>
              </div>
            </>
          )}

          {activeSection === "receive-batch" && <ReceiveBatchSection />}
          {activeSection === "dispatch-order" && <DispatchOrderSection />}
          {activeSection === "market-orders" && <MarketOrdersSection />}
          {activeSection === "sellers-payouts" && <SellersPayoutsSection />}
          {activeSection === "transactions" && <TransactionsSection />}
          {activeSection === "settings" && <SettingsSection />}
        </main>
      </div>

      <Footer />
    </div>
  );
}
