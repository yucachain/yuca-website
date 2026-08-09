"use client";

import React, { useState } from "react";
import BatchSelectionList from "./BatchSelectionList";
import StorageUnitSelector from "./StorageUnitSelector";
import type { IntakeBatch, StorageUnit } from "./types";

// Sample data standing in for a real intake-batches/storage-units API.
const INTAKE_BATCHES: IntakeBatch[] = [
  {
    id: "1",
    code: "YC2026-OO14",
    weightKg: 3.35,
    status: "Aggregated",
    harvestDate: "Aug 6, 2026",
    urgentNote: "5h – urgent: assign to storage",
  },
  {
    id: "2",
    code: "YC2026-OO14",
    weightKg: 3.15,
    status: "Harvested",
    harvestDate: "Apr 28, 2026",
  },
  {
    id: "3",
    code: "YC2026-OO14",
    weightKg: 5,
    status: "Aggregated",
    harvestDate: "Jul 26, 2026",
  },
];

const STORAGE_UNITS: StorageUnit[] = [
  {
    id: "a-24",
    name: "Unit A-24",
    facilityLabel: "YucaVault #1 Ilorin-OO14",
    usedKg: 295,
    capacityKg: 300,
    status: "active",
  },
  {
    id: "b-12",
    name: "Unit B-12",
    facilityLabel: "YucaVault #3 – Ibadan",
    usedKg: 205,
    capacityKg: 300,
    status: "active",
  },
  {
    id: "yh-06",
    name: "Unit YH-06",
    facilityLabel: "YucaHub P1 – Offa",
    usedKg: 0,
    capacityKg: 0,
    status: "offline",
  },
];

export default function AssignStorageSection() {
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([
    "1",
    "3",
  ]);
  const [selectedUnitId, setSelectedUnitId] = useState("a-24");

  const handleAssign = () => {
    // Replace with your real "assign batches to storage unit" call, e.g.:
    // await fetch("/api/aggregator/assign-storage", {
    //   method: "POST",
    //   body: JSON.stringify({ batchIds: selectedBatchIds, unitId: selectedUnitId }),
    // });
    console.log("Assign batches", selectedBatchIds, "to unit", selectedUnitId);
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900">Assign to Storage</h1>
      <p className="mt-1 text-sm text-gray-500">
        Allocate intake batches into a warehouse unit
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BatchSelectionList
          batches={INTAKE_BATCHES}
          selectedIds={selectedBatchIds}
          onChange={setSelectedBatchIds}
        />
        <StorageUnitSelector
          units={STORAGE_UNITS}
          selectedId={selectedUnitId}
          onChange={setSelectedUnitId}
          onAssign={handleAssign}
          assignDisabled={selectedBatchIds.length === 0}
        />
      </div>
    </>
  );
}
