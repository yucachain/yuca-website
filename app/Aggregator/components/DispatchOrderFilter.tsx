import React from "react";

export type DispatchOrderTab = "all" | "pending" | "dispatched" | "in-transit";

const TAB_LABELS: Record<DispatchOrderTab, string> = {
  all: "All",
  pending: "Pending",
  dispatched: "Dispatched",
  "in-transit": "In Transit",
};

export interface DispatchOrderFilterTabsProps {
  counts: Record<DispatchOrderTab, number>;
  activeTab: DispatchOrderTab;
  onChange: (tab: DispatchOrderTab) => void;
}

export default function DispatchOrderFilterTabs({
  counts,
  activeTab,
  onChange,
}: DispatchOrderFilterTabsProps) {
  const tabs: DispatchOrderTab[] = ["all", "pending", "dispatched", "in-transit"];

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