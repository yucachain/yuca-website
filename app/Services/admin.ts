import {
  AdminOverviewStats,
  User,
  UpdateAdminUserStatusRequest,
  MarketOrder,
  ConsolidateMarketOrdersRequest,
  AdminCreateDispatchRequest,
  Payout,
  UpdateAdminSettingsRequest,
  UserTypeItem,
  OrderStatusItem,
} from '@/app/types/admin/admin';

import { getAuthToken } from '@/app/Services/tokenHelper';
import { refreshAccessToken } from '@/app/Services/authService';

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '/backend-api')
  .replace(/\/index\.html?$/i, '')
  .replace(/\/$/, '');

/**
 * Helper function to send authenticated fetch requests with auto-refresh on 401
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = getAuthToken();

  const getHeaders = (authToken: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  });

  const requestUrl = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response = await fetch(requestUrl, {
    ...options,
    headers: getHeaders(token || null),
  });

  // Attempt auto-refresh on 401
  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        token = refreshedToken;
        response = await fetch(requestUrl, {
          ...options,
          headers: getHeaders(refreshedToken),
        });
      }
    } catch {
      // Refresh attempt failed
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.message ||
      errorData.error ||
      (typeof errorData.data === 'string' ? errorData.data : errorData.data?.message) ||
      `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json().catch(() => ({}));
  if (result && typeof result === 'object' && 'data' in result && result.data !== undefined) {
    return result.data as T;
  }
  return result as T;
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

  /**
   * 11. GET /api/v1/Miscellaneous/user-types
   * Retrieve platform user types / roles
   */
  getUserTypes: (): Promise<UserTypeItem[]> => {
    return apiFetch<UserTypeItem[]>('/api/v1/Miscellaneous/user-types', {
      method: 'GET',
    });
  },

  /**
   * 12. GET /api/v1/Miscellaneous/order-statuses
   * Retrieve all supported market order statuses
   */
  getOrderStatuses: (): Promise<OrderStatusItem[]> => {
    return apiFetch<OrderStatusItem[]>('/api/v1/Miscellaneous/order-statuses', {
      method: 'GET',
    });
  },
};