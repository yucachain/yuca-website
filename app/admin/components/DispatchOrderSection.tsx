"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  FileText,
} from "lucide-react";
import type { DispatchRecord, DispatchStatus } from "@/app/types/batchVaultDispatch";
import { dispatchService } from "@/app/Services/dispatchService";
import CreateDispatchModal from "./CreateDispatchModal";
import DispatchReceiptModal from "./DispatchReceiptModal";
import { toast } from "sonner";

export type DispatchOrderTab = "all" | "pending" | "dispatched" | "in-transit" | "delivered";

export default function DispatchOrderSection() {
  const [activeTab, setActiveTab] = useState<DispatchOrderTab>("all");
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [receiptRecord, setReceiptRecord] = useState<DispatchRecord | null>(null);

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === "all" ? undefined : activeTab;
      const data = await dispatchService.getDispatches(statusParam as any);
      setDispatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load dispatches:", err);
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, [activeTab]);

  const counts = useMemo(
    () => ({
      all: dispatches.length,
      pending: dispatches.filter((o) => o.status === "pending").length,
      dispatched: dispatches.filter((o) => o.status === "dispatched").length,
      "in-transit": dispatches.filter((o) => o.status === "in-transit").length,
      delivered: dispatches.filter((o) => o.status === "delivered").length,
    }),
    [dispatches]
  );

  const handleAdvanceStatus = async (dispatch: DispatchRecord) => {
    const nextStatusMap: Record<DispatchStatus, DispatchStatus> = {
      pending: "dispatched",
      dispatched: "in-transit",
      "in-transit": "delivered",
      delivered: "delivered",
    };

    const nextStatus = nextStatusMap[dispatch.status];
    if (nextStatus === dispatch.status) return;

    setDispatches((prev) =>
      prev.map((d) => (d.id === dispatch.id ? { ...d, status: nextStatus } : d))
    );

    try {
      await dispatchService.updateStatus(dispatch.id, { status: nextStatus });
      toast.success(`Dispatch status advanced to ${nextStatus.toUpperCase()}`);
    } catch (err) {
      console.error("Failed to advance dispatch status:", err);
      toast.error("Failed to advance dispatch status on server");
    }
  };

  const handleViewReceipt = async (dispatch: DispatchRecord) => {
    try {
      const fullRecord = await dispatchService.getDispatchById(dispatch.id);
      setReceiptRecord(fullRecord || dispatch);
    } catch {
      setReceiptRecord(dispatch);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dispatch &amp; Logistics Management</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Release outbound shipments from YucaVault storage, assign carriers, and monitor freight progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDispatches}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            title="Refresh dispatches"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-[#226049]" : ""} />
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#226049] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1a4336] transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            Create Dispatch Release
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto touch-scroll py-2 no-scrollbar">
        {[
          { key: "all", label: `All Orders (${counts.all})` },
          { key: "pending", label: `Pending (${counts.pending})` },
          { key: "dispatched", label: `Dispatched (${counts.dispatched})` },
          { key: "in-transit", label: `In Transit (${counts["in-transit"]})` },
          { key: "delivered", label: `Delivered (${counts.delivered})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={[
              "rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
              activeTab === tab.key
                ? "bg-[#226049] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dispatches Table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs">
        <div className="overflow-x-auto touch-scroll">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw size={24} className="animate-spin text-[#226049] mb-2" />
              <p className="text-xs font-semibold text-gray-700">Loading Dispatch Records...</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Tracking Code</th>
                  <th className="pb-3 pr-4">Pickup Hub</th>
                  <th className="pb-3 pr-4">Carrier</th>
                  <th className="pb-3 pr-4">Weight (KG)</th>
                  <th className="pb-3 pr-4">Weighbridge Ticket</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dispatches.map((dispatch) => (
                  <tr key={dispatch.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold text-gray-900">
                      {dispatch.trackingNumber || dispatch.trackingCode || `TRK-${dispatch.id.slice(0, 8)}`}
                    </td>
                    <td className="py-3.5 pr-4 text-gray-700 font-medium">
                      {dispatch.pickupHub || "YucaVault #1 Ilorin"}
                    </td>
                    <td className="py-3.5 pr-4 text-gray-800 font-semibold">
                      {dispatch.carrierName || "Kobo360"}
                    </td>
                    <td className="py-3.5 pr-4 text-gray-900 font-bold">
                      {(dispatch.weightKg || 0).toLocaleString()} kg
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-gray-600">
                      {dispatch.weighbridgeTicket || "WB-PENDING"}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          dispatch.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : dispatch.status === "dispatched"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : dispatch.status === "in-transit"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200",
                        ].join(" ")}
                      >
                        {dispatch.status === "in-transit" ? "In Transit" : dispatch.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewReceipt(dispatch)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                          title="Generate Receipt"
                        >
                          <FileText size={13} />
                          <span>Receipt</span>
                        </button>

                        {dispatch.status !== "delivered" && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(dispatch)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[#226049] hover:bg-emerald-100 transition-colors font-semibold cursor-pointer"
                            title="Advance shipment status"
                          >
                            <span>Next</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && dispatches.length === 0 && (
            <div className="py-12 text-center text-xs text-gray-500">
              No dispatch orders found matching this filter. Click &quot;Create Dispatch Release&quot; to issue a new delivery.
            </div>
          )}
        </div>
      </div>

      {/* Create Release Modal */}
      {createModalOpen && (
        <CreateDispatchModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={(newRecord) => {
            setDispatches((prev) => [newRecord, ...prev]);
          }}
        />
      )}

      {/* Dispatch Receipt Modal */}
      {receiptRecord && (
        <DispatchReceiptModal
          open={!!receiptRecord}
          onClose={() => setReceiptRecord(null)}
          order={{
            id: receiptRecord.id,
            orderNumber: receiptRecord.orderNumber || `MO-${receiptRecord.id.slice(0, 6)}`,
            lotCode: receiptRecord.lotCode || "CL-2026-00021",
            buyer: receiptRecord.buyerName || "Verified Buyer",
            product: "Cassava Tubers",
            weightKg: receiptRecord.weightKg,
            date: receiptRecord.dispatchedAt || "Today",
            status: receiptRecord.status as any,
            paymentMade: true,
            agreedPriceTotal: receiptRecord.weightKg * 140,
            pricePerKg: 140,
            pickupHub: receiptRecord.pickupHub,
            carrier: receiptRecord.carrierName,
            trackingNumber: receiptRecord.trackingNumber || receiptRecord.trackingCode,
            weighbridgeTicket: receiptRecord.weighbridgeTicket,
          } as any}
          onDownloadReceipt={() => {
            if (typeof window !== "undefined") {
              window.print();
            }
          }}
        />
      )}
    </div>
  );
}