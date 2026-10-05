"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  ShoppingBag,
  CreditCard,
  Settings,
  Users,
  HelpCircle,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useMarketplaceRole } from "../context/MarketplaceRoleContext";
import FilterPanel, { MarketplaceFilters, WeightRange } from "./FilterPanel";

export interface MarketplaceCategory {
  id: string;
  label: string;
  description: string;
  dotColor: string;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: "raw-cassava",
    label: "Raw Cassava Batches",
    description: "Fresh cassava in batches",
    dotColor: "bg-[#226049]",
  },
  {
    id: "inputs-seeds",
    label: "Inputs & Seeds",
    description: "Seeds, fertilizers & chemicals",
    dotColor: "bg-amber-500",
  },
  {
    id: "machinery-lease",
    label: "Machinery Lease",
    description: "Tractors, peelers & tools",
    dotColor: "bg-amber-600",
  },
  {
    id: "process-products",
    label: "Process Products",
    description: "Flour, starch, garri & chips",
    dotColor: "bg-emerald-600",
  },
];

export interface MarketplaceSidebarProps {
  activeCategoryId?: string;
  onCategoryChange?: (id: string) => void;
  weightRange?: WeightRange;
  onApplyFilters?: (filters: MarketplaceFilters) => void;
  onCloseMobileDrawer?: () => void;
  onOpenOrdersModal?: () => void;
  onOpenSettingsModal?: () => void;
}

export default function MarketplaceSidebar({
  activeCategoryId = "raw-cassava",
  onCategoryChange,
  weightRange = { min: 1, max: 500 },
  onApplyFilters,
  onCloseMobileDrawer,
  onOpenOrdersModal,
  onOpenSettingsModal,
}: MarketplaceSidebarProps) {
  const { currentUser, activeRole } = useMarketplaceRole();
  const [activeNav, setActiveNav] = useState("product");
  const [showFilters, setShowFilters] = useState(false);

  const handleCategorySelect = (id: string) => {
    onCategoryChange?.(id);
    onCloseMobileDrawer?.();
  };

  return (
    <aside className="w-[260px] h-full shrink-0 border-r border-gray-150/80 bg-white px-4 py-5 flex flex-col justify-between overflow-y-auto no-scrollbar font-sans">
      <div className="space-y-5">
        {/* User Mini Profile Header from inspiration */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#226049]/10 text-xs font-bold text-[#226049] overflow-hidden border border-[#226049]/20">
              {currentUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                currentUser.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-gray-900 truncate">
                {currentUser.name}
              </h3>
              <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          <span className="shrink-0 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
            PRO
          </span>

          {onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-700 ml-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Section 1: Main Navigation Links */}
        <div>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setActiveNav("dashboard");
                onCategoryChange?.("raw-cassava");
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeNav === "dashboard"
                  ? "bg-gray-50 text-gray-900 font-bold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <LayoutDashboard size={15} className="text-gray-400" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNav("analytics");
                onOpenOrdersModal?.();
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeNav === "analytics"
                  ? "bg-gray-50 text-gray-900 font-bold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <TrendingUp size={15} className="text-gray-400" />
              <span>Analytics</span>
            </button>

            {/* Active Product Tab from Inspiration */}
            <button
              type="button"
              onClick={() => setActiveNav("product")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                activeNav === "product"
                  ? "bg-emerald-50 text-[#226049] font-bold border-l-4 border-[#226049] shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package size={15} className={activeNav === "product" ? "text-[#226049]" : "text-gray-400"} />
                <span>Product</span>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            </button>

            <button
              type="button"
              onClick={() => onOpenOrdersModal?.()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <ShoppingBag size={15} className="text-gray-400" />
              <span>Orders &amp; Sales</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenOrdersModal?.()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <CreditCard size={15} className="text-gray-400" />
              <span>Escrow Payouts</span>
            </button>
          </nav>
        </div>

        {/* Section 2: Product Categories (Colored Dots from inspiration) */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Categories
          </p>
          <div className="space-y-1">
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const isSelected = cat.id === activeCategoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50/70 text-[#226049] font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`h-2 w-2 rounded-xs shrink-0 ${cat.dotColor}`} />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {isSelected && (
                    <ChevronRight size={13} className="text-[#226049] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: General System */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            System
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onOpenSettingsModal?.()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Settings size={15} className="text-gray-400" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={15} className="text-amber-500" />
                <span>Filters &amp; Grades</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                {showFilters ? "Hide" : "Filter"}
              </span>
            </button>
          </div>
        </div>

        {/* Optional Collapsible Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50/60 p-3 rounded-2xl border border-gray-100">
            <FilterPanel
              weightRange={weightRange}
              onApplyFilters={(f) => {
                onApplyFilters?.(f);
                onCloseMobileDrawer?.();
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom Storage / Vault Capacity Widget from inspiration */}
      <div className="pt-4 border-t border-gray-100 mt-4">
        <div className="rounded-2xl border border-gray-150/70 bg-[#fafafa] p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <ShieldCheck size={14} className="text-[#226049]" />
              <span>Vault Storage</span>
            </div>
            <span className="rounded-md bg-amber-100 border border-amber-300 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">
              Upgrade
            </span>
          </div>

          {/* Striped progress bar in Green & Slight Gold from inspiration */}
          <div className="flex items-center gap-0.5 h-3 my-2">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className={`flex-1 h-full rounded-xs ${
                  i < 12
                    ? "bg-[#226049]"
                    : i < 15
                    ? "bg-amber-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <p className="text-[10px] text-gray-500 leading-tight">
            85% of regional vault capacity utilized.
          </p>
        </div>
      </div>
    </aside>
  );
}
