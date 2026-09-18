import {
  MarketplaceListing,
  CreateListingRequest,
  UpdateListingRequest,
  ListingCategory,
} from '@/app/types/marketplace';

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

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const requestUrl = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : buildApiUrl(endpoint);

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

  // Return empty object for 204 No Content response
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const marketplaceApi = {
  // GET /api/v1/marketplace/listings
  getListings: async (params?: Record<string, string>): Promise<MarketplaceListing[]> => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetcher<MarketplaceListing[]>(`/marketplace/listings${query}`, {
      method: 'GET',
    });
  },

  // GET /api/v1/marketplace/catalog
  getCatalog: async (): Promise<MarketplaceListing[]> => {
    return fetcher<MarketplaceListing[]>('/marketplace/catalog', {
      method: 'GET',
    });
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
    return fetcher<MarketplaceListing[]>('/marketplace/recommendations', {
      method: 'GET',
    });
  },

  // GET /api/v1/marketplace/categories
  getCategories: async (): Promise<ListingCategory[]> => {
    return fetcher<ListingCategory[]>('/marketplace/categories', {
      method: 'GET',
    });
  },
};