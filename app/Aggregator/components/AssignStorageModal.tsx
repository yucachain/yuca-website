"use client";

import React, { useState } from "react";
import  Modal  from "@/app/components/ui/Modal";
import BatchSelectionList from "./BatchSelectionList";
import StorageUnitSelector from "./StorageUnitSelector";
import type { DispatchOrderRecord, IntakeBatch, StorageUnit } from "./types";

// Same sample data as the standalone Assign Storage section - this modal
// isn't scoped to the triggering order's own batches, matching the mock.
const INTAKE_BATCHES: IntakeBatch[] = [
  {
    id: "1",
    code: "YC2026-OO14",
    weightKg: 3.35,
    status: "Aggregated",
    harvestDate: "Aug 6, 2026",
    urgentNote: "5h – urgent: assign to storage",
  },
  { id: "2", code: "YC2026-OO14", weightKg: 3.15, status: "Harvested", harvestDate: "Apr 28, 2026" },
  { id: "3", code: "YC2026-OO14", weightKg: 5, status: "Aggregated", harvestDate: "Jul 26, 2026" },
];

const STORAGE_UNITS: StorageUnit[] = [
  { id: "a-24", name: "Unit A-24", facilityLabel: "YucaVault #1 Ilorin-OO14", usedKg: 295, capacityKg: 300, status: "active" },
  { id: "b-12", name: "Unit B-12", facilityLabel: "YucaVault #3 – Ibadan", usedKg: 205, capacityKg: 300, status: "active" },
  { id: "yh-06", name: "Unit YH-06", facilityLabel: "YucaHub P1 – Offa", usedKg: 0, capacityKg: 0, status: "offline" },
];

export interface AssignToStorageModalProps {
  order: DispatchOrderRecord | null;
  open: boolean;
  onClose: () => void;
  onAssign: (order: DispatchOrderRecord, batchIds: string[], unitId: string) => void;
}

export default function AssignToStorageModal({
  order,
  open,
  onClose,
  onAssign,
}: AssignToStorageModalProps) {
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(["1", "3"]);
  const [selectedUnitId, setSelectedUnitId] = useState("a-24");

  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidthClassName="max-w-5xl">
      <h2 className="text-2xl font-bold text-gray-900">Assign to Storage</h2>
      <p className="mt-1 text-sm text-gray-500">Allocate intake batches into a warehouse unit</p>

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
          onAssign={() => onAssign(order, selectedBatchIds, selectedUnitId)}
          assignDisabled={selectedBatchIds.length === 0}
        />
      </div>
    </Modal>
  );
}