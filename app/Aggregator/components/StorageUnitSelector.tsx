import React from "react";
import type { StorageUnit } from "./types";

export interface StorageUnitSelectorProps {
  units: StorageUnit[];
  selectedId: string;
  onChange: (id: string) => void;
  onAssign: () => void;
  assignDisabled?: boolean;
}

export default function StorageUnitSelector({
  units,
  selectedId,
  onChange,
  onAssign,
  assignDisabled = false,
}: StorageUnitSelectorProps) {
  const selectedUnit = units.find((u) => u.id === selectedId);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h3 className="text-sm font-bold text-gray-900">Select storage unit</h3>

      <div className="mt-4 space-y-4">
        {units.map((unit) => {
          const isSelected = unit.id === selectedId;
          const isOffline = unit.status === "offline";
          const fillPercent =
            unit.capacityKg > 0
              ? Math.min(100, (unit.usedKg / unit.capacityKg) * 100)
              : 0;

          return (
            <button
              key={unit.id}
              type="button"
              disabled={isOffline}
              onClick={() => onChange(unit.id)}
              className={[
                "w-full rounded-xl border px-5 py-4 text-left transition-colors",
                isOffline
                  ? "cursor-not-allowed border-gray-200 opacity-60"
                  : isSelected
                    ? "border-emerald-700 bg-emerald-50/40"
                    : "border-gray-200 hover:border-gray-300",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={[
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      isSelected ? "border-emerald-700" : "border-gray-300",
                    ].join(" ")}
                  >
                    {isSelected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {unit.name}{" "}
                      <span className="font-normal text-gray-500">
                        ({unit.facilityLabel})
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {unit.usedKg}/{unit.capacityKg} kg
                    </p>
                  </div>
                </div>

                <span
                  className={[
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                    isOffline
                      ? "bg-red-50 text-red-500"
                      : "bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  {isOffline ? "Offline" : "Active"}
                </span>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-800"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onAssign}
        disabled={assignDisabled || !selectedUnit}
        className="mt-6 w-full rounded-xl bg-[#215243] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        Assign to unit {selectedUnit?.name ?? ""}
      </button>
    </div>
  );
}
