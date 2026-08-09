import React from "react";
import type { SellerCategory } from "./types";

export type SellerCategoryTab = "all" | SellerCategory;

const TAB_LABELS: Record<SellerCategoryTab, string> = {
  all: "All",
  farmer: "Farmers",
  "buyer-processor": "Buyers / Processors",
  "service-provider": "Service Providers",
};

export interface SellerCategoryTabsProps {
  activeTab: SellerCategoryTab;
  onChange: (tab: SellerCategoryTab) => void;
}

export default function SellerCategoryTabs({ activeTab, onChange }: SellerCategoryTabsProps) {
  const tabs: SellerCategoryTab[] = ["all", "farmer", "buyer-processor", "service-provider"];

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
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}