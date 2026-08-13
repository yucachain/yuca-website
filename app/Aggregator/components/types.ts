import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Notifications                                                       */
/* ------------------------------------------------------------------ */

export type NotificationType =
  | "batch-received"
  | "storage-assigned"
  | "dispatch"
  | "market-order"
  | "alert"
  | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface AggregatorUser {
  initials: string;
  name: string;
  role: string;
}

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  icon: ReactNode;
  trendDirection: "up" | "down";
  trendPercent: number;
  trendLabel: string;
}

export interface ActivityItem {
  id: string;
  description: string;
  time: string;
}

export type BatchStatus = "Assign Storage" | "In Storage" | "Pending Transfer";

export interface BatchRow {
  id: string;
  batchCode: string;
  seller: string;
  weightKg: number;
  status: BatchStatus;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
}

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
}

/* ------------------------------------------------------------------ */
/*  Assign to Storage                                                   */
/* ------------------------------------------------------------------ */

export type IntakeBatchStatus = "Aggregated" | "Harvested";

export interface IntakeBatch {
  id: string;
  code: string;
  weightKg: number;
  status: IntakeBatchStatus;
  harvestDate: string;
  /** e.g. "5h – urgent: assign to storage" */
  urgentNote?: string;
}

export interface StorageUnit {
  id: string;
  name: string;
  /** e.g. "YucaVault #1 Ilorin-OO14" */
  facilityLabel: string;
  usedKg: number;
  capacityKg: number;
  status: "active" | "offline";
}

/* ------------------------------------------------------------------ */
/*  Dispatch Order                                                      */
/* ------------------------------------------------------------------ */
 
export interface DispatchOrderSummary {
  orderNumber: string;
  lotCode: string;
  buyer: string;
  paymentMade: boolean;
  agreedPriceTotal: number;
  pricePerKg: number;
  lotWeightKg: number;
  /** The YucaVault or hub that is dispatching / releasing the product */
  pickupHub?: string;
  /** Buyer's company/delivery address */
  buyerDeliveryAddress?: string;
}
 
export type DispatchOrderStatus = "pending" | "dispatched" | "in-transit";
 
/**
 * A full dispatch order record: the fields shown in the orders table
 * (Batch Code, Buyer, Product, Weight, Date, Status, Storage) plus the
 * extra fields needed to render the detail view (OrderSummaryCard) once
 * a row is clicked into.
 */
export interface DispatchOrderRecord {
  id: string;
  orderNumber: string;
  lotCode: string;
  buyer: string;
  product: string;
  weightKg: number;
  date: string;
  status: DispatchOrderStatus;
  /** null/undefined = "Not Assigned" */
  storageLabel?: string;
  // Detail-view-only fields
  paymentMade: boolean;
  agreedPriceTotal: number;
  pricePerKg: number;
  /** The YucaVault or hub that is dispatching / releasing the product */
  pickupHub?: string;
  /** Buyer's company/delivery address */
  buyerDeliveryAddress?: string;
}

/* ------------------------------------------------------------------ */
/*  Market Orders                                                       */
/* ------------------------------------------------------------------ */

export type MarketOrderTab =
  | "all"
  | "pending"
  | "assigned"
  | "in-transit"
  | "fulfilled";

export type BatchGrade = "A" | "B" | "C";

export interface OrderBatchRow {
  id: string;
  batchCode: string;
  farmer: string;
  weightKg: number;
  grade: BatchGrade;
}

export interface MarketOrder {
  id: string;
  orderNumber: string;
  buyer: string;
  neededKg: number;
  selectedKg: number;
  /** e.g. "Pending Consolidation" - the badge text shown on the card */
  statusLabel: string;
  tab: Exclude<MarketOrderTab, "all">;
  batches: OrderBatchRow[];
}

/* ------------------------------------------------------------------ */
/*  Sellers & Payouts                                                   */
/* ------------------------------------------------------------------ */
 
export type SellerCategory = "farmer" | "buyer-processor" | "service-provider";
 
export interface Seller {
  id: string;
  name: string;
  location: string;
  phone: string;
  rating: number;
  category: SellerCategory;
  bankName: string;
  accountNumber: string;
  accountName: string;
}
 
/* ------------------------------------------------------------------ */
/*  Consolidate to Vault                                               */
/* ------------------------------------------------------------------ */
 
export interface ConsolidationBatch {
  id: string;
  batchCode: string;
  farmer: string;
  grade: BatchGrade;
  weightKg: number;
  selected: boolean;
}
 
export interface VaultOption {
  id: string;
  name: string;
  location: string;
  /** in tonnes */
  availableTonnes: number;
  capacityTonnes: number;
}