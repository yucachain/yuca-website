import {
  Cart,
  CartItem,
  AddCartItemRequest,
  UpdateCartItemRequest,
} from '@/app/types/cart';
import { refreshAccessToken } from '@/app/Services/authService';

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '')
  .replace(/\/index\.html?$/i, '')
  .replace(/\/$/, '');

const API_PREFIX = '/api/v1';

function buildApiUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = BASE_URL || '';
  const hasApiPrefix = base.endsWith(API_PREFIX);

  if (!base) {
    return `${API_PREFIX}${normalizedEndpoint}`;
  }

  return `${base}${hasApiPrefix ? '' : API_PREFIX}${normalizedEndpoint}`;
}

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  const candidateKeys = ['accessToken', 'yuca_access_token', 'token', 'authToken'];
  for (const key of candidateKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    let clean = raw.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.slice(1, -1).trim();
    }
    if (clean.startsWith('Bearer ')) {
      clean = clean.slice(7).trim();
    }
    if (clean) return clean;
  }
  return '';
}

function normalizeCartResponse(payload: any): Cart {
  const normalized = payload && typeof payload === 'object' && 'data' in payload && payload.data
    ? payload.data
    : payload;

  const items = Array.isArray(normalized?.items) ? normalized.items : [];

  return {
    id: normalized?.id,
    items: items.map((item: any) => ({
      ...item,
      unit: item.unit || 'Tonnes',
      currency: item.currency || '₦',
      pricePerTonne: item.pricePerTonne ?? item.price ?? 0,
      quantity: item.quantity ?? 1,
    })),
    subtotal: Number(normalized?.subtotal ?? 0),
    totalItems: Number(normalized?.totalItems ?? items.length),
    vat: Number(normalized?.vat ?? 0),
    total: Number(normalized?.total ?? normalized?.subtotal ?? 0),
  };
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = getAuthToken();
  const requestUrl = /^https?:\/\//i.test(endpoint) ? endpoint : buildApiUrl(endpoint);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  let response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    try {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        token = refreshed;
        headers['Authorization'] = `Bearer ${refreshed}`;
        response = await fetch(requestUrl, {
          ...options,
          headers,
        });
      }
    } catch {}
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    const json = await response.json();
    if (json && typeof json === 'object' && 'data' in json && json.data !== null && json.data !== undefined) {
      return json.data as T;
    }
    return json;
  }

  return {} as T;
}

export const cartApi = {
  // GET /api/v1/cart
  getCart: async (): Promise<Cart> => {
    const payload = await fetcher<any>('/cart', {
      method: 'GET',
    });

    return normalizeCartResponse(payload);
  },

  // POST /api/v1/cart/items
  addItem: async (data: AddCartItemRequest): Promise<CartItem> => {
    const isUuid = (str?: string) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    const body: Record<string, any> = {
      quantity: Number(data.quantity) || 1,
    };
    if (isUuid(data.listingId)) {
      body.listingId = data.listingId;
    } else if (isUuid(data.id)) {
      body.listingId = data.id;
    }
    if (isUuid(data.batchId)) {
      body.batchId = data.batchId;
    }

    const payload = await fetcher<any>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      ...(payload ?? {}),
      id: payload?.id || data.id || data.listingId || String(Math.random()),
      title: payload?.title || data.title || 'Cassava Product',
      grade: payload?.grade || data.grade || 'A',
      unit: payload?.unit || data.unit || 'Tonnes',
      currency: payload?.currency || data.currency || '₦',
      pricePerTonne: payload?.pricePerTonne ?? payload?.price ?? data.pricePerTonne ?? 0,
      quantity: payload?.quantity ?? data.quantity ?? 1,
    };
  },

  // PUT /api/v1/cart/items/{id}
  updateItemQuantity: async (id: string, data: UpdateCartItemRequest): Promise<CartItem> => {
    const body = {
      quantity: Number(data.quantity) || 1,
    };

    const payload = await fetcher<any>(`/cart/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return {
      ...(payload ?? {}),
      id: payload?.id || id,
      unit: payload?.unit || 'Tonnes',
      currency: payload?.currency || '₦',
      pricePerTonne: payload?.pricePerTonne ?? payload?.price ?? 0,
      quantity: payload?.quantity ?? data.quantity ?? 1,
    };
  },

  // DELETE /api/v1/cart/items/{id}
  removeItem: async (id: string): Promise<void> => {
    return fetcher<void>(`/cart/items/${id}`, {
      method: 'DELETE',
    });
  },
};