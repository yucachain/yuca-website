import React from "react";
import type { MarketOrderTab } from "./types";

const TAB_LABELS: Record<MarketOrderTab, string> = {
  all: "All",
  pending: "Pending",
  assigned: "Assigned",
  "in-transit": "In Transit",
  fulfilled: "Fulfilled",
};

export interface MarketOrderFilterTabsProps {
  counts: Record<MarketOrderTab, number>;
  activeTab: MarketOrderTab;
  onChange: (tab: MarketOrderTab) => void;
  orderStatuses?: any[];
}

export default function MarketOrderFilterTabs({
  counts,
  activeTab,
  onChange,
  orderStatuses,
}: MarketOrderFilterTabsProps) {
  const tabs: MarketOrderTab[] = [
    "all",
    "pending",
    "assigned",
    "in-transit",
    "fulfilled",
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={[
              "rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
              isActive
                ? "bg-[#215243] text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            {TAB_LABELS[tab]} ({counts[tab]})
          </button>
        );
      })}
    </div>
  );
}
