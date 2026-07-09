// MarketplaceSidebar — left sidebar containing: "Marketplace" title + subtitle, CategoryList, FilterPanel
"use client";

import React, { useState } from "react";

function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20c8 0 14-6 14-14 0-1.1-.1-2-.1-2s-.9-.1-2-.1C7.9 3.9 2 9.9 2 17.9V20h2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M6 18c3-6 6-9 12-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SeedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TractorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7" cy="17" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 17V9h5l3 4h3.5a2 2 0 0 1 2 2v2M9 9V5h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M3 8.5 12 13l9-4.5M12 13v7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

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
    icon: <LeafIcon />,
  },
  {
    id: "inputs-seeds",
    label: "Inputs & Seeds",
    description: "Seeds, fertilizers, & chemicals",
    icon: <SeedIcon />,
  },
  {
    id: "machinery-lease",
    label: "Machinery Lease",
    description: "Tractor, equipment & tools",
    icon: <TractorIcon />,
  },
  {
    id: "process-products",
    label: "Process Products",
    description: "Flour, starch, gari & more...",
    icon: <BoxIcon />,
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
    active: "border-[1px] border-emerald-600 bg-emerald-50/80 text-emerald-800",
    inactive: "border-[1px] border-gray-300 text-gray-500 hover:border-emerald-600 hover:text-emerald-800",
  },
  B: {
    active: "border-[1px] border-amber-500 bg-amber-50/80 text-amber-700",
    inactive: "border-[1px] border-gray-300 text-gray-500 hover:border-amber-500 hover:text-amber-700",
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

  return (
    <aside className="w-full max-w-[280px] shrink-0 border-r border-gray-300 px-6 py-8">
      <h1 className="text-3xl font-bold pt-10 text-[#000000]">Marketplace</h1>
      <p className="mt-1 text-sm leading-relaxed text-[#000000]">
        Browse and search all the list for products available for purchase
      </p>

      <nav className="mt-8 space-y-2  bg-white">
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className={[
                "flex w-full items-start gap-3 rounded-lg border-l-4 px-3 py-3 text-left transition-colors ",
                isActive
                  ? "border-[#226049] bg-emerald-50/70"
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
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => toggleGrade("A")}
            className={[
              "rounded-full border w-169 h-43 px-3 py-1 text-sm font-medium transition-colors bg-[#ffffff]",
              selectedGrades.has("A") ? gradeStyles.A.active : gradeStyles.A.inactive,
            ].join(" ")}
          >
            A (Premium)
          </button>
          <button
            type="button"
            onClick={() => toggleGrade("B")}
            className={[
              "rounded-full border w-169 h-43 px-3 py-1 text-sm font-medium transition-colors bg-[#ffffff]",
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
          className="w-full cursor-pointer appearance-none"
          style={{ height: "2px", accentColor: "#215243" }}
          aria-label="Weight in tonnes"
        />
      
      </div>

      <button
        type="button"
        onClick={handleApply}
        className="mt-8 w-233 h-61 sm:w-48 justify-center rounded-xl bg-[#226049] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336]"
      >
        Apply Filters
      </button>
    </aside>
  );
}