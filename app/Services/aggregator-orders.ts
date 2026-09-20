import {
  MarketOrder,
  AssignBatchesPayload,
  UpdateMarketOrderStatusPayload,
  GenericResponse,
} from '@/app/types/aggregator-orders';

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

export const AggregatorOrdersApi = {
  /**
   * GET /api/v1/aggregator/market-orders
   * Fetch all aggregator market orders
   */
  getMarketOrders: (): Promise<MarketOrder[]> => {
    return fetcher<MarketOrder[]>('/aggregator/market-orders', {
      method: 'GET',
    });
  },

  /**
   * PUT /api/v1/aggregator/market-orders/{id}/assign-batches
   * Assign batches to a market order
   */
  assignBatches: (
    id: string,
    payload: AssignBatchesPayload
  ): Promise<MarketOrder> => {
    return fetcher<MarketOrder>(
      `/aggregator/market-orders/${encodeURIComponent(id)}/assign-batches`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * PUT /api/v1/aggregator/market-orders/{id}/status
   * Update market order status
   */
  updateOrderStatus: (
    id: string,
    payload: UpdateMarketOrderStatusPayload
  ): Promise<GenericResponse> => {
    return fetcher<GenericResponse>(
      `/aggregator/market-orders/${encodeURIComponent(id)}/status`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },
};