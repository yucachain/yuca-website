import {
  AdminOverviewStats,
  User,
  AdminGetUsersParams,
  UpdateAdminUserStatusRequest,
  MarketOrder,
  AdminGetMarketOrdersParams,
  ConsolidateMarketOrdersRequest,
  AdminCreateDispatchRequest,
  Payout,
  PlatformAdminSettings,
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
   * Query parameters: search, userType, status, page, pageSize
   */
  getUsers: async (
    params?: AdminGetUsersParams
  ): Promise<User[] & { items: User[]; totalCount: number; page: number; pageSize: number }> => {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.append('search', params.search.trim());
    if (params?.userType && params.userType !== 'all') query.append('userType', params.userType);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    query.append('page', String(params?.page || 1));
    query.append('pageSize', String(params?.pageSize || 50));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<any>(`/api/v1/admin/users${qs}`, { method: 'GET' });

    let items: User[] = [];
    let totalCount = 0;
    let page = params?.page || 1;
    let pageSize = params?.pageSize || 50;

    if (Array.isArray(res)) {
      items = res;
      totalCount = res.length;
    } else if (res && typeof res === 'object') {
      if (Array.isArray(res.items)) {
        items = res.items;
      } else if (Array.isArray(res.data)) {
        items = res.data;
      } else if (Array.isArray(res.users)) {
        items = res.users;
      }
      totalCount = Number(res.totalCount ?? res.totalRecords ?? res.total ?? items.length);
      page = Number(res.page ?? res.pageNumber ?? page);
      pageSize = Number(res.pageSize ?? pageSize);
    }

    return Object.assign(items, { items, totalCount, page, pageSize }) as any;
  },

  /**
   * 3. PUT /api/v1/admin/users/{id}/status
   * Update a specific user's status (PendingVerification, Active, Suspended, Deleted)
   */
  updateUserStatus: (
    userId: string,
    payload: UpdateAdminUserStatusRequest
  ): Promise<{ success?: boolean; successful?: boolean; message?: string }> => {
    return apiFetch<{ success?: boolean; successful?: boolean; message?: string }>(
      `/api/v1/admin/users/${encodeURIComponent(userId)}/status`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 4. GET /api/v1/admin/market-orders
   * Retrieve all market orders (parameters: status, page, pageSize)
   */
  getMarketOrders: async (
    params?: AdminGetMarketOrdersParams
  ): Promise<MarketOrder[] & { items: MarketOrder[]; totalCount: number }> => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('pageSize', String(params.pageSize));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<any>(`/api/v1/admin/market-orders${qs}`, {
      method: 'GET',
    });

    let items: MarketOrder[] = [];
    let totalCount = 0;

    if (Array.isArray(res)) {
      items = res;
      totalCount = res.length;
    } else if (res && typeof res === 'object') {
      if (Array.isArray(res.items)) items = res.items;
      else if (Array.isArray(res.data)) items = res.data;
      else if (Array.isArray(res.orders)) items = res.orders;
      totalCount = Number(res.totalCount ?? res.total ?? items.length);
    }

    return Object.assign(items, { items, totalCount }) as any;
  },

  /**
   * 5. POST /api/v1/admin/market-orders/consolidate
   * Consolidate multiple market orders
   */
  consolidateMarketOrders: (
    payload: ConsolidateMarketOrdersRequest
  ): Promise<{ success?: boolean; successful?: boolean; consolidatedOrderId?: string; message?: string }> => {
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
  ): Promise<{ success?: boolean; successful?: boolean; dispatchId?: string; message?: string }> => {
    return apiFetch('/api/v1/admin/dispatch-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 7. GET /api/v1/admin/payouts
   * Fetch all seller payouts
   */
  getPayouts: async (): Promise<Payout[] & { items: Payout[]; totalCount: number }> => {
    const res = await apiFetch<any>('/api/v1/admin/payouts', { method: 'GET' });
    let items: Payout[] = [];
    let totalCount = 0;

    if (Array.isArray(res)) {
      items = res;
      totalCount = res.length;
    } else if (res && typeof res === 'object') {
      if (Array.isArray(res.items)) items = res.items;
      else if (Array.isArray(res.data)) items = res.data;
      else if (Array.isArray(res.payouts)) items = res.payouts;
      totalCount = Number(res.totalCount ?? res.total ?? items.length);
    }

    return Object.assign(items, { items, totalCount }) as any;
  },

  /**
   * 8. POST /api/v1/admin/payouts/{payoutId}/disburse
   * Disburse funds for a specific payout
   */
  disbursePayout: (
    payoutId: string
  ): Promise<{ success?: boolean; successful?: boolean; transactionReference?: string; message?: string }> => {
    return apiFetch(`/api/v1/admin/payouts/${encodeURIComponent(payoutId)}/disburse`, {
      method: 'POST',
    });
  },

  /**
   * 9. GET /api/v1/admin/settings
   * Retrieve administrative settings
   */
  getSettings: (): Promise<PlatformAdminSettings> => {
    return apiFetch<PlatformAdminSettings>('/api/v1/admin/settings', { method: 'GET' });
  },

  /**
   * 10. PUT /api/v1/admin/settings
   * Update administrative settings
   */
  updateSettings: (
    payload: UpdateAdminSettingsRequest
  ): Promise<{ success?: boolean; successful?: boolean; message?: string; data?: any }> => {
    return apiFetch('/api/v1/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 11. GET /api/v1/Miscellaneous/user-types
   * Retrieve platform user types / roles
   */
  getUserTypes: async (): Promise<UserTypeItem[]> => {
    const res = await apiFetch<any>('/api/v1/Miscellaneous/user-types', {
      method: 'GET',
    });
    return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
  },

  /**
   * 12. GET /api/v1/Miscellaneous/order-statuses
   * Retrieve all supported market order statuses
   */
  getOrderStatuses: async (): Promise<OrderStatusItem[]> => {
    const res = await apiFetch<any>('/api/v1/Miscellaneous/order-statuses', {
      method: 'GET',
    });
    return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
  },

  /**
   * 13. GET /api/v1/user/bank-details
   * Retrieve user bank details (payout destination)
   * Strictly /api/v1/user/bank-details without query parameters or route fallbacks
   */
  getUserBankDetails: async (): Promise<{
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  }> => {
    try {
      const res = await apiFetch<any>('/api/v1/user/bank-details', { method: 'GET' });
      return res?.data ?? res ?? {};
    } catch {
      // Gracefully return empty object if no bank details are registered yet
      return {};
    }
  },
};