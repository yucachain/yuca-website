export type TransactionType =
  | 'Marketplace Sale'
  | 'Seller Payout'
  | 'Vault Storage Fee'
  | 'Escrow Held'
  | 'Completed'
  | string;

export interface SellerPayoutInfo {
  sellerId: string;
  sellerName: string;
  sellerType: 'Farmer' | 'Buyer' | 'Provider' | string;
  pendingBalance: number;
  settledBalance: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  [key: string]: unknown;
}

export interface ProcessPayoutPayload {
  sellerId: string;
  amount: number;
  bankCode?: string;
  accountNumber?: string;
  [key: string]: unknown;
}

export interface ProcessPayoutResponse {
  success: boolean;
  payoutId: string;
  message?: string;
  [key: string]: unknown;
}

export interface AggregatorFinancialStats {
  totalRevenue: number;
  escrowVolume: number;
  storageFeesCollected: number;
  pendingPayoutsTotal?: number;
  [key: string]: unknown;
}

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  type: TransactionType;
  status: string;
  createdAt: string;
  description?: string;
  [key: string]: unknown;
}