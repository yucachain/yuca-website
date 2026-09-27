export interface MarketOrder {
  id: string;
  orderNumber?: string;
  buyerName?: string;
  totalQuantity?: number;
  status: string;
  assignedBatches?: string[];
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface AssignBatchesPayload {
  batchIds: string[];
  [key: string]: unknown;
}

export interface UpdateMarketOrderStatusPayload {
  status: string; // e.g., 'PROCESSING', 'FULFILLED', 'CANCELLED'
  reason?: string;
  [key: string]: unknown;
}

export interface GenericResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}