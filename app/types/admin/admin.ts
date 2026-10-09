// Shared & Miscellaneous Types
export type UserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Pending';
export type SettlementFrequency = 'Instant' | 'Daily' | 'Weekly';

export interface AdminOverviewStats {
  totalUsers: number;
  totalMarketOrders: number;
  totalDispatches: number;
  totalPayouts: number;
  revenue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: string;
}

export interface UpdateAdminUserStatusRequest {
  status: UserStatus;
  reason?: string;
}

export interface MarketOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface ConsolidateMarketOrdersRequest {
  orderIds: string[];
  destinationVaultId?: string;
}

export interface AdminCreateDispatchRequest {
  orderIds: string[];
  carrierId: string;
  scheduledPickupDate: string;
  destinationAddress: string;
}

export interface Payout {
  id: string;
  sellerId: string;
  amount: number;
  status: 'Pending' | 'Disbursed' | 'Failed';
  requestedAt: string;
}

export interface AdminSettings {
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
  settlementFrequency: SettlementFrequency;
  spoilageAlertsEmail: boolean;
  orderAlertsSms: boolean;
  twoFactorEnabled: boolean;
}

export type UpdateAdminSettingsRequest = Partial<AdminSettings>;

export type MiscellaneousItem = string | {
  id?: string | number;
  name?: string;
  value?: string;
  label?: string;
  description?: string;
  [key: string]: any;
};

export type UserTypeItem = MiscellaneousItem;
export type OrderStatusItem = MiscellaneousItem;