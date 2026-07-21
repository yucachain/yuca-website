
"use client";

import Button from "@/app/components/ui/Button";
import { useState } from "react";

export type QualityGrade = "A" | "B";

export interface WeightRange {
  min: number;
  max: number;
}

export interface MarketplaceFilters {
  grades: QualityGrade[];
  weight: number;
}

export interface FilterPanelProps {
  weightRange?: WeightRange;
  defaultGrades?: QualityGrade[];
  onApplyFilters?: (filters: MarketplaceFilters) => void;
}

const gradeStyles: Record<QualityGrade, { active: string; inactive: string }> = {
  A: {
    active: "border-emerald-700 bg-white text-emerald-800",
    inactive: "border-gray-300 bg-white text-gray-500 hover:border-emerald-700 hover:text-emerald-800",
  },
  B: {
    active: "border-amber-500 bg-white text-amber-700",
    inactive: "border-gray-300 bg-white text-gray-500 hover:border-amber-500 hover:text-amber-700",
  },
};

export default function FilterPanel({
  weightRange = { min: 1, max: 500 },
  defaultGrades = ["A", "B"],
  onApplyFilters,
}: FilterPanelProps) {
  const [selectedGrades, setSelectedGrades] = useState<Set<QualityGrade>>(
    new Set(defaultGrades)
  );
  const [weight, setWeight] = useState(weightRange.min);

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
    <div>
      <div className="border-t border-gray-100 pt-6">
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
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span>{weightRange.min} Tonnes</span>
          <span className="text-sm font-semibold text-emerald-700">{weight} Tonnes</span>
          <span>{weightRange.max} Tonnes</span>
        </div>
        <input
          type="range"
          min={weightRange.min}
          max={weightRange.max}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          onInput={(e) => setWeight(Number((e.target as HTMLInputElement).value))}
          className="w-full h-px appearance-none green-range"
          style={{
            background: `linear-gradient(90deg, #215243 ${weightProgress}%, #d1d5db ${weightProgress}%)`,
          }}
          aria-label="Weight in tonnes"
        />
      </div>

      <Button
        type="button"
        fullWidth={false}
        className="w-40 sm:w-48 mt-3"
        onClick={handleApply}
      >
        Apply Filters
      </Button>
    </div>
  );
}