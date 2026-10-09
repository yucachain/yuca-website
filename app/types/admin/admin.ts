// Shared & Miscellaneous Types
export type UserStatus =
  | 'PendingVerification'
  | 'Active'
  | 'Suspended'
  | 'Deleted'
  | 'Pending'
  | 'Inactive'
  | string;

export type UserType =
  | 'Global'
  | 'Farmer'
  | 'Aggregator'
  | 'VaultOperator'
  | 'Buyer'
  | 'Isp'
  | string;

export type SettlementFrequency = 'Instant' | 'Daily' | 'Weekly' | string;

export interface AdminOverviewStats {
  totalUsers: number;
  totalMarketOrders: number;
  totalDispatches: number;
  totalPayouts: number;
  revenue: number;
}

export interface User {
  id: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  userType?: string | number | { id?: number; name?: string };
  userRole?: string;
  status: UserStatus;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  location?: string;
  state?: string;
  lga?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  createdAt?: string;
  createdDate?: string;
}

export interface AdminGetUsersParams {
  search?: string;
  userType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface UpdateAdminUserStatusRequest {
  status: UserStatus;
  reason?: string;
}

export interface AdminGetMarketOrdersParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface MarketOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  buyer?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  deliveryLocation?: string;
  productName?: string;
  grade?: string;
  neededKg?: number;
  pricePerKg?: number;
  paymentStatus?: string;
  batches?: any[];
  [key: string]: any;
}

export interface ConsolidateMarketOrdersRequest {
  orderIds: string[];
  storageUnitId?: string;
  qualityGrade?: string;
  lotCode?: string;
  destinationVaultId?: string;
}

export interface AdminCreateDispatchRequest {
  orderId?: string;
  marketplaceOrderId?: string;
  storageUnitId?: string;
  vaultLotId?: string;
  carrierName?: string;
  trackingCode?: string;
  weighbridgeTicket?: string;
  pickupLocation?: string;
  deliveryAddress?: string;
  weightKg?: number;
  // Backward compatibility
  orderIds?: string[];
  carrierId?: string;
  scheduledPickupDate?: string;
  destinationAddress?: string;
}

export interface Payout {
  id: string;
  orderId?: string;
  sellerId?: string;
  payeeUserId?: string;
  recipientName?: string;
  sellerName?: string;
  amount: number;
  status: 'Pending' | 'Disbursed' | 'Failed' | string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  requestedAt?: string;
  createdAt?: string;
  disbursedAt?: string;
  transactionReference?: string;
  productTitle?: string;
  orderNumber?: string;
  [key: string]: any;
}

export interface PlatformAdminSettings {
  escrowFeePercent?: number;
  logisticsPerKmRate?: number;
  cassavaPricePerTonFloor?: number;
  payoutAutomationEnabled?: boolean;
  platformCommissionPercent?: number;
  defaultLogisticsFeeNgn?: number;
  spoilageRiskThresholdHours?: number;
  maintenanceMode?: boolean;
  supportEmail?: string;
  supportPhone?: string;
  [key: string]: any;
}

export interface AdminSettings extends PlatformAdminSettings {
  businessName?: string;
  hubName?: string;
  hubId?: string;
  licenseNumber?: string;
  hubState?: string;
  hubLga?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  maxCapacityTonnes?: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  settlementFrequency?: SettlementFrequency;
  spoilageAlertsEmail?: boolean;
  orderAlertsSms?: boolean;
  twoFactorEnabled?: boolean;
}

export type UpdateAdminSettingsRequest = PlatformAdminSettings;

export type MiscellaneousItem =
  | string
  | {
      id?: string | number;
      name?: string;
      value?: string;
      label?: string;
      description?: string;
      [key: string]: any;
    };

export type UserTypeItem = MiscellaneousItem;
export type OrderStatusItem = MiscellaneousItem;