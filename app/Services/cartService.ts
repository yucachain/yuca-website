import {
  Cart,
  CartItem,
  AddCartItemRequest,
  UpdateCartItemRequest,
} from '@/app/types/cart';

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
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const requestUrl = /^https?:\/\//i.test(endpoint) ? endpoint : buildApiUrl(endpoint);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json();
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
    const payload = await fetcher<any>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      ...(payload ?? {}),
      unit: payload?.unit || 'Tonnes',
      currency: payload?.currency || '₦',
      pricePerTonne: payload?.pricePerTonne ?? payload?.price ?? 0,
      quantity: payload?.quantity ?? 1,
    };
  },

  // PUT /api/v1/cart/items/{id}
  updateItemQuantity: async (id: string, data: UpdateCartItemRequest): Promise<CartItem> => {
    const payload = await fetcher<any>(`/cart/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return {
      ...(payload ?? {}),
      unit: payload?.unit || 'Tonnes',
      currency: payload?.currency || '₦',
      pricePerTonne: payload?.pricePerTonne ?? payload?.price ?? 0,
      quantity: payload?.quantity ?? 1,
    };
  },

  // DELETE /api/v1/cart/items/{id}
  removeItem: async (id: string): Promise<void> => {
    return fetcher<void>(`/cart/items/${id}`, {
      method: 'DELETE',
    });
  },
};