import {
  AdminOverviewStats,
  User,
  UpdateAdminUserStatusRequest,
  MarketOrder,
  ConsolidateMarketOrdersRequest,
  AdminCreateDispatchRequest,
  Payout,
  UpdateAdminSettingsRequest,
} from '@/app/types/admin/admin';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://1kjmjs7h-5130.uks1.devtunnels.ms';

/**
 * Helper function to send authenticated fetch requests
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Retrieve token (e.g. from localStorage, cookies, or session store)
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ==================== ADMIN API ENDPOINTS ====================

export const AdminApiService = {
  /**
   * 1. GET /api/v1/admin/overview/stats
   * Fetch overview statistics for the admin dashboard
   */
  getOverviewStats: (): Promise<AdminOverviewStats> => {
    return apiFetch<AdminOverviewStats>('/api/v1/admin/overview/stats', {
      method: 'GET',
    });
  },

  /**
   * 2. GET /api/v1/admin/users
   * Get all registered users
   */
  getUsers: (): Promise<User[]> => {
    return apiFetch<User[]>('/api/v1/admin/users', { method: 'GET' });
  },

  /**
   * 3. PUT /api/v1/admin/users/{id}/status
   * Update a specific user's status (e.g. activate, suspend)
   */
  updateUserStatus: (
    userId: string,
    payload: UpdateAdminUserStatusRequest
  ): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>(
      `/api/v1/admin/users/${userId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 4. GET /api/v1/admin/market-orders
   * Retrieve all market orders
   */
  getMarketOrders: (): Promise<MarketOrder[]> => {
    return apiFetch<MarketOrder[]>('/api/v1/admin/market-orders', {
      method: 'GET',
    });
  },

  /**
   * 5. POST /api/v1/admin/market-orders/consolidate
   * Consolidate multiple market orders
   */
  consolidateMarketOrders: (
    payload: ConsolidateMarketOrdersRequest
  ): Promise<{ success: boolean; consolidatedOrderId: string }> => {
    return apiFetch('/api/v1/admin/market-orders/consolidate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 6. POST /api/v1/admin/dispatch-orders
   * Dispatch consolidated orders
   */
  dispatchOrders: (
    payload: AdminCreateDispatchRequest
  ): Promise<{ success: boolean; dispatchId: string }> => {
    return apiFetch('/api/v1/admin/dispatch-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 7. GET /api/v1/admin/payouts
   * Fetch all seller payouts
   */
  getPayouts: (): Promise<Payout[]> => {
    return apiFetch<Payout[]>('/api/v1/admin/payouts', { method: 'GET' });
  },

  /**
   * 8. POST /api/v1/admin/payouts/{payoutId}/disburse
   * Disburse funds for a specific payout
   */
  disbursePayout: (
    payoutId: string
  ): Promise<{ success: boolean; transactionReference: string }> => {
    return apiFetch(`/api/v1/admin/payouts/${payoutId}/disburse`, {
      method: 'POST',
    });
  },

  /**
   * 9. GET /api/v1/admin/settings
   * Retrieve administrative settings
   */
  getSettings: (): Promise<Record<string, any>> => {
    return apiFetch('/api/v1/admin/settings', { method: 'GET' });
  },

  /**
   * 10. PUT /api/v1/admin/settings
   * Update administrative settings
   */
  updateSettings: (
    payload: UpdateAdminSettingsRequest
  ): Promise<{ success: boolean; message: string }> => {
    return apiFetch('/api/v1/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};