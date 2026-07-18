"use client";

import React from "react";
import { Leaf, Sprout, Tractor, Package } from "lucide-react";
import FilterPanel, { WeightRange, MarketplaceFilters, QualityGrade } from "./FilterPanel";

export interface MarketplaceCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const DEFAULT_CATEGORIES: MarketplaceCategory[] = [
  {
    id: "raw-cassava",
    label: "Raw Cassava Batches",
    description: "Fresh cassava in batches",
    icon: <Leaf size={22} strokeWidth={1.6} />,
  },
  {
    id: "inputs-seeds",
    label: "Inputs & Seeds",
    description: "Seeds, fertilizers, & chemicals",
    icon: <Sprout size={22} strokeWidth={1.6} />,
  },
  {
    id: "machinery-lease",
    label: "Machinery Lease",
    description: "Tractor, equipment & tools",
    icon: <Tractor size={22} strokeWidth={1.6} />,
  },
  {
    id: "process-products",
    label: "Process Products",
    description: "Flour, starch, gari & more...",
    icon: <Package size={22} strokeWidth={1.6} />,
  },
];

export interface MarketplaceSidebarProps {
  categories?: MarketplaceCategory[];
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  weightRange?: WeightRange;
  onApplyFilters?: (filters: MarketplaceFilters) => void;
}

export default function MarketplaceSidebar({
  categories = DEFAULT_CATEGORIES,
  activeCategoryId,
  onCategoryChange,
  weightRange,
  onApplyFilters,
}: MarketplaceSidebarProps) {
  return (
      <aside className="w-full max-w-[280px] shrink-0 border-r border-gray-200 px-6 py-8">
      <h1 className="text-3xl font-bold pt-10 text-[#000000]">Marketplace</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        Browse and search all the list for products available for purchase
      </p>

      <nav className="mt-8 space-y-1">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={[
                "flex w-full items-start gap-3 rounded-lg border-l-4 px-3 py-3 text-left transition-colors",
                isActive
                  ? "border-emerald-800 bg-emerald-50/70"
                  : "border-transparent hover:bg-gray-50",
              ].join(" ")}
            >
              <span className={isActive ? "text-emerald-800" : "text-gray-500"}>
                {category.icon}
              </span>
              <span>
                <span
                  className={[
                    "block text-sm font-semibold",
                    isActive ? "text-emerald-900" : "text-gray-900",
                  ].join(" ")}
                >
                  {category.label}
                </span>
                <span className="block text-xs text-gray-500">{category.description}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-10">
        <FilterPanel weightRange={weightRange} onApplyFilters={onApplyFilters} />
      </div>
    </aside>
  );
}

export type { QualityGrade, WeightRange, MarketplaceFilters };