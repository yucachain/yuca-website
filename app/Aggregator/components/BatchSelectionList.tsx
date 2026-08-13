"use client";

import React, { useMemo, useState } from "react";
import { Search, Flag } from "lucide-react";
import type { IntakeBatch } from "./types";

export interface BatchSelectionListProps {
  batches: IntakeBatch[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function BatchSelectionList({
  batches,
  selectedIds,
  onChange,
}: BatchSelectionListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter(
      (b) =>
        b.code.toLowerCase().includes(q) || b.status.toLowerCase().includes(q),
    );
  }, [batches, query]);

  const selectedSet = new Set(selectedIds);
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((b) => selectedSet.has(b.id));

  const toggleOne = (id: string) => {
    onChange(
      selectedSet.has(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filtered.map((b) => b.id));
      onChange(selectedIds.filter((id) => !filteredIds.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...filtered.map((b) => b.id)]);
      onChange(Array.from(merged));
    }
  };

  const selectedBatches = batches.filter((b) => selectedSet.has(b.id));
  const totalWeight = selectedBatches.reduce((sum, b) => sum + b.weightKg, 0);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h3 className="text-sm font-bold text-gray-900">Select Batches</h3>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5">
        <Search size={16} strokeWidth={1.8} className="text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Batches"
          className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((batch) => {
          const isSelected = selectedSet.has(batch.id);
          return (
            <button
              key={batch.id}
              type="button"
              onClick={() => toggleOne(batch.id)}
              className={[
                "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-emerald-700 bg-emerald-50/40"
                  : "border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              <span
                className={[
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
                  isSelected
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-gray-300 bg-white",
                ].join(" ")}
              >
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m5 12.5 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  {batch.code} . {batch.weightKg} kg . {batch.status}
                </span>
                <span className="block text-xs text-gray-500">
                  Harvest Date: {batch.harvestDate}
                </span>
                {batch.urgentNote && (
                  <span className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                    <Flag size={12} strokeWidth={2} />
                    {batch.urgentNote}
                  </span>
                )}
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            No batches match your search.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={toggleAll}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
      >
        <span
          className={[
            "flex h-4 w-4 items-center justify-center rounded border-2",
            allFilteredSelected
              ? "border-emerald-700 bg-emerald-700"
              : "border-gray-300",
          ].join(" ")}
        />
        select all batches
      </button>

      <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3">
        <p className="text-sm text-emerald-900">
          {selectedBatches.length} Batches Selected
        </p>
        <p className="text-sm font-bold text-emerald-900">{totalWeight} kg</p>
      </div>
    </div>
  );
}
