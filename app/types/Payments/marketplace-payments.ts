export interface InitializePaymentPayload {
  orderId: string;
  amount: number;
  email: string;
  paymentProvider?: 'paystack' | 'flutterwave' | string;
  callbackUrl?: string;
  [key: string]: unknown;
}

export interface InitializePaymentResponse {
  paymentUrl: string; // The redirect URL to Paystack/Flutterwave checkout
  reference: string;
  status: string;
  [key: string]: unknown;
}

export interface VerifyPaymentPayload {
  reference: string;
  [key: string]: unknown;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  status: string;
  [key: string]: unknown;
}

export interface UserTransaction {
  id: string;
  reference: string;
  amount: number;
  type: string; // e.g., "Marketplace Sale", "Escrow Held"
  status: string;
  createdAt: string;
  description?: string;
  [key: string]: unknown;
}