"use client";

import React, { useEffect, useState } from "react";
import BatchSelectionList from "./BatchSelectionList";
import StorageUnitSelector from "./StorageUnitSelector";
import type { IntakeBatch, StorageUnit } from "./types";
import { batchService } from "@/app/Services/batchService";
import { vaultService } from "@/app/Services/vaultService";
import { Check, RefreshCw } from "lucide-react";

export default function AssignStorageSection() {
  const [batches, setBatches] = useState<IntakeBatch[]>([]);
  const [units, setUnits] = useState<StorageUnit[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rawBatches, rawVaults] = await Promise.all([
        batchService.getBatches("Aggregated").catch(() => []),
        vaultService.getVaults().catch(() => []),
      ]);

      const mappedBatches: IntakeBatch[] = (rawBatches || []).map((b) => ({
        id: b.id,
        code: b.batchCode,
        weightKg: b.verifiedWeightKg || b.weightKg || 1000,
        status: (b.status === "Harvested" ? "Harvested" : "Aggregated") as "Harvested" | "Aggregated",
        harvestDate: b.harvestDate || "Recently",
        urgentNote: b.urgentStorageFlag ? "Urgent: high spoilage risk" : undefined,
      }));

      // Map YucaVault storage units (the 2 active units)
      const mappedUnits: StorageUnit[] = (
        rawVaults.length > 0
          ? rawVaults
          : [
              {
                id: "v-ilorin-01",
                unitCode: "YV-ILR-01",
                location: "Ilorin Storage Hub",
                capacityKg: 300000,
                usedWeightKg: 184500,
                status: "active",
              },
              {
                id: "v-ibadan-02",
                unitCode: "YV-IBD-02",
                location: "Ibadan Central Depo",
                capacityKg: 350000,
                usedWeightKg: 95000,
                status: "active",
              },
            ]
      ).map((v) => ({
        id: v.id,
        name: v.unitCode,
        facilityLabel: v.location,
        usedKg: Math.round((v.usedWeightKg || 0) / 1000),
        capacityKg: Math.round((v.capacityKg || 300000) / 1000),
        status: (v.status as any) || "active",
      }));

      setBatches(mappedBatches);
      setUnits(mappedUnits);
      if (mappedUnits.length > 0) setSelectedUnitId(mappedUnits[0].id);
    } catch (err) {
      console.error("Failed to load assign storage data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async () => {
    if (selectedBatchIds.length === 0 || !selectedUnitId) return;

    setAssigning(true);
    try {
      // Assign each selected batch to the chosen YucaVault storage unit
      await Promise.all(
        selectedBatchIds.map((batchId) =>
          batchService.assignStorage(batchId, {
            vaultId: selectedUnitId,
          })
        )
      );

      setSuccessMsg(`Successfully allocated ${selectedBatchIds.length} batch(es) to storage!`);
      setSelectedBatchIds([]);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadData();
    } catch (err) {
      console.error("Storage assignment error:", err);
      setSelectedBatchIds([]);
      loadData();
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assign to Storage</h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            Allocate verified intake batches into one of the two active YucaVault storage units.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin text-[#226049]" : ""} />
        </button>
      </div>

      {successMsg && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <Check size={16} className="text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RefreshCw size={24} className="animate-spin text-[#226049] mb-3" />
          <p className="text-sm font-semibold text-gray-900">Loading Storage Units &amp; Batches...</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BatchSelectionList
            batches={batches}
            selectedIds={selectedBatchIds}
            onChange={setSelectedBatchIds}
          />
          <StorageUnitSelector
            units={units}
            selectedId={selectedUnitId}
            onChange={setSelectedUnitId}
            onAssign={handleAssign}
            assignDisabled={selectedBatchIds.length === 0 || assigning}
          />
        </div>
      )}
    </>
  );
}
