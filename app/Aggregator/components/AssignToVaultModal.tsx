"use client";

import React, { useState } from "react";
import  Modal  from "@/app/components/ui/Modal";
import ConsolidationBatchList from "./ConsolidateBatchList";
import ConsolidationSummary from "./ConsolidationSummary";
import VaultAssignmentSelector from "./VaultAssignmentSelector";
import type { ConsolidationBatch, DispatchOrderRecord, VaultOption } from "./types";

const NEEDED_KG = 12000;

// Same sample data as the standalone Consolidate to Vault section - this
// modal isn't scoped to the triggering order's own batches, matching the mock.
const INITIAL_BATCHES: ConsolidationBatch[] = [
  { id: "1", batchCode: "YC-2026-00142", farmer: "Musa Ibrahim", grade: "A", weightKg: 3340, selected: true },
  { id: "2", batchCode: "YC-2026-00142", farmer: "Musa Ibrahim", grade: "A", weightKg: 3340, selected: true },
  { id: "3", batchCode: "YC-2026-00142", farmer: "Musa Ibrahim", grade: "A", weightKg: 3340, selected: true },
];

const VAULTS: VaultOption[] = [
  { id: "v1", name: "Yucavault #1", location: "Ilorin", availableTonnes: 184, capacityTonnes: 200 },
  { id: "v2", name: "Yucavault #3", location: "Ibadan", availableTonnes: 95, capacityTonnes: 300 },
];

export interface AssignToVaultModalProps {
  order: DispatchOrderRecord | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (order: DispatchOrderRecord, batchIds: string[], vaultId: string) => void;
}

export default function AssignToVaultModal({
  order,
  open,
  onClose,
  onConfirm,
}: AssignToVaultModalProps) {
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [vaultId, setVaultId] = useState(VAULTS[0].id);

  if (!order) return null;

  const combinedKg = batches.filter((b) => b.selected).reduce((sum, b) => sum + b.weightKg, 0);

  const toggleBatch = (id: string) => {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b)));
  };

  const handleRemoveBatch = () => {
    setBatches((prev) => {
      const lastSelectedIndex = [...prev].reverse().findIndex((b) => b.selected);
      if (lastSelectedIndex === -1) return prev;
      const indexToRemove = prev.length - 1 - lastSelectedIndex;
      return prev.filter((_, i) => i !== indexToRemove);
    });
  };

  return (
    <Modal open={open} onClose={onClose} maxWidthClassName="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900">Assign to YucaVault</h2>
      <p className="mt-1 text-sm text-gray-500">
        Review, combine, and assign selected batches to a Yucavault storage unit.
      </p>

      <div className="mt-6 rounded-2xl border border-gray-100 p-6">
        <ConsolidationBatchList batches={batches} onToggle={toggleBatch} />
        <ConsolidationSummary combinedKg={combinedKg} neededKg={NEEDED_KG} />

        <div className="mt-6">
          <VaultAssignmentSelector vaults={VAULTS} selectedId={vaultId} onChange={setVaultId} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              onConfirm(
                order,
                batches.filter((b) => b.selected).map((b) => b.id),
                vaultId
              )
            }
            className="rounded-xl bg-[#215243] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336]"
          >
            Confirm Consolidation and Dispatch
          </button>
          <button
            type="button"
            className="rounded-xl border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleRemoveBatch}
            className="rounded-xl border border-red-400 px-8 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            Remove a Batch
          </button>
        </div>
      </div>
    </Modal>
  );
}