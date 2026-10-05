"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  ChevronDown,
  RefreshCw,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  CreditCard,
} from "lucide-react";
import {
  useMarketplaceRole,
  MarketOrderItem,
} from "@/app/marketplace/context/MarketplaceRoleContext";

export interface AdminOverviewSectionProps {
  onNavigateToOrders: () => void;
}

export default function AdminOverviewSection({
  onNavigateToOrders,
}: AdminOverviewSectionProps) {
  const { allTransactions, allUsers } = useMarketplaceRole();

  // Date Range state
  const [dateRange, setDateRange] = useState("April 10, 2026 - May 11, 2026");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chart 1 (Weekly Revenue Analytics) state
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"This Week" | "Last Week">("This Week");
  const [activeDayIndex, setActiveDayIndex] = useState<number>(2); // Default Sunday (highlighted in image)

  // Chart 2 (Monthly Income) state
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Table filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "total" | "status">("date");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Calculations for top KPI cards
  const kpiData = useMemo(() => {
    const totalGMV = allTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const paidList = allTransactions.filter(
      (t) => t.payoutStatus === "Paid / Disbursed"
    );
    const pendingList = allTransactions.filter(
      (t) => t.payoutStatus !== "Paid / Disbursed"
    );

    const paidTotal = paidList.reduce((acc, t) => acc + t.totalAmount, 0);

    return {
      totalSales: allTransactions.length > 0 ? (2500 + allTransactions.length * 15) : 2500,
      newCustomers: allUsers.length > 0 ? (110 + allUsers.length) : 110,
      returnProducts: pendingList.length > 0 ? (72 + pendingList.length) : 72,
      totalRevenue: totalGMV > 0 ? totalGMV : 8220640,
      paidTotal,
    };
  }, [allTransactions, allUsers]);

  // Weekly Revenue Analytics Bar Chart Data (matches image layout: Fri, Sat, Sun, Mon, Thu, Wen, Thus)
  const weeklyData = useMemo(() => {
    if (analyticsPeriod === "This Week") {
      return [
        { day: "Fri", value: 16500, heightPercent: 55 },
        { day: "Sat", value: 13200, heightPercent: 44 },
        { day: "Sun", value: 22430, heightPercent: 75, highlighted: true },
        { day: "Mon", value: 14000, heightPercent: 47 },
        { day: "Thu", value: 15600, heightPercent: 52 },
        { day: "Wen", value: 23100, heightPercent: 77 },
        { day: "Thus", value: 16800, heightPercent: 56 },
      ];
    } else {
      return [
        { day: "Fri", value: 14200, heightPercent: 48 },
        { day: "Sat", value: 18500, heightPercent: 62 },
        { day: "Sun", value: 19800, heightPercent: 66, highlighted: true },
        { day: "Mon", value: 11200, heightPercent: 38 },
        { day: "Thu", value: 13900, heightPercent: 46 },
        { day: "Wen", value: 20400, heightPercent: 68 },
        { day: "Thus", value: 15100, heightPercent: 50 },
      ];
    }
  }, [analyticsPeriod]);

  // Monthly Total Income Stacked Chart Data (Jan - Aug)
  const monthlyIncomeData = [
    { month: "Jan", profit: 24, loss: 22 },
    { month: "Feb", profit: 28, loss: 16 },
    { month: "Mar", profit: 32, loss: 15 },
    { month: "Apr", profit: 26, loss: 18 },
    { month: "May", profit: 30, loss: 16 },
    { month: "Jun", profit: 35, loss: 25 },
    { month: "Jul", profit: 28, loss: 18 },
    { month: "Aug", profit: 25, loss: 16 },
  ];

  // Formatted orders table
  const formattedOrders = useMemo(() => {
    // Merge real transactions with sample structured data matching the clean layout
    const baseList = allTransactions.length > 0
      ? allTransactions.map((tx, idx) => ({
          id: tx.id,
          orderId: `#${tx.orderNumber.replace(/[^0-9]/g, "") || String(878909 + idx)}`,
          date: tx.date || `${(idx % 28) + 1} Dec 2026`,
          customer: tx.buyerName || "Oliver John Brown",
          category: tx.productTitle || "Cassava Roots, Flour",
          status: tx.payoutStatus === "Paid / Disbursed" ? ("Completed" as const) : ("Pending" as const),
          items: `${tx.quantity || 2} Items`,
          total: tx.totalAmount ? `₦${tx.totalAmount.toLocaleString()}` : "₦789.00",
          rawTotal: tx.totalAmount || 789,
        }))
      : [
          {
            id: "sample-1",
            orderId: "#878909",
            date: "2 Dec 2026",
            customer: "Oliver John Brown",
            category: "Shoes, Shirt",
            status: "Pending" as const,
            items: "2 Items",
            total: "₦789.00",
            rawTotal: 789,
          },
          {
            id: "sample-2",
            orderId: "#878909",
            date: "1 Dec 2026",
            customer: "Noah James Smith",
            category: "Sneakers, T-shirt",
            status: "Completed" as const,
            items: "3 Items",
            total: "₦967.00",
            rawTotal: 967,
          },
          {
            id: "sample-3",
            orderId: "#878910",
            date: "30 Nov 2026",
            customer: "Amara Okonkwo",
            category: "Cassava Tubers, Garri",
            status: "Completed" as const,
            items: "4 Items",
            total: "₦1,240.00",
            rawTotal: 1240,
          },
          {
            id: "sample-4",
            orderId: "#878911",
            date: "28 Nov 2026",
            customer: "Tunde Bakare",
            category: "Stems, High-Yield Starch",
            status: "Pending" as const,
            items: "1 Item",
            total: "₦450.00",
            rawTotal: 450,
          },
          {
            id: "sample-5",
            orderId: "#878912",
            date: "27 Nov 2026",
            customer: "Fatima Al-Hassan",
            category: "Processed Cassava Flour",
            status: "Completed" as const,
            items: "5 Items",
            total: "₦2,100.00",
            rawTotal: 2100,
          },
        ];

    // Filter
    const q = searchQuery.toLowerCase().trim();
    let result = baseList.filter((ord) => {
      if (!q) return true;
      return (
        ord.orderId.toLowerCase().includes(q) ||
        ord.customer.toLowerCase().includes(q) ||
        ord.category.toLowerCase().includes(q) ||
        ord.status.toLowerCase().includes(q)
      );
    });

    // Sort
    if (sortBy === "total") {
      result.sort((a, b) => b.rawTotal - a.rawTotal);
    } else if (sortBy === "status") {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [allTransactions, searchQuery, sortBy]);

  const toggleSelectAll = () => {
    if (selectedOrders.length === formattedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(formattedOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Row (matches "Sales Overview" with Date Picker) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Sales Overview
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time commercial performance, user growth, and order settlements
          </p>
        </div>

        {/* Date Range Picker Pill & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Calendar size={14} className="text-gray-500" />
              <span>{dateRange}</span>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-1.5 w-60 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl z-30 animate-in fade-in">
                {[
                  "April 10, 2026 - May 11, 2026",
                  "March 10, 2026 - April 09, 2026",
                  "Last 30 Days",
                  "This Year (2026)",
                ].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setDateRange(range);
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      dateRange === range
                        ? "bg-[#226049] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-2xl border border-gray-200/90 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
            title="Refresh dashboard"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#226049]" : ""} />
          </button>
        </div>
      </div>

      {/* Top 3 KPI Metric Cards (Return Products removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Sales */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs sm:text-sm font-semibold text-gray-500">Total Sales</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
              <ShoppingCart size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {kpiData.totalSales.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-100">
              <ArrowUpRight size={11} strokeWidth={2.5} />
              <span>4.9%</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">Last month: 2345</p>
        </div>

        {/* Card 2: New Customer */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs sm:text-sm font-semibold text-gray-500">New Customer</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
              <Users size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {kpiData.newCustomers}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-100">
              <ArrowUpRight size={11} strokeWidth={2.5} />
              <span>7.5%</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">Last month: 89</p>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-xs sm:text-sm font-semibold text-gray-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
              <DollarSign size={14} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              ${(kpiData.totalRevenue / 1000).toFixed(2)}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-100">
              <ArrowUpRight size={11} strokeWidth={2.5} />
              <span>12.4%</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">Last month: $620.00</p>
        </div>
      </div>

      {/* Middle Row: Two Charts Side-by-Side (matches image: Revenue analytics & Total Income) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Chart: Revenue analytics (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Revenue analytics
            </h2>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setAnalyticsPeriod((prev) =>
                    prev === "This Week" ? "Last Week" : "This Week"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <span>{analyticsPeriod}</span>
                <ChevronDown size={13} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Bar Chart Area */}
          <div className="relative h-60 w-full pt-8 pb-2">
            {/* Horizontal Gridlines & Y-Axis */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] text-gray-400">
              {["30k", "25k", "20k", "15k", "10k", "5k", "0k"].map((tick) => (
                <div key={tick} className="flex items-center gap-3 w-full">
                  <span className="w-6 text-right shrink-0">{tick}</span>
                  <div className="flex-1 border-b border-dashed border-gray-100" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="relative h-full ml-10 flex items-end justify-between px-2 sm:px-4 z-10">
              {weeklyData.map((item, index) => {
                const isActive = activeDayIndex === index;
                return (
                  <div
                    key={item.day}
                    className="flex flex-col items-center flex-1 group cursor-pointer"
                    onClick={() => setActiveDayIndex(index)}
                  >
                    {/* Tooltip Bubble (green brand accent) */}
                    <div
                      className={`transition-all duration-200 mb-2 flex flex-col items-center ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100"
                      }`}
                    >
                      <span className="rounded-lg bg-[#226049] text-white text-[11px] font-bold px-2 py-0.5 shadow-sm whitespace-nowrap">
                        ${item.value.toLocaleString()}
                      </span>
                      <div className="w-1.5 h-1.5 bg-[#226049] rotate-45 -mt-0.5" />
                    </div>

                    {/* Bar Cylinder */}
                    <div className="relative w-8 sm:w-10 rounded-full overflow-hidden bg-gray-100 flex items-end">
                      <div
                        style={{ height: `${item.heightPercent}%` }}
                        className={`w-full rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-t from-[#226049] to-[#2e8565] shadow-sm"
                            : "bg-[#226049] opacity-80 group-hover:opacity-100"
                        }`}
                      >
                        {/* Dot indicator if active */}
                        {isActive && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white mx-auto mt-1 border-2 border-[#226049] shadow-xs" />
                        )}
                      </div>
                    </div>

                    {/* X-axis Day Label */}
                    <span
                      className={`text-xs font-semibold mt-3 transition-colors ${
                        isActive ? "text-gray-900 font-bold" : "text-gray-400 group-hover:text-gray-700"
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Chart: Total Income (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Total Income</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                View your income in a certain period of time
              </p>
            </div>

            {/* Legend (Profit & Loss) */}
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#226049]" />
                <span>Profit</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#18181b]" />
                <span>Loss</span>
              </span>
            </div>
          </div>

          {/* Monthly Income Dual-Bar Chart Area */}
          <div className="relative h-60 w-full pt-8 pb-2">
            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] text-gray-400">
              {["50k", "40k", "30k", "20k", "10k", "00"].map((tick) => (
                <div key={tick} className="flex items-center gap-2.5 w-full">
                  <span className="w-5 text-right shrink-0">{tick}</span>
                  <div className="flex-1 border-b border-gray-100" />
                </div>
              ))}
            </div>

            {/* Stacked Bars */}
            <div className="relative h-full ml-8 flex items-end justify-between px-1 sm:px-2 z-10">
              {monthlyIncomeData.map((item, idx) => {
                const totalHeight = Math.min(item.profit + item.loss, 58);
                const isHovered = hoveredMonth === idx;

                return (
                  <div
                    key={item.month}
                    className="flex flex-col items-center flex-1 group cursor-pointer"
                    onMouseEnter={() => setHoveredMonth(idx)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-7 rounded-lg bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 shadow-md z-20">
                        Profit: ${item.profit}k | Loss: ${item.loss}k
                      </div>
                    )}

                    {/* Stacked bar container */}
                    <div
                      style={{ height: `${totalHeight * 3.8}px` }}
                      className="w-5 sm:w-6 rounded-t-lg flex flex-col justify-end overflow-hidden transition-all duration-200 group-hover:scale-105"
                    >
                      <div
                        style={{
                          height: `${item.profit * 2.2}px`,
                          backgroundImage:
                            "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)",
                        }}
                        className="w-full bg-[#226049] rounded-t-md opacity-90 group-hover:opacity-100"
                      />
                      {/* Bottom Bar (Loss - dark charcoal) */}
                      <div
                        style={{ height: `${item.loss * 1.8}px` }}
                        className="w-full bg-[#18181b]"
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-[11px] font-semibold text-gray-400 mt-3 group-hover:text-gray-900 transition-colors">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders Table (matches image layout) */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent orders</h2>

          <div className="flex items-center gap-2.5">
            {/* Search Input Pill */}
            <div className="relative min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-9 pr-8 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#226049] focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort By Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setSortBy((prev) =>
                    prev === "date" ? "total" : prev === "total" ? "status" : "date"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer"
              >
                <SlidersHorizontal size={13} className="text-gray-400" />
                <span>Sort by: {sortBy}</span>
                <ChevronDown size={13} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-gray-400 font-semibold text-[11px] border-b border-gray-100">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === formattedOrders.length &&
                      formattedOrders.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-[#226049] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Order Id</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {formattedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400 text-xs">
                    No orders match your search query.
                  </td>
                </tr>
              ) : (
                formattedOrders.slice(0, 6).map((ord) => {
                  const isChecked = selectedOrders.includes(ord.id);
                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-gray-50/60 transition-colors text-xs text-gray-800"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOrder(ord.id)}
                          className="rounded border-gray-300 text-[#226049] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Order Id */}
                      <td className="py-3.5 px-3 font-semibold text-gray-900 font-mono">
                        {ord.orderId}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-gray-500 whitespace-nowrap">
                        {ord.date}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3 font-semibold text-gray-900">
                        {ord.customer}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-gray-600">
                        {ord.category}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            ord.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-500 border border-rose-100"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-3 text-gray-500">
                        {ord.items}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {ord.total}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-400">
            Showing {Math.min(formattedOrders.length, 6)} of {formattedOrders.length} orders
          </span>

          <button
            type="button"
            onClick={onNavigateToOrders}
            className="text-xs font-bold text-[#226049] hover:underline cursor-pointer"
          >
            View all orders in Financial Hub →
          </button>
        </div>
      </div>
    </div>
  );
}
