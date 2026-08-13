"use client";

import React, { useMemo, useState } from "react";
import DispatchOrderFilterTabs, { DispatchOrderTab } from "./DispatchOrderFilter";
import DispatchOrderTable from "./DispatchOrderTable";
import Pagination from "./Pagination";
import DispatchOrderDetailModal from "./DispatchOrderDetailModel";
import DispatchReceiptModal from "./DispatchReceiptModal";
import AssignToStorageModal from "./AssignStorageModal";
import AssignToVaultModal from "./AssignToVaultModal";
import type { DispatchOrderRecord } from "./types";
import type { DispatchLogisticsValues } from "@/app/components/validation/schema";

const PER_PAGE = 5;

// Sample data standing in for a real "fetch dispatch orders" call.
// 4 pending + 5 dispatched + 3 in-transit = 12 total, matching the "All (12)" tab count.
const ORDERS: DispatchOrderRecord[] = [
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
];

export default function DispatchOrderSection() {
  const [activeTab, setActiveTab] = useState<DispatchOrderTab>("all");
  const [page, setPage] = useState(1);

  type ModalKind = "details" | "receipt" | "assign-storage" | "assign-vault" | null;
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
    // Replace with your real "confirm dispatch" call, e.g.:
    // await fetch(`/api/aggregator/orders/${order.orderNumber}/dispatch`, {
    //   method: "POST",
    //   body: JSON.stringify(values),
    // });
    console.log("Confirm dispatch", order.orderNumber, values);
    // Swap straight to the receipt modal for the same order, mirroring the
    // "Order dispatched successfully!" flow in the mock.
    setActiveModal("receipt");
  };

  const handleIssueReceipt = async (
    order: DispatchOrderRecord,
    values: DispatchLogisticsValues
  ) => {
    // Replace with your real "issue receipt" call.
    console.log("Issue receipt", order.orderNumber, values);
  };

  const handleDownloadReceipt = (order: DispatchOrderRecord) => {
    // Replace with your real "download receipt PDF" call.
    console.log("Download receipt for", order.orderNumber);
  };

  const handleAssignStorage = (
    order: DispatchOrderRecord,
    batchIds: string[],
    unitId: string
  ) => {
    // Replace with your real "assign batches to storage unit" call.
    console.log("Assign storage for order", order.orderNumber, batchIds, unitId);
    closeModal();
  };

  const handleAssignVault = (
    order: DispatchOrderRecord,
    batchIds: string[],
    vaultId: string
  ) => {
    // Replace with your real "confirm consolidation and dispatch" call.
    console.log("Assign vault for order", order.orderNumber, batchIds, vaultId);
    closeModal();
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900">Dispatch Order</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage orders, storage assignments, and deliveries
      </p>

      <div className="mt-6">
        <DispatchOrderFilterTabs counts={counts} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      <div className="mt-6">
        <DispatchOrderTable
          orders={pageItems}
          onAssignStorage={(order) => openModal("assign-storage", order)}
          onAssignVault={(order) => openModal("assign-vault", order)}
          onViewDetails={(order) => openModal("details", order)}
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

      <DispatchOrderDetailModal
        order={modalOrder}
        open={activeModal === "details"}
        onClose={closeModal}
        onConfirmDispatch={handleConfirmDispatch}
        onIssueReceipt={handleIssueReceipt}
      />

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
        onConfirm={handleAssignVault}
      />
    </>
  );
}