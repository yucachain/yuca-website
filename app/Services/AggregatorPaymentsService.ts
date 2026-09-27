import {
  SellerPayoutInfo,
  ProcessPayoutPayload,
  ProcessPayoutResponse,
  AggregatorFinancialStats,
  Transaction,
  TransactionType,
} from '@/app/types/Payments/aggregator-payments';

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

export const AggregatorPaymentsApi = {
  /**
   * GET /api/v1/payments/sellers-payouts
   * Aggregator lists registered sellers (Farmers, Buyers, Providers) with pending/settled balances
   */
  getSellersPayouts: (): Promise<SellerPayoutInfo[]> => {
    return fetcher<SellerPayoutInfo[]>('/payments/sellers-payouts', {
      method: 'GET',
    });
  },

  /**
   * POST /api/v1/payments/payouts/process
   * Triggers a payout settlement to a seller's bank account
   */
  processPayout: (
    payload: ProcessPayoutPayload
  ): Promise<ProcessPayoutResponse> => {
    return fetcher<ProcessPayoutResponse>('/payments/payouts/process', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET /api/v1/payments/stats
   * Returns Aggregator financial overview: total revenue, escrow volume, storage fees collected
   */
  getFinancialStats: (): Promise<AggregatorFinancialStats> => {
    return fetcher<AggregatorFinancialStats>('/payments/stats', {
      method: 'GET',
    });
  },

  /**
   * GET /api/v1/payments/transactions
   * Lists ledger transactions, filterable by type
   */
  getTransactions: (typeFilter?: TransactionType): Promise<Transaction[]> => {
    const query = typeFilter ? `?type=${encodeURIComponent(typeFilter)}` : '';
    return fetcher<Transaction[]>(`/payments/transactions${query}`, {
      method: 'GET',
    });
  },

  /**
   * GET /api/v1/payments/transactions/{id}
   * Retrieves transaction receipt details and payment reference
   */
  getTransactionById: (id: string): Promise<Transaction> => {
    return fetcher<Transaction>(`/payments/transactions/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  },
};