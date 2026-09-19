import {
  MarketplaceListing,
  CreateListingRequest,
  UpdateListingRequest,
  ListingCategory,
} from '@/app/types/marketplace';
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

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = getAuthToken();

  const requestUrl = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : buildApiUrl(endpoint);

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

  // Attempt auto-refresh on 401
  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        token = refreshedToken;
        headers['Authorization'] = `Bearer ${refreshedToken}`;
        response = await fetch(requestUrl, {
          ...options,
          headers,
        });
      }
    } catch {
      // refresh failed
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.message ||
      errorData.error ||
      (typeof errorData.data === 'string' ? errorData.data : errorData.data?.message) ||
      `API Request failed with status ${response.status}`;
    throw new Error(message);
  }

  // Return empty object for 204 No Content response
  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();
  // Unwrap standard backend envelope: { code: 20000, successful: true, data: ... }
  if (json && typeof json === 'object' && 'data' in json && json.data !== null && json.data !== undefined) {
    return json.data as T;
  }

  return json as T;
}

export const marketplaceApi = {
  // GET /api/v1/marketplace/listings
  getListings: async (params?: Record<string, any>): Promise<MarketplaceListing[]> => {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          query.append(key, String(value));
        }
      }
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const result = await fetcher<any>(`/marketplace/listings${queryString}`, {
      method: 'GET',
    });
    return Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
  },

  // GET /api/v1/marketplace/catalog
  getCatalog: async (): Promise<MarketplaceListing[]> => {
    const result = await fetcher<any>('/marketplace/catalog', {
      method: 'GET',
    });
    return Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
  },

  // POST /api/v1/marketplace/listings
  createListing: async (data: CreateListingRequest): Promise<MarketplaceListing> => {
    return fetcher<MarketplaceListing>('/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /api/v1/marketplace/listings/{id}
  getListingById: async (id: string): Promise<MarketplaceListing> => {
    return fetcher<MarketplaceListing>(`/marketplace/listings/${id}`, {
      method: 'GET',
    });
  },

  // PUT /api/v1/marketplace/listings/{id}
  updateListing: async (id: string, data: UpdateListingRequest): Promise<MarketplaceListing> => {
    return fetcher<MarketplaceListing>(`/marketplace/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE /api/v1/marketplace/listings/{id}
  deleteListing: async (id: string): Promise<void> => {
    return fetcher<void>(`/marketplace/listings/${id}`, {
      method: 'DELETE',
    });
  },

  // GET /api/v1/marketplace/recommendations
  getRecommendations: async (): Promise<MarketplaceListing[]> => {
    const result = await fetcher<any>('/marketplace/recommendations', {
      method: 'GET',
    });
    return Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
  },

  // GET /api/v1/marketplace/categories (fallback to /Miscellaneous/listing-categories)
  getCategories: async (): Promise<ListingCategory[]> => {
    try {
      const result = await fetcher<any>('/marketplace/categories', {
        method: 'GET',
      });
      return Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
    } catch {
      const result = await fetcher<any>('/Miscellaneous/listing-categories', {
        method: 'GET',
      });
      return Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
    }
  },
};