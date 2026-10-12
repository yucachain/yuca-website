/**
 * Types for YucaChain Marketplace Payments API
 * Endpoints:
 * - POST /api/v1/payments/initialize
 * - POST /api/v1/payments/verify
 * - GET  /api/v1/payments/transactions
 * - GET  /api/v1/payments/transactions/{id}
 * - GET  /api/v1/payments/sellers-payouts
 * - POST /api/v1/payments/payouts/process
 * - GET  /api/v1/payments/stats
 */

export interface InitializePaymentPayload {
  orderId: string;
  marketplaceOrderId: string;
  amount: number;
  paymentMethod: "BankTransfer" | "Card" | "USSD" | string;
  provider: "Paystack" | "Stub" | string;
  callbackUrl?: string;
  customerEmail: string;
  customerName: string;
  [key: string]: unknown;
}

export interface InitializePaymentResponse {
  reference: string;
  amount?: number;
  authorizationUrl?: string;
  paymentUrl?: string; // Redirect URL to Paystack checkout
  checkoutUrl?: string;
  accessCode?: string;
  provider?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export interface VerifyPaymentPayload {
  reference: string;
  provider?: "Paystack" | "Stub" | string;
  [key: string]: unknown;
}

export interface VerifyPaymentResponse {
  success?: boolean;
  status: string;
  reference?: string;
  transactionId?: string;
  amount?: number;
  escrowStatus?: string;
  message?: string;
  data?: unknown;
  [key: string]: unknown;
}

export interface UserTransaction {
  id: string;
  reference: string;
  amount: number;
  type: string; // e.g. "Marketplace Sale", "Escrow Held", "Debit", "Credit"
  status: string;
  createdAt: string;
  currency?: string;
  description?: string;
  channel?: string;
  customerEmail?: string;
  customerName?: string;
  [key: string]: unknown;
}

export interface SellerPayoutItem {
  id: string;
  payoutId?: string;
  payeeUserId: string;
  sellerName?: string;
  sellerEmail?: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  currency?: string;
  status: "Pending" | "Processing" | "Paid" | "Failed" | string;
  provider?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  createdAt?: string;
  processedAt?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface ProcessPayoutPayload {
  payeeUserId: string;
  amount: number;
  provider?: "Paystack" | "Stub" | string;
  payoutId?: string;
  orderId?: string;
  [key: string]: unknown;
}

export interface ProcessPayoutResponse {
  success?: boolean;
  status: string;
  payoutId?: string;
  transactionReference?: string;
  message?: string;
  [key: string]: unknown;
}

export interface PaymentStatsResponse {
  totalProcessed?: number;
  totalVolume?: number;
  escrowBalance?: number;
  escrowHeld?: number;
  totalTransactions?: number;
  successfulTransactions?: number;
  totalPayouts?: number;
  pendingPayoutsCount?: number;
  pendingPayoutsAmount?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface PaymentMethodItem {
  id: number;
  name: string;
  description: string;
  [key: string]: unknown;
}

export interface PaymentProviderItem {
  id: number;
  name: string;
  description: string;
  [key: string]: unknown;
}

export interface PaymentStatusItem {
  id: number;
  name: string;
  description: string;
  [key: string]: unknown;
}