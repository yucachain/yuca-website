import {
  InitializePaymentPayload,
  InitializePaymentResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
  UserTransaction,
} from '@/app/types/Payments/marketplace-payments';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/backend-api/api/v1';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const MarketplacePaymentsApi = {
  /**
   * POST /api/v1/payments/initialize
   * Initializes a payment gateway transaction (card, bank transfer, Paystack, Flutterwave).
   * Used by: Website, Mobile App
   */
  initializePayment: (
    payload: InitializePaymentPayload
  ): Promise<InitializePaymentResponse> => {
    return fetcher<InitializePaymentResponse>('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * POST /api/v1/payments/verify
   * Verifies a payment callback/webhook and places confirmed funds into escrow.
   * Used by: Website, Mobile App
   */
  verifyPayment: (
    payload: VerifyPaymentPayload
  ): Promise<VerifyPaymentResponse> => {
    return fetcher<VerifyPaymentResponse>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET /api/v1/payments/transactions
   * Lists ledger transactions for the logged-in web user.
   * Used by: Website, Mobile App
   */
  getUserTransactions: (): Promise<UserTransaction[]> => {
    return fetcher<UserTransaction[]>('/payments/transactions', {
      method: 'GET',
    });
  },

  /**
   * GET /api/v1/payments/transactions/{id}
   * Retrieves specific transaction receipt details by ID.
   * Used by: Website, Mobile App
   */
  getTransactionById: (id: string): Promise<UserTransaction> => {
    return fetcher<UserTransaction>(`/payments/transactions/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  },
};