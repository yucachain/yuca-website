"use client";

import React, { useState } from "react";
import { Leaf, Sprout, Tractor, Package } from "lucide-react";
import FilterPanel from "./FilterPanel";

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
    icon: <Leaf size={18} strokeWidth={1.6} />,
  },
  {
    id: "inputs-seeds",
    label: "Inputs & Seeds",
    description: "Seeds, fertilizers, & chemicals",
    icon: <Sprout size={18} strokeWidth={1.6} />,
  },
  {
    id: "machinery-lease",
    label: "Machinery Lease",
    description: "Tractor, equipment & tools",
    icon: <Tractor size={18} strokeWidth={1.6} />,
  },
  {
    id: "process-products",
    label: "Process Products",
    description: "Flour, starch, garri & more...",
    icon: <Package size={18} strokeWidth={1.6} />,
  },
];

export type QualityGrade = "A" | "B";

export interface WeightRange {
  min: number;
  max: number;
}

export interface MarketplaceFilters {
  grades: QualityGrade[];
  weight: number;
}

export interface MarketplaceSidebarProps {
  categories?: MarketplaceCategory[];
  activeCategoryId?: string;
  onCategoryChange?: (id: string) => void;
  weightRange?: WeightRange;
  onApplyFilters?: (filters: MarketplaceFilters) => void;
}

const gradeStyles: Record<QualityGrade, { active: string; inactive: string }> = {
  A: {
    active: "border-emerald-700 bg-emerald-50 text-emerald-800",
    inactive: "border-gray-300 text-gray-500 hover:border-emerald-700 hover:text-emerald-800",
  },
  B: {
    active: "border-amber-500 bg-amber-50 text-amber-700",
    inactive: "border-gray-300 text-gray-500 hover:border-amber-500 hover:text-amber-700",
  },
};

export default function MarketplaceSidebar({
  categories = DEFAULT_CATEGORIES,
  activeCategoryId = DEFAULT_CATEGORIES[0].id,
  onCategoryChange,
  weightRange = { min: 1, max: 500 },
  onApplyFilters,
}: MarketplaceSidebarProps) {
  const [activeId, setActiveId] = useState(activeCategoryId);
  const [selectedGrades, setSelectedGrades] = useState<Set<QualityGrade>>(new Set(["A", "B"]));
  const [weight, setWeight] = useState(weightRange.min);

  const handleCategoryClick = (id: string) => {
    setActiveId(id);
    onCategoryChange?.(id);
  };

  const toggleGrade = (grade: QualityGrade) => {
    setSelectedGrades((prev) => {
      const next = new Set(prev);
      if (next.has(grade)) {
        next.delete(grade);
      } else {
        next.add(grade);
      }
      return next;
    });
  };

  const handleApply = () => {
    onApplyFilters?.({ grades: Array.from(selectedGrades), weight });
  };

  const weightProgress =
    weightRange.max > weightRange.min
      ? ((weight - weightRange.min) / (weightRange.max - weightRange.min)) * 100
      : 0;

  return (
    <aside className="w-full max-w-[260px] shrink-0 border-r border-gray-100 bg-white px-5 py-5 overflow-y-auto no-scrollbar sticky top-0 h-screen">
      <h1 className="text-xl font-bold pt-2 text-[#000000]">Marketplace</h1>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        Browse and search all the list for products available for purchase
      </p>

      <nav className="mt-6 space-y-1">
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className={[
                "flex w-full items-start gap-2.5 rounded-lg border-l-4 px-3 py-2 text-left transition-colors",
                isActive
                  ? "border-emerald-800 bg-emerald-50/70"
                  : "border-transparent hover:bg-gray-50",
              ].join(" ")}
            >
              <span className={isActive ? "text-emerald-800 shrink-0 mt-0.5" : "text-gray-500 shrink-0 mt-0.5"}>
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
                <span className="block text-[11px] text-gray-500 leading-tight mt-0.5">{category.description}</span>
              </span>
            </button>
          );
        })}
      </nav>

         <div className="mt-6">
        <FilterPanel weightRange={weightRange} onApplyFilters={onApplyFilters} />
      </div>
    </aside>
  );
}

