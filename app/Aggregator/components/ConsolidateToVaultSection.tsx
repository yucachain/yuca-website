"use client";

import React, { useState } from "react";
import ConsolidationBatchList from "./ConsolidateBatchList";
import ConsolidationSummary from "./ConsolidationSummary";
import VaultAssignmentSelector from "./VaultAssignmentSelector";
import type { ConsolidationBatch, VaultOption } from "./types";

const NEEDED_KG = 12000;

const INITIAL_BATCHES: ConsolidationBatch[] = [
  { id: "1", batchCode: "YC-2026-00142", farmer: "Musa Ibrahim", grade: "A", weightKg: 3340, selected: true },
  { id: "2", batchCode: "YC-2026-00142", farmer: "Musa Ibrahim", grade: "A", weightKg: 3340, selected: true },
  { id: "3", batchCode: "YC-2026-00142", farmer: "Musa Ibrahim", grade: "A", weightKg: 3340, selected: true },
];

const VAULTS: VaultOption[] = [
  { id: "v1", name: "Yucavault #1", location: "Ilorin", availableTonnes: 184, capacityTonnes: 200 },
  { id: "v2", name: "Yucavault #3", location: "Ibadan", availableTonnes: 95, capacityTonnes: 300 },
];

export default function ConsolidateToVaultSection() {
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [vaultId, setVaultId] = useState(VAULTS[0].id);

  const combinedKg = batches
    .filter((b) => b.selected)
    .reduce((sum, b) => sum + b.weightKg, 0);

  const toggleBatch = (id: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b))
    );
  };

  const handleConfirm = () => {
    // Replace with your real "confirm consolidation and assign" call, e.g.:
    // await fetch("/api/aggregator/consolidate", {
    //   method: "POST",
    //   body: JSON.stringify({ batchIds: batches.filter((b) => b.selected).map((b) => b.id), vaultId }),
    // });
    console.log("Confirm consolidation", batches, vaultId);
  };

  const handleSaveDraft = () => {
    console.log("Save as draft", batches, vaultId);
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
    <>
      <h1 className="text-3xl font-bold text-gray-900">Marketplace Orders</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review, combine, and assign selected batches to a Yucavault storage unit.
      </p>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
        <ConsolidationBatchList batches={batches} onToggle={toggleBatch} />

        <ConsolidationSummary combinedKg={combinedKg} neededKg={NEEDED_KG} />

        <div className="mt-6">
          <VaultAssignmentSelector vaults={VAULTS} selectedId={vaultId} onChange={setVaultId} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-[#215243] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336]"
          >
            Confirm Consolidation and assign
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
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
    </>
  );
}