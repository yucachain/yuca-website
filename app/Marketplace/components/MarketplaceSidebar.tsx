"use client";

import React, { useState } from "react";
import { Leaf, Sprout, Tractor, Package } from "lucide-react";
import Button from "@/app/components/ui/Button";

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
    <aside className="w-full max-w-[280px] shrink-0 border-r border-gray-100 bg-white px-6 py-8">
      <h1 className="text-3xl font-bold pt-10 text-[#000000]">Marketplace</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        Browse and search all the list for products available for purchase
      </p>

      <nav className="mt-20 space-y-1">
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
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

      <div className="mt-10  pt-6">
        <p className="mb-3 text-sm font-semibold text-gray-800">Quality Grade</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => toggleGrade("A")}
            className={[
              "rounded-full border px-2 py-2 text-sm font-medium transition-colors",
              selectedGrades.has("A") ? gradeStyles.A.active : gradeStyles.A.inactive,
            ].join(" ")}
          >
            A (Premium)
          </button>
          <button
            type="button"
            onClick={() => toggleGrade("B")}
            className={[
              "rounded-full border px-2 py-2 text-sm font-medium transition-colors",
              selectedGrades.has("B") ? gradeStyles.B.active : gradeStyles.B.inactive,
            ].join(" ")}
          >
            B (Standard)
          </button>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold text-gray-800">Weight</p>
         <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{weightRange.min} Tonnes</span>
          <span>{weightRange.max} Tonnes</span>
        </div>
        <input
          type="range"
          min={weightRange.min}
          max={weightRange.max}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full h-px appearance-none green-range"
          style={{
            background: `linear-gradient(90deg, #215243 ${weightProgress}%, #d1d5db ${weightProgress}%)`,
          }}
          aria-label="Weight in tonnes"
        />
      </div>

      <Button
        type="button"
        onClick={handleApply}
        fullWidth={false}
        className="w-10 mt-5 sm:w-48"
      >
        Apply Filters
      </Button>
    </aside>
  );
}