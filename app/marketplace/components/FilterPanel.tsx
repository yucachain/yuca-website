"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, RotateCcw, Check } from "lucide-react";

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
  currentFilters?: MarketplaceFilters;
  onApplyFilters?: (filters: MarketplaceFilters) => void;
}

export default function FilterPanel({
  weightRange = { min: 0, max: 500 },
  defaultGrades = ["A", "B"],
  currentFilters,
  onApplyFilters,
}: FilterPanelProps) {
  const [selectedGrades, setSelectedGrades] = useState<Set<QualityGrade>>(() => {
    return new Set(currentFilters?.grades && currentFilters.grades.length > 0 ? currentFilters.grades : defaultGrades);
  });
  const [weight, setWeight] = useState(currentFilters?.weight ?? weightRange.min);

  // Sync when currentFilters prop changes
  useEffect(() => {
    if (currentFilters) {
      if (currentFilters.grades && currentFilters.grades.length > 0) {
        setSelectedGrades(new Set(currentFilters.grades));
      } else {
        setSelectedGrades(new Set(["A", "B"]));
      }
      if (typeof currentFilters.weight === "number") {
        setWeight(currentFilters.weight);
      }
    }
  }, [currentFilters]);

  const toggleGrade = (grade: QualityGrade) => {
    setSelectedGrades((prev) => {
      const next = new Set(prev);
      if (next.has(grade)) {
        next.delete(grade);
      } else {
        next.add(grade);
      }
      // If none selected, default to all grades
      return next;
    });
  };

  const handleApply = () => {
    const gradesArray = Array.from(selectedGrades);
    onApplyFilters?.({
      grades: gradesArray.length === 0 ? ["A", "B"] : gradesArray,
      weight,
    });
  };

  const handleReset = () => {
    const fullGrades = new Set<QualityGrade>(["A", "B"]);
    setSelectedGrades(fullGrades);
    setWeight(0);
    onApplyFilters?.({ grades: ["A", "B"], weight: 0 });
  };

  const weightProgress =
    weightRange.max > weightRange.min
      ? ((weight - weightRange.min) / (weightRange.max - weightRange.min)) * 100
      : 0;

  return (
    <div className="space-y-6 pt-4 border-t border-gray-100">
      {/* Quality Grade */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Quality Grade
          </p>
          <span className="text-[10px] text-gray-400">YucaCertified</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Grade A */}
          <button
            type="button"
            onClick={() => toggleGrade("A")}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedGrades.has("A")
                ? "bg-emerald-50 text-[#226049] border-emerald-300 shadow-2xs font-bold"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>Grade A (Premium)</span>
            {selectedGrades.has("A") && <Check size={13} strokeWidth={2.5} />}
          </button>

          {/* Grade B */}
          <button
            type="button"
            onClick={() => toggleGrade("B")}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedGrades.has("B")
                ? "bg-amber-50 text-amber-900 border-amber-300 shadow-2xs font-bold"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>Grade B (Standard)</span>
            {selectedGrades.has("B") && <Check size={13} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Min Quantity / Weight */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Min Batch Size
          </p>
          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-[#226049] border border-emerald-200/50">
            {weight === 0 ? "Any Volume" : `${weight} ${weight === 1 ? "Tonne" : "Tonnes"}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-medium">
          <span>{weightRange.min} T</span>
          <span>{weightRange.max} T</span>
        </div>

        <input
          type="range"
          min={weightRange.min}
          max={weightRange.max}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#226049]"
          aria-label="Min Batch Volume"
        />
      </div>

      {/* Filter Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#226049] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1a4336] transition-colors shadow-xs cursor-pointer active:scale-98"
        >
          <SlidersHorizontal size={13} />
          <span>Apply Filters</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
          title="Reset filters"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}