"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, QrCode, Tag, Layers, Eye, Filter } from "lucide-react";
import type { BatchRecord, BatchStatus } from "@/app/types/batchVaultDispatch";
import { batchService } from "@/app/Services/batchService";
import BatchDetailModal from "./BatchDetailModal";
import UpdatePricingModal from "./UpdatePricingModal";

const STATUS_TABS: Array<{ label: string; value: BatchStatus | "All" }> = [
  { label: "All", value: "All" },
  { label: "Harvested", value: "Harvested" },
  { label: "Aggregated", value: "Aggregated" },
  { label: "In Storage", value: "In Storage" },
  { label: "Listed", value: "Listed" },
  { label: "Sold", value: "Sold" },
];

export interface ActiveBatchesTableProps {
  initialBatches?: BatchRecord[];
  onViewAll?: () => void;
  onAssignStorage?: (batch: BatchRecord) => void;
}

export default function ActiveBatchesTable({
  initialBatches,
  onViewAll,
  onAssignStorage,
}: ActiveBatchesTableProps) {
  const [batches, setBatches] = useState<BatchRecord[]>(initialBatches || []);
  const [loading, setLoading] = useState(!initialBatches);
  const [activeTab, setActiveTab] = useState<BatchStatus | "All">("All");

  const [selectedBatchForDetail, setSelectedBatchForDetail] = useState<BatchRecord | null>(null);
  const [selectedBatchForPricing, setSelectedBatchForPricing] = useState<BatchRecord | null>(null);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const statusParam = activeTab === "All" ? undefined : activeTab;
      const data = await batchService.getBatches(statusParam);
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load batches from API:", err);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [activeTab]);

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-xs">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Active Batches</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live harvested and aggregated batches across your hub
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchBatches}
              disabled={loading}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              title="Refresh batches"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#226049]" : ""} />
            </button>
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs font-semibold text-[#226049] hover:underline cursor-pointer"
              >
                View all
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll py-3 no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={[
                "rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                activeTab === tab.value
                  ? "bg-[#226049] text-white shadow-2xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto touch-scroll">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw size={22} className="animate-spin text-[#226049] mb-2" />
              <p className="text-xs font-semibold text-gray-700">Loading Batches...</p>
            </div>
          ) : (
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Batch Code</th>
                  <th className="pb-3 pr-4">Farmer / Seller</th>
                  <th className="pb-3 pr-4">Weight (KG)</th>
                  <th className="pb-3 pr-4">Grade</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((batch) => {
                  const weight = (batch.verifiedWeightKg || batch.weightKg || batch.estWeightKg || 0).toLocaleString();
                  const farmer = batch.farmerName || batch.farmer || batch.sellerName || "Registered Farmer";
                  return (
                    <tr key={batch.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-bold text-gray-900">
                        {batch.batchCode}
                      </td>
                      <td className="py-3.5 pr-4 text-gray-700 font-medium">
                        {farmer}
                      </td>
                      <td className="py-3.5 pr-4 text-gray-900 font-semibold">
                        {weight} kg
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#226049]">
                          Grade {batch.qualityGrade || "A"}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            batch.status === "Harvested"
                              ? "bg-blue-50 text-blue-700"
                              : batch.status === "Aggregated"
                              ? "bg-amber-50 text-amber-700"
                              : batch.status === "In Storage"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-purple-50 text-purple-700",
                          ].join(" ")}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBatchForDetail(batch)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                            title="View Batch Details & Traceability"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedBatchForPricing(batch)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-800 hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Update Pricing"
                          >
                            <Tag size={15} />
                          </button>
                          {onAssignStorage && batch.status !== "In Storage" && (
                            <button
                              type="button"
                              onClick={() => onAssignStorage(batch)}
                              className="p-1.5 rounded-lg text-[#226049] hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Assign to YucaVault"
                            >
                              <Layers size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && batches.length === 0 && (
            <div className="py-12 text-center text-xs text-gray-500">
              No batches found for this category.
            </div>
          )}
        </div>
      </div>

      {/* Batch Detail Modal */}
      {selectedBatchForDetail && (
        <BatchDetailModal
          batchId={selectedBatchForDetail.id}
          initialBatch={selectedBatchForDetail}
          open={!!selectedBatchForDetail}
          onClose={() => setSelectedBatchForDetail(null)}
          onAssignStorage={onAssignStorage}
          onUpdatePricing={(b) => {
            setSelectedBatchForDetail(null);
            setSelectedBatchForPricing(b);
          }}
        />
      )}

      {/* Pricing Modal */}
      {selectedBatchForPricing && (
        <UpdatePricingModal
          batch={selectedBatchForPricing}
          open={!!selectedBatchForPricing}
          onClose={() => setSelectedBatchForPricing(null)}
          onSuccess={fetchBatches}
        />
      )}
    </>
  );
}
