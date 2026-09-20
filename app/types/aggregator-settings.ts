export interface AggregatorSettings {
  id?: string;
  aggregatorId?: string;
  businessName?: string;
  warehouseAddress?: string;
  notificationEmail?: string;
  autoAssignBatches?: boolean;
  settlementFrequency?: string;
  [key: string]: unknown;
}

export interface UpdateAggregatorSettingsPayload {
  businessName?: string;
  warehouseAddress?: string;
  notificationEmail?: string;
  autoAssignBatches?: boolean;
  settlementFrequency?: string;
  [key: string]: unknown;
}