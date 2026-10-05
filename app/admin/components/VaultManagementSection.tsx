"use client";

import React, { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Layers,
  AlertTriangle,
  RefreshCw,
  Box,
  MapPin,
  CheckCircle2,
  X,
  Loader2,
  Check,
  Building2,
  Scale,
} from "lucide-react";
import type {
  VaultUnit,
  VaultLot,
  SpoilageAlert,
  CreateVaultUnitRequest,
  ConsolidateVaultRequest,
  BatchRecord,
} from "@/app/types/batchVaultDispatch";
import { vaultService } from "@/app/Services/vaultService";
import { batchService } from "@/app/Services/batchService";
import BatchSelectionList from "./BatchSelectionList";
import StorageUnitSelector from "./StorageUnitSelector";
import type { IntakeBatch, StorageUnit } from "./types";

export type VaultSubTab = "assign" | "lorries" | "lots";

export default function VaultManagementSection({
  initialSubTab = "assign",
}: {
  initialSubTab?: VaultSubTab;
}) {
  const [activeTab, setActiveTab] = useState<VaultSubTab>(initialSubTab);

  // Data
  const [vaults, setVaults] = useState<VaultUnit[]>([]);
  const [lots, setVaultLots] = useState<VaultLot[]>([]);
  const [spoilageAlerts, setSpoilageAlerts] = useState<SpoilageAlert[]>([]);
  const [intakeBatches, setIntakeBatches] = useState<BatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Storage assignment state
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [consolidateModalOpen, setConsolidateModalOpen] = useState(false);
  const [selectedVaultDetail, setSelectedVaultDetail] = useState<VaultUnit | null>(null);

  // New Lorry form state
  const [newUnitCode, setNewUnitCode] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newState, setNewState] = useState("Kwara");
  const [newLga, setNewLga] = useState("Ilorin South");
  const [newCapacityKg, setNewCapacityKg] = useState<number>(300000);
  const [isCreating, setIsCreating] = useState(false);

  // Consolidation form state
  const [consolidateBatchIds, setConsolidateBatchIds] = useState<string[]>([]);
  const [targetVaultId, setTargetVaultId] = useState("");
  const [lotGrade, setLotGrade] = useState<"A" | "B" | "C">("A");
  const [customLotCode, setCustomLotCode] = useState(
    `VL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [vaultsData, lotsData, alertsData, batchesData] = await Promise.all([
        vaultService.getVaults().catch(() => []),
        vaultService.getVaultLots().catch(() => []),
        vaultService.getSpoilageAlerts().catch(() => []),
        batchService.getBatches("Aggregated").catch(() => []),
      ]);

      const vaultsList = Array.isArray(vaultsData) ? vaultsData : [];
      setVaults(vaultsList);
      if (vaultsList.length > 0) {
        if (!selectedUnitId) setSelectedUnitId(vaultsList[0].id);
        if (!targetVaultId) setTargetVaultId(vaultsList[0].id);
      } else {
        setSelectedUnitId("");
        setTargetVaultId("");
      }

      setVaultLots(Array.isArray(lotsData) ? lotsData : []);
      setSpoilageAlerts(Array.isArray(alertsData) ? alertsData : []);
      setIntakeBatches(Array.isArray(batchesData) ? batchesData : []);
    } catch (err) {
      console.error("Failed to load vault data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle storage allocation
  const handleAssignStorage = async () => {
    if (selectedBatchIds.length === 0 || !selectedUnitId) return;

    setAssigning(true);
    try {
      await Promise.all(
        selectedBatchIds.map((batchId) =>
          batchService.assignStorage(batchId, {
            vaultId: selectedUnitId,
          })
        )
      );

      setActionSuccess(`Successfully allocated ${selectedBatchIds.length} batch(es) to storage!`);
      setSelectedBatchIds([]);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchAllData();
    } catch (err) {
      console.error("Storage assignment error:", err);
      setSelectedBatchIds([]);
      fetchAllData();
    } finally {
      setAssigning(false);
    }
  };

  // Handle creating a new YucaVault transport lorry
  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitCode.trim() || newCapacityKg <= 0) return;

    setIsCreating(true);
    try {
      const created = await vaultService.createVault({
        unitCode: newUnitCode.trim(),
        unitType: "YucaVault",
        location: newLocation.trim() || "YucaVault Transport Depo",
        state: newState,
        lga: newLga,
        latitude: 8.4966,
        longitude: 4.5421,
        capacityKg: Number(newCapacityKg),
      });

      setVaults((prev) => [...prev, created]);
      setCreateModalOpen(false);
      setActionSuccess("New YucaVault transport truck added successfully!");
      setTimeout(() => setActionSuccess(null), 3000);
      setNewUnitCode("");
    } catch (err) {
      console.error("Failed to create vault unit:", err);
      setCreateModalOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle batch consolidation into a Vault Lot
  const handleConsolidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (consolidateBatchIds.length === 0 || !targetVaultId) return;

    setIsConsolidating(true);
    try {
      const newLot = await vaultService.consolidateBatches({
        batchIds: consolidateBatchIds,
        storageUnitId: targetVaultId,
        qualityGrade: lotGrade,
        lotCode: customLotCode.trim(),
      });

      setVaultLots((prev) => [newLot, ...prev]);
      setConsolidateModalOpen(false);
      setConsolidateBatchIds([]);
      setActionSuccess(`Vault Lot ${customLotCode} consolidated and ready for market!`);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchAllData();
    } catch (err) {
      console.error("Failed to consolidate batches:", err);
      setConsolidateModalOpen(false);
    } finally {
      setIsConsolidating(false);
    }
  };

  // Mapped formats for UI subcomponents
  const mappedIntakeBatches: IntakeBatch[] = intakeBatches.map((b) => ({
    id: b.id,
    code: b.batchCode,
    weightKg: b.verifiedWeightKg ?? b.weightKg ?? 0,
    status: (b.status === "Harvested" ? "Harvested" : "Aggregated") as "Harvested" | "Aggregated",
    harvestDate: b.harvestDate || "Recently",
    urgentNote: b.urgentStorageFlag ? "Urgent: high spoilage risk" : undefined,
  }));

  const mappedUnits: StorageUnit[] = vaults.map((v) => ({
    id: v.id,
    name: v.unitCode,
    facilityLabel: v.location,
    usedKg: Math.round((v.usedWeightKg || 0) / 1000),
    capacityKg: v.capacityKg ? Math.round(v.capacityKg / 1000) : 0,
    status: (v.status as any) || "active",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hub &amp; Vault Storage Operations</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Allocate cassava to stationary YucaHub storage, manage YucaVault transport lorries, and bulk lots for market delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAllData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-[#226049]" : ""} />
          </button>

          {activeTab === "lots" && (
            <button
              type="button"
              onClick={() => setConsolidateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-[#226049] hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Layers size={15} />
              Consolidate into Lot
            </button>
          )}

          {activeTab === "lorries" && (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#226049] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1a4336] transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              Add Transport Truck
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("assign")}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "assign"
              ? "bg-[#226049] text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <Building2 size={16} />
          Assign to Storage
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("lorries")}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "lorries"
              ? "bg-[#226049] text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <Truck size={16} />
          YucaVault Transport Lorries ({vaults.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("lots")}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "lots"
              ? "bg-[#226049] text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
          ].join(" ")}
        >
          <Layers size={16} />
          Consolidated Lots &amp; Spoilage ({lots.length})
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: ASSIGN TO STORAGE
      ────────────────────────────────────────────────────────────── */}
      {activeTab === "assign" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 text-xs text-gray-600 flex items-center gap-2.5 shadow-xs">
            <Building2 size={18} className="text-[#226049] shrink-0" />
            <span>
              <strong>Stationary YucaHub:</strong> Storing harvested batches locally at the collection facility.
              Select batches on the left and choose a target facility rack or YucaVault lorry on the right.
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <RefreshCw size={24} className="animate-spin text-[#226049] mb-3" />
              <p className="text-sm font-semibold text-gray-900">Loading Storage Units &amp; Batches...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BatchSelectionList
                batches={mappedIntakeBatches}
                selectedIds={selectedBatchIds}
                onChange={setSelectedBatchIds}
              />
              <StorageUnitSelector
                units={mappedUnits}
                selectedId={selectedUnitId}
                onChange={setSelectedUnitId}
                onAssign={handleAssignStorage}
                assignDisabled={selectedBatchIds.length === 0 || assigning}
              />
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: YUCAVAULT TRANSPORT LORRIES
      ────────────────────────────────────────────────────────────── */}
      {activeTab === "lorries" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              YucaVault lorries transport cassava between aggregation hubs and processing mills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaults.map((vault) => (
              <div
                key={vault.id}
                onClick={() => setSelectedVaultDetail(vault)}
                className="group relative rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#226049] shrink-0">
                      <Truck size={20} />
                    </div>
                    <div>
                      <span className="inline-flex rounded-md bg-emerald-50/80 px-2 py-0.5 text-xs font-mono font-bold text-[#226049]">
                        {vault.unitCode}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1">{vault.location}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> Base: {vault.lga}, {vault.state} State
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-[#226049] border border-emerald-200/60">
                    {vault.status || "Active Lorry"}
                  </span>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Vehicle Type</span>
                    <span className="font-semibold text-gray-800">Haulage Transport Truck</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Carrying Capacity</span>
                    <span className="font-bold text-gray-900">
                      {((vault.capacityKg || 0) / 1000).toLocaleString()} Tonnes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {vaults.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-xs text-gray-500">
              No transport trucks registered yet. Click &quot;Add Transport Truck&quot; above to add a haulage unit.
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: CONSOLIDATED LOTS & SPOILAGE ALERTS
      ────────────────────────────────────────────────────────────── */}
      {activeTab === "lots" && (
        <div className="space-y-6">
          {/* Spoilage Warnings */}
          {spoilageAlerts.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
                <AlertTriangle size={16} className="text-amber-600" />
                Spoilage Risk Threshold Warnings ({spoilageAlerts.length} Batches in Transit)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {spoilageAlerts.map((alert, i) => (
                  <div key={i} className="rounded-xl bg-white border border-amber-200 p-3 text-xs shadow-2xs">
                    <div className="flex items-center justify-between font-mono font-bold text-gray-900">
                      <span>{alert.batchCode}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-sans">
                        {alert.hoursInTransit || alert.ambientHours || 18}h in transit
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] mt-1.5 leading-snug">{alert.message}</p>
                    <span className="text-[10px] font-semibold text-[#226049] mt-2 block">
                      Recommended: {alert.recommendedAction || "Assign YucaVault haulage lorry immediately"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consolidated Lots Table */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Box size={16} className="text-[#226049]" />
                  Consolidated Vault Lots Ready for Market Sale
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bulked Grade A &amp; B lots ready for buyer delivery via YucaVault lorries
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-[#226049]">
                {lots.length} {lots.length === 1 ? "Lot" : "Lots"}
              </span>
            </div>

            <div className="overflow-x-auto touch-scroll">
              <table className="w-full min-w-[580px] text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-4">Lot Code</th>
                    <th className="pb-3 pr-4">Quality Grade</th>
                    <th className="pb-3 pr-4">Total Weight (KG)</th>
                    <th className="pb-3 pr-4">Batches Bulked</th>
                    <th className="pb-3 pr-4">Storage / Base</th>
                    <th className="pb-3 text-right">Market Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-bold text-gray-900">{lot.lotCode}</td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#226049]">
                          Grade {lot.qualityGrade}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-gray-900">
                        {(lot.totalWeightKg || 0).toLocaleString()} kg
                      </td>
                      <td className="py-3.5 pr-4 text-gray-600 font-medium">
                        {lot.batchCount || (lot.batchIds ? lot.batchIds.length : 0)} Batches
                      </td>
                      <td className="py-3.5 pr-4 text-gray-600 font-medium">
                        {lot.storageUnitName || lot.storageUnitId || "Hub Storage"}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#226049] border border-emerald-200">
                          {lot.status || "Ready for Market"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {lots.length === 0 && (
                <div className="py-10 text-center text-xs text-gray-500">
                  No consolidated lots created yet. Click &quot;Consolidate into Lot&quot; above to combine batches.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Lorry Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#226049]">
                <Truck size={18} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Add YucaVault Transport Truck</h3>
            </div>

            <form onSubmit={handleCreateVault} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Vehicle / Lorry Code</label>
                <input
                  type="text"
                  value={newUnitCode}
                  onChange={(e) => setNewUnitCode(e.target.value)}
                  placeholder="e.g. YucaVault Lorry #3"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Base Hub Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Ogbomoso Transit Hub"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">LGA</label>
                  <input
                    type="text"
                    value={newLga}
                    onChange={(e) => setNewLga(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Haulage Capacity (KG)</label>
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  value={newCapacityKg}
                  onChange={(e) => setNewCapacityKg(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#226049] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1a4336] transition-colors cursor-pointer shadow-xs"
                >
                  {isCreating && <Loader2 size={13} className="animate-spin" />}
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consolidate Modal */}
      {consolidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setConsolidateModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#226049]">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Consolidate Batches into Vault Lot</h3>
                <p className="text-xs text-gray-500">Combine verified batches of matching grade for market listing</p>
              </div>
            </div>

            <form onSubmit={handleConsolidate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Lot Code</label>
                  <input
                    type="text"
                    value={customLotCode}
                    onChange={(e) => setCustomLotCode(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quality Grade</label>
                  <select
                    value={lotGrade}
                    onChange={(e) => setLotGrade(e.target.value as any)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none bg-white"
                  >
                    <option value="A">Grade A (High Starch)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Industrial)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target YucaVault Transport Lorry</label>
                <select
                  value={targetVaultId}
                  onChange={(e) => setTargetVaultId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none bg-white"
                  required
                >
                  {vaults.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.unitCode} — {v.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Select Batches to Combine ({consolidateBatchIds.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-3">
                  {intakeBatches.length > 0 ? (
                    intakeBatches.map((batch) => {
                      const isChecked = consolidateBatchIds.includes(batch.id);
                      return (
                        <label
                          key={batch.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setConsolidateBatchIds((prev) =>
                                  isChecked
                                    ? prev.filter((id) => id !== batch.id)
                                    : [...prev, batch.id]
                                );
                              }}
                              className="rounded text-[#226049] focus:ring-[#226049]"
                            />
                            <div>
                              <span className="font-mono font-bold text-gray-900 block">{batch.batchCode}</span>
                              <span className="text-[11px] text-gray-500">
                                {batch.farmerName || batch.farmer || "Farmer"} · Grade {batch.qualityGrade || "A"}
                              </span>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-800">
                            {(batch.verifiedWeightKg || batch.weightKg || 0).toLocaleString()} kg
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-center py-4 text-xs text-gray-400">
                      No aggregated batches available for consolidation.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConsolidateModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConsolidating || consolidateBatchIds.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#226049] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1a4336] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isConsolidating && <Loader2 size={13} className="animate-spin" />}
                  Confirm Consolidation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lorry Detail Modal */}
      {selectedVaultDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedVaultDetail(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="border-b border-gray-100 pb-3 mb-4">
              <span className="font-mono text-xs font-bold text-[#226049] bg-emerald-50 px-2.5 py-1 rounded-md">
                {selectedVaultDetail.unitCode}
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-2">{selectedVaultDetail.location}</h3>
              <p className="text-xs text-gray-500">{selectedVaultDetail.lga}, {selectedVaultDetail.state} State</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-gray-100 p-3 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Vehicle Type:</span>
                  <span className="font-semibold text-gray-900">YucaVault Transport Lorry</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Haulage Capacity:</span>
                  <span className="font-semibold text-gray-900">{(selectedVaultDetail.capacityKg / 1000).toLocaleString()} Tonnes</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-800">{selectedVaultDetail.status || "Active"}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedVaultDetail(null)}
                className="rounded-xl bg-[#226049] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1a4336] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
