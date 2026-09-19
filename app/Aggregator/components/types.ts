import type { ReactNode } from "react";


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



export type IntakeBatchStatus = "Aggregated" | "Harvested";

export interface IntakeBatch {
  id: string;
  code: string;
  farmerName?: string;
  variety?: string;
  location?: string;
  qualityGrade?: "A" | "B" | "C";
  weightKg: number;
  status: IntakeBatchStatus;
  harvestDate: string;
  urgentNote?: string;
}

export interface StorageUnit {
  id: string;
  name: string;
  facilityLabel: string;
  usedKg: number;
  capacityKg: number;
  status: "active" | "offline";
}


export interface DispatchOrderSummary {
  orderNumber: string;
  lotCode: string;
  buyer: string;
  paymentMade: boolean;
  agreedPriceTotal: number;
  pricePerKg: number;
  lotWeightKg: number;
  pickupHub?: string;
  buyerDeliveryAddress?: string;
}

export type DispatchOrderStatus = "pending" | "dispatched" | "in-transit";

export interface DispatchOrderRecord {
  id: string;
  orderNumber: string;
  lotCode: string;
  buyer: string;
  product: string;
  weightKg: number;
  date: string;
  status: DispatchOrderStatus;
  storageLabel?: string;
  paymentMade: boolean;
  agreedPriceTotal: number;
  pricePerKg: number;
  pickupHub?: string;
  buyerDeliveryAddress?: string;
}


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
  buyerEmail?: string;
  buyerPhone?: string;
  deliveryLocation?: string;
  productName?: string;
  grade?: BatchGrade;
  neededKg: number;
  selectedKg: number;
  pricePerKg?: number;
  totalPrice?: number;
  paymentStatus?: "Escrow Paid" | "Credit Approved" | "Pending Payment";
  acceptedDate?: string;
  statusLabel: string;
  tab: Exclude<MarketOrderTab, "all">;
  batches: OrderBatchRow[];
}

export type TransactionType =
  | "Marketplace Sale"
  | "Seller Payout"
  | "Vault Storage Fee";

export type TransactionStatus = "Completed" | "Escrow Held" | "Processing" | "Failed";

export interface TransactionRecord {
  id: string;
  referenceNo: string;
  date: string;
  type: TransactionType;
  partyName: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: TransactionStatus;
}


export interface AggregatorSettings {
  businessName?: string;
  hubName: string;
  hubId: string;
  licenseNumber: string;
  hubState?: string;
  hubLga?: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  maxCapacityTonnes: number;
  spoilageRiskThresholdHours: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  settlementFrequency: "Instant" | "Daily" | "Weekly";
  spoilageAlertsEmail: boolean;
  orderAlertsSms: boolean;
  twoFactorEnabled: boolean;
}


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
  availableTonnes: number;
  capacityTonnes: number;
}