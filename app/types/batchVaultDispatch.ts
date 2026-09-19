export type BatchStatus =
  | "Harvested"
  | "Aggregated"
  | "In Storage"
  | "Listed"
  | "Sold";

export interface BatchTimelineEntry {
  status: string;
  timestamp: string;
  note?: string;
  location?: string;
}

export interface BatchEnvironmentalMetrics {
  temperatureC?: number;
  humidityPercent?: number;
  ambientHours?: number;
}

export interface BatchRecord {
  id: string;
  batchCode: string;
  farmerName?: string;
  farmer?: string;
  sellerName?: string;
  sellerId?: string;
  status: BatchStatus;
  weightKg: number;
  estWeightKg?: number;
  verifiedWeightKg?: number;
  qualityGrade?: "A" | "B" | "C" | "reject";
  moistureContent?: number;
  urgentStorageFlag?: boolean;
  vaultLotId?: string;
  vaultId?: string;
  vaultName?: string;
  hubId?: string;
  pricePerTonne?: number;
  pricePerKg?: number;
  destination?: string;
  harvestDate?: string;
  createdAt?: string;
  updatedAt?: string;
  timeline?: BatchTimelineEntry[];
  metrics?: BatchEnvironmentalMetrics;
}

export interface BatchIntakeRequest {
  verifiedWeight: number;
  qualityGrade: "A" | "B" | "C";
  moistureContent?: number;
  urgentStorageFlag?: boolean;
  notes?: string;
}

export interface AssignStorageRequest {
  vaultId: string;
  hubId?: string;
  unitCode?: string;
}

export interface UpdatePricingRequest {
  pricePerTonne: number;
  destination?: string;
}

export interface VaultUnit {
  id: string;
  unitCode: string;
  unitType: string;
  location: string;
  state: string;
  lga: string;
  latitude?: number;
  longitude?: number;
  capacityKg: number;
  usedWeightKg?: number;
  availableKg?: number;
  status: string;
  temperatureC?: number;
  humidityPercent?: number;
  batches?: BatchRecord[];
}

export interface CreateVaultUnitRequest {
  unitCode: string;
  unitType: "YucaVault" | string;
  location: string;
  state: string;
  lga: string;
  latitude: number;
  longitude: number;
  capacityKg: number;
}

export interface ConsolidateVaultRequest {
  batchIds: string[];
  storageUnitId: string;
  qualityGrade: "A" | "B" | "C";
  lotCode: string;
}

export interface VaultLot {
  id: string;
  lotCode: string;
  storageUnitId: string;
  storageUnitName?: string;
  qualityGrade: "A" | "B" | "C";
  totalWeightKg: number;
  batchCount?: number;
  batchIds?: string[];
  status?: string;
  createdAt?: string;
}

export interface SpoilageAlert {
  id?: string;
  batchId: string;
  batchCode: string;
  hoursInTransit?: number;
  ambientHours?: number;
  temperatureC?: number;
  riskLevel?: "low" | "medium" | "high" | "critical";
  message: string;
  recommendedAction?: string;
}

export type DispatchStatus =
  | "pending"
  | "dispatched"
  | "in-transit"
  | "delivered";

export interface DispatchReceiptData {
  receiptNumber: string;
  issuedAt: string;
  pickupLocation: string;
  carrier: string;
  trackingNumber: string;
  totalWeightKg: number;
  weighbridgeTicket: string;
  authorizedSigner?: string;
}

export interface DispatchRecord {
  id: string;
  dispatchCode?: string;
  trackingNumber?: string;
  trackingCode?: string;
  orderId?: string;
  orderNumber?: string;
  lotCode?: string;
  buyerName?: string;
  buyerDeliveryAddress: string;
  pickupHub: string;
  carrierName: string;
  weighbridgeTicket: string;
  weightKg: number;
  status: DispatchStatus;
  estimatedDelivery?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  receiptData?: DispatchReceiptData;
}

export interface CreateDispatchRequest {
  pickupHub: string;
  carrierName: string;
  trackingNumber: string;
  weighbridgeTicket: string;
  buyerDeliveryAddress: string;
  orderId?: string;
  vaultLotId?: string;
  batchIds?: string[];
  weightKg?: number;
}

export interface UpdateDispatchStatusRequest {
  status: DispatchStatus;
}

export interface TrackDispatchResult {
  dispatch: DispatchRecord;
  currentLocation?: string;
  timeline: Array<{
    status: string;
    time: string;
    location?: string;
    description?: string;
  }>;
  canConfirmReceipt?: boolean;
}
