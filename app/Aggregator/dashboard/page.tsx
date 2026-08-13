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

  return (
    <div className="flex min-h-screen flex-col font-sans bg-[#f9f9f9]">
      <AggregatorNavbar />

      <div className="flex flex-1">
        <AggregatorSidebar
          activeItemId={activeSection}
          onItemChange={setActiveSection}
        />

        <main className="flex-1 px-8 py-8">
          {activeSection === "overview" && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Overview</h1>
                  <p className="mt-1 max-w-md text-sm text-gray-500">
                    Manage batch aggregation, storage, marketplace orders, and
                    dispatch operations.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                  <AlertTriangle size={16} strokeWidth={1.8} />3 Batches at
                  spoilage risk
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STATS.map((stat) => (
                  <StatCard key={stat.id} data={stat} />
                ))}
              </div>

              {/* Main content row: Active Batches (left) | Quick Actions + Recent Activity (right) */}
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
                {/* Left: Active Batches table — fills the full height of the row */}
                <div className="flex flex-col">
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
          

          
        </main>
      </div>

      <Footer />
    </div>
  );
}
