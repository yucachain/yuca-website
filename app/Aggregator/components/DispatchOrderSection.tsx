"use client";

import React, { useMemo, useState } from "react";
import { Layers, X } from "lucide-react";
import DispatchOrderFilterTabs, { DispatchOrderTab } from "./DispatchOrderFilter";
import DispatchOrderTable from "./DispatchOrderTable";
import Pagination from "./Pagination";
import DispatchReceiptModal from "./DispatchReceiptModal";
import AssignToStorageModal from "./AssignStorageModal";
import AssignToVaultModal from "./AssignToVaultModal";
import ConsolidateOrdersModal from "./ConsolidateOrdersModal";
import type { DispatchOrderRecord } from "./types";
import type { DispatchLogisticsValues } from "@/app/components/validation/schema";

const PER_PAGE = 5;

// ── Test data: 3 buyers × 3 orders each (Agbetoba Farms, Greenland Farms, Grando Ltd)
// plus several single-order buyers = 15 total orders
const ORDERS: DispatchOrderRecord[] = [
  // ── Agbetoba Farms (3 orders) ─────────────────────────────
  {
    id: "1",
    orderNumber: "MO-2026-014",
    lotCode: "CL-2026-00031",
    buyer: "Agbetoba Farms",
    product: "Cassava Stems",
    weightKg: 11300,
    date: "Aug 27, 2026",
    status: "pending",
    paymentMade: true,
    agreedPriceTotal: 3955000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "5",
    orderNumber: "MO-2026-016",
    lotCode: "CL-2026-00027",
    buyer: "Agbetoba Farms",
    product: "Cassava Stems",
    weightKg: 2000,
    date: "May 27, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 700000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "13",
    orderNumber: "MO-2026-051",
    lotCode: "CL-2026-00071",
    buyer: "Agbetoba Farms",
    product: "Cassava Flour",
    weightKg: 6400,
    date: "Aug 5, 2026",
    status: "pending",
    paymentMade: true,
    agreedPriceTotal: 2240000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  // ── Greenland Farms (3 orders) ────────────────────────────
  {
    id: "2",
    orderNumber: "MO-2026-112",
    lotCode: "CL-2026-00045",
    buyer: "Greenland Farms",
    product: "Cassava Flour",
    weightKg: 13000,
    date: "Aug 12, 2026",
    status: "pending",
    paymentMade: false,
    agreedPriceTotal: 4550000,
    pricePerKg: 350,
    pickupHub: "YucaVault #3, Ibadan",
  },
  {
    id: "12",
    orderNumber: "MO-2026-039",
    lotCode: "CL-2026-00057",
    buyer: "Greenland Farms",
    product: "Cassava Stems",
    weightKg: 4800,
    date: "Jul 5, 2026",
    status: "pending",
    paymentMade: false,
    agreedPriceTotal: 1680000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "14",
    orderNumber: "MO-2026-056",
    lotCode: "CL-2026-00074",
    buyer: "Greenland Farms",
    product: "Cassava Starch",
    weightKg: 7200,
    date: "Aug 9, 2026",
    status: "in-transit",
    storageLabel: "YucaVault #3, Ibadan",
    paymentMade: true,
    agreedPriceTotal: 2520000,
    pricePerKg: 350,
    pickupHub: "YucaVault #3, Ibadan",
  },
  // ── Grando Ltd (3 orders) ─────────────────────────────────
  {
    id: "3",
    orderNumber: "MO-2026-034",
    lotCode: "CL-2026-00052",
    buyer: "Grando Ltd",
    product: "Cassava Stems",
    weightKg: 5000,
    date: "Sep 27, 2026",
    status: "in-transit",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 1750000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "9",
    orderNumber: "MO-2026-028",
    lotCode: "CL-2026-00041",
    buyer: "Grando Ltd",
    product: "Cassava Flour",
    weightKg: 7000,
    date: "Feb 21, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #3, Ibadan",
    paymentMade: true,
    agreedPriceTotal: 2450000,
    pricePerKg: 350,
    pickupHub: "YucaVault #3, Ibadan",
  },
  {
    id: "15",
    orderNumber: "MO-2026-063",
    lotCode: "CL-2026-00079",
    buyer: "Grando Ltd",
    product: "Cassava Stems",
    weightKg: 3800,
    date: "Aug 11, 2026",
    status: "pending",
    paymentMade: false,
    agreedPriceTotal: 1330000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  // ── Other buyers (single orders) ──────────────────────────
  {
    id: "4",
    orderNumber: "MO-2026-044",
    lotCode: "CL-2026-00061",
    buyer: "Penpal Farms",
    product: "Cassava Flour",
    weightKg: 11300,
    date: "Jul 27, 2026",
    status: "pending",
    paymentMade: false,
    agreedPriceTotal: 3955000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "6",
    orderNumber: "MO-2026-018",
    lotCode: "CL-2026-00029",
    buyer: "Nino Farms",
    product: "Cassava Stems",
    weightKg: 4200,
    date: "May 2, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #3, Ibadan",
    paymentMade: true,
    agreedPriceTotal: 1470000,
    pricePerKg: 350,
    pickupHub: "YucaVault #3, Ibadan",
  },
  {
    id: "7",
    orderNumber: "MO-2026-021",
    lotCode: "CL-2026-00033",
    buyer: "GoldenPearl Ltd",
    product: "Cassava Flour",
    weightKg: 6000,
    date: "Apr 18, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 2100000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "8",
    orderNumber: "MO-2026-025",
    lotCode: "CL-2026-00038",
    buyer: "Kays & Sons",
    product: "Cassava Stems",
    weightKg: 3300,
    date: "Mar 9, 2026",
    status: "dispatched",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 1155000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "10",
    orderNumber: "MO-2026-031",
    lotCode: "CL-2026-00047",
    buyer: "Green Valley",
    product: "Cassava Stems",
    weightKg: 9000,
    date: "Jun 14, 2026",
    status: "in-transit",
    storageLabel: "YucaVault #1, Ilorin",
    paymentMade: true,
    agreedPriceTotal: 3150000,
    pricePerKg: 350,
    pickupHub: "YucaVault #1, Ilorin",
  },
  {
    id: "11",
    orderNumber: "MO-2026-036",
    lotCode: "CL-2026-00054",
    buyer: "Nino Farms",
    product: "Cassava Flour",
    weightKg: 5500,
    date: "Jun 30, 2026",
    status: "in-transit",
    storageLabel: "YucaVault #3, Ibadan",
    paymentMade: true,
    agreedPriceTotal: 1925000,
    pricePerKg: 350,
    pickupHub: "YucaVault #3, Ibadan",
  },
];

export default function DispatchOrderSection() {
  const [activeTab, setActiveTab] = useState<DispatchOrderTab>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  type ModalKind = "receipt" | "assign-storage" | "assign-vault" | "consolidate" | null;
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [modalOrderId, setModalOrderId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: ORDERS.length,
      pending: ORDERS.filter((o) => o.status === "pending").length,
      dispatched: ORDERS.filter((o) => o.status === "dispatched").length,
      "in-transit": ORDERS.filter((o) => o.status === "in-transit").length,
    }),
    []
  );

  const filtered = useMemo(
    () => (activeTab === "all" ? ORDERS : ORDERS.filter((o) => o.status === activeTab)),
    [activeTab]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const startIndex = (page - 1) * PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + PER_PAGE);
  const rangeEnd = Math.min(startIndex + PER_PAGE, filtered.length);

  const modalOrder = ORDERS.find((o) => o.id === modalOrderId) ?? null;

  // Derive consolidation eligibility from current selection
  const selectedOrders = ORDERS.filter((o) => selectedIds.includes(o.id));
  const uniqueBuyers = [...new Set(selectedOrders.map((o) => o.buyer))];
  const canConsolidate = selectedOrders.length >= 2 && uniqueBuyers.length === 1;
  const mixedBuyers = selectedOrders.length >= 2 && uniqueBuyers.length > 1;

  const handleTabChange = (tab: DispatchOrderTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openModal = (kind: Exclude<ModalKind, null>, order: DispatchOrderRecord) => {
    setModalOrderId(order.id);
    setActiveModal(kind);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalOrderId(null);
  };

  const handleConfirmDispatch = async (
    order: DispatchOrderRecord,
    values: DispatchLogisticsValues
  ) => {
    console.log("Confirm dispatch", order.orderNumber, values);
    setActiveModal("receipt");
  };

  const handleDownloadReceipt = (order: DispatchOrderRecord) => {
    console.log("Download receipt for", order.orderNumber);
  };

  const handleAssignStorage = (
    order: DispatchOrderRecord,
    batchIds: string[],
    unitId: string
  ) => {
    console.log("Assign storage for order", order.orderNumber, batchIds, unitId);
    closeModal();
  };

  const handleConsolidateConfirm = (orders: DispatchOrderRecord[]) => {
    console.log("Consolidate orders", orders.map((o) => o.orderNumber));
    setSelectedIds([]);
    closeModal();
  };

  const showActionBar = selectedOrders.length >= 2;

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold text-gray-900">Dispatch Order</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage orders, storage assignments, and deliveries
      </p>

      {/* ── Filter row + Consolidate button ───────────────────────── */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <DispatchOrderFilterTabs counts={counts} activeTab={activeTab} onChange={handleTabChange} />

        <div className="flex shrink-0 items-center gap-2.5">
          {/* Selection hint */}
          {selectedOrders.length > 0 && (
            <span
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-medium",
                mixedBuyers
                  ? "bg-orange-50 text-orange-700"
                  : canConsolidate
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-gray-100 text-gray-500",
              ].join(" ")}
            >
              {mixedBuyers
                ? `${selectedOrders.length} selected · different buyers`
                : canConsolidate
                ? `${selectedOrders.length} orders · ${uniqueBuyers[0]}`
                : `${selectedOrders.length} selected`}
            </span>
          )}

          {/* Clear selection */}
          {selectedOrders.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              title="Clear selection"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={15} strokeWidth={2} />
            </button>
          )}

          {/* Consolidate button */}
          <button
            type="button"
            disabled={!canConsolidate}
            onClick={() => setActiveModal("consolidate")}
            title={
              !selectedOrders.length
                ? "Select 2 or more orders from the same buyer"
                : mixedBuyers
                ? "Orders must belong to the same buyer"
                : undefined
            }
            className={[
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
              canConsolidate
                ? "bg-[#215243] text-white hover:bg-[#1a4336]"
                : "cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400",
            ].join(" ")}
          >
            <Layers size={15} strokeWidth={1.8} />
            Consolidate Orders
          </button>
        </div>
      </div>

      <div className="mt-6">
        <DispatchOrderTable
          orders={pageItems}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onAssignStorage={(order) => openModal("assign-storage", order)}
          onAssignVault={(order) => openModal("assign-vault", order)}
          onViewReceipt={(order) => openModal("receipt", order)}
        />
      </div>

      {filtered.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            resultsLabel={`Showing ${startIndex + 1}-${rangeEnd} of ${filtered.length} Results`}
          />
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <DispatchReceiptModal
        order={modalOrder}
        open={activeModal === "receipt"}
        onClose={closeModal}
        onDownloadReceipt={handleDownloadReceipt}
      />

      <AssignToStorageModal
        order={modalOrder}
        open={activeModal === "assign-storage"}
        onClose={closeModal}
        onAssign={handleAssignStorage}
      />

      <AssignToVaultModal
        order={modalOrder}
        open={activeModal === "assign-vault"}
        onClose={closeModal}
        onConfirmDispatch={handleConfirmDispatch}
      />

      <ConsolidateOrdersModal
        orders={activeModal === "consolidate" ? selectedOrders : []}
        open={activeModal === "consolidate"}
        onClose={closeModal}
        onConfirm={handleConsolidateConfirm}
      />
    </div>
  );
}