import {
  MarketplaceListing,
  CreateListingRequest,
  UpdateListingRequest,
  ListingCategory,
  GetProductsParams,
  CheckoutQuoteRequest,
  CheckoutQuoteResponse,
  CreateMarketplaceOrderRequest,
  VerifyPaymentResponse,
  GetMyOrdersParams,
  ConfirmDeliveryResponse,
  CreateFarmerBatchRequest,
  CreateProcessorProductRequest,
  CreateServiceListingRequest,
  SellerSaleItem,
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
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const requestUrl = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : buildApiUrl(endpoint);

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
    let message =
      errorData.message ||
      errorData.error ||
      (typeof errorData.data === 'string' ? errorData.data : errorData.data?.message) ||
      `API Request failed with status ${response.status}`;

    if (errorData.data && typeof errorData.data === 'object' && !Array.isArray(errorData.data)) {
      const fieldErrors = Object.entries(errorData.data)
        .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`))
        .join(' | ');
      if (fieldErrors) message = fieldErrors;
    }
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
  // ─────────────────────────────────────────────────────────────
  // 1. GET /marketplace/products (Public)
  // Query: Category, Grade, Location, MinPrice, MaxPrice, Search, Role, Page, PageSize
  // ─────────────────────────────────────────────────────────────
  getProducts: async (params?: GetProductsParams): Promise<MarketplaceListing[]> => {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          query.append(key, String(value));
        }
      }
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const result = await fetcher<any>(`/marketplace/products${queryString}`, {
      method: 'GET',
    });

    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.items)) return result.items;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  },

  // Alias for backward compatibility
  getListings: async (params?: Record<string, any>): Promise<MarketplaceListing[]> => {
    try {
      // Map legacy lowercase filters to backend PascalCase parameters
      const mappedParams: GetProductsParams = {
        Category: params?.category || params?.Category,
        Grade: params?.grade || params?.Grade,
        Location: params?.location || params?.Location,
        MinPrice: params?.minPrice ?? params?.MinPrice,
        MaxPrice: params?.maxPrice ?? params?.MaxPrice,
        Search: params?.search || params?.Search,
        Role: params?.role || params?.Role,
        Page: params?.page ?? params?.Page ?? 1,
        PageSize: params?.pageSize ?? params?.PageSize ?? 50,
      };
      return await marketplaceApi.getProducts(mappedParams);
    } catch {
      // Fallback to legacy endpoint if backend still serves /marketplace/listings
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
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 2. GET /marketplace/products/{id} (Public)
  // ─────────────────────────────────────────────────────────────
  getProductById: async (id: string): Promise<MarketplaceListing> => {
    try {
      return await fetcher<MarketplaceListing>(`/marketplace/products/${id}`, {
        method: 'GET',
      });
    } catch {
      return await fetcher<MarketplaceListing>(`/marketplace/listings/${id}`, {
        method: 'GET',
      });
    }
  },

  // Alias for backward compatibility
  getListingById: async (id: string): Promise<MarketplaceListing> => {
    return marketplaceApi.getProductById(id);
  },

  // ─────────────────────────────────────────────────────────────
  // 3. POST /marketplace/checkout/quote (Protected)
  // Body: { deliveryMethod, deliveryAddress, pickupLocation }
  // ─────────────────────────────────────────────────────────────
  getCheckoutQuote: async (data: CheckoutQuoteRequest): Promise<CheckoutQuoteResponse> => {
    return fetcher<CheckoutQuoteResponse>('/marketplace/checkout/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ─────────────────────────────────────────────────────────────
  // 4. POST /marketplace/orders (Protected)
  // Body: { type, paymentMethod, deliveryMethod, deliveryAddress, pickupLocation, preferredPickupDate, logisticsNote, batchId, quantityKg }
  // ─────────────────────────────────────────────────────────────
  createOrder: async (data: CreateMarketplaceOrderRequest): Promise<any> => {
    return fetcher<any>('/marketplace/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ─────────────────────────────────────────────────────────────
  // 5. GET /marketplace/payments/verify/{reference} (Protected)
  // Query: provider
  // ─────────────────────────────────────────────────────────────
  verifyPayment: async (reference: string, provider?: string): Promise<VerifyPaymentResponse> => {
    const query = provider ? `?provider=${encodeURIComponent(provider)}` : '';
    return fetcher<VerifyPaymentResponse>(`/marketplace/payments/verify/${encodeURIComponent(reference)}${query}`, {
      method: 'GET',
    });
  },

  // ─────────────────────────────────────────────────────────────
  // 6. GET /marketplace/orders/my-orders (Protected)
  // Query: status, page, pageSize
  // ─────────────────────────────────────────────────────────────
  getMyOrders: async (params?: GetMyOrdersParams): Promise<any[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('pageSize', String(params.pageSize));
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const result = await fetcher<any>(`/marketplace/orders/my-orders${queryString}`, {
      method: 'GET',
    });
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.items)) return result.items;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  },

  // ─────────────────────────────────────────────────────────────
  // 7. POST /marketplace/orders/{orderNumber}/confirm-delivery (Protected - Buyer)
  // ─────────────────────────────────────────────────────────────
  confirmDelivery: async (orderNumber: string): Promise<ConfirmDeliveryResponse> => {
    return fetcher<ConfirmDeliveryResponse>(`/marketplace/orders/${encodeURIComponent(orderNumber)}/confirm-delivery`, {
      method: 'POST',
    });
  },

  // ─────────────────────────────────────────────────────────────
  // 8. POST /marketplace/farmer/batches (Protected - role: "farmer")
  // Variety, EstimatedWeightKg, HarvestDate, HarvestLatitude, HarvestLongitude,
  // HarvestState, HarvestLga, IntendedDestination, Notes, photos
  // ─────────────────────────────────────────────────────────────
  createFarmerBatch: async (data: CreateFarmerBatchRequest | FormData): Promise<any> => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return fetcher<any>('/marketplace/farmer/batches', {
        method: 'POST',
        body: data,
      });
    }

    return fetcher<any>('/marketplace/farmer/batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ─────────────────────────────────────────────────────────────
  // 8b. POST /api/v1/batches/{id}/pricing (Protected - Farmer/Admin)
  // Body: { pricePerTonneNgn: number, intendedDestination: string }
  // ─────────────────────────────────────────────────────────────
  setBatchPricing: async (
    batchId: string,
    data: { pricePerTonneNgn: number; intendedDestination?: string }
  ): Promise<any> => {
    try {
      return await fetcher<any>(`/batches/${encodeURIComponent(batchId)}/pricing`, {
        method: 'POST',
        body: JSON.stringify({
          pricePerTonneNgn: Number(data.pricePerTonneNgn) || 0,
          intendedDestination: data.intendedDestination || 'Storage',
        }),
      });
    } catch (err: any) {
      if (String(err?.message || '').includes('405')) {
        return await fetcher<any>(`/batches/${encodeURIComponent(batchId)}/pricing`, {
          method: 'PUT',
          body: JSON.stringify({
            pricePerTonneNgn: Number(data.pricePerTonneNgn) || 0,
            intendedDestination: data.intendedDestination || 'Storage',
          }),
        });
      }
      throw err;
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 9. POST /marketplace/processor/products (Protected - role: "processor")
  // Body: { category, processedCategory, productName, description, price, unitOfMeasure,
  //         stockAvailable, machinesAvailable, minimumOrder, location, sourceBatchId, status, photoUrls, certifications }
  // ─────────────────────────────────────────────────────────────
  createProcessorProduct: async (data: CreateProcessorProductRequest): Promise<any> => {
    return fetcher<any>('/marketplace/processor/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ─────────────────────────────────────────────────────────────
  // 10. POST /marketplace/services (Protected - role: "service-provider")
  // Body: { category, processedCategory, productName, description, price, unitOfMeasure,
  //         stockAvailable, machinesAvailable, minimumOrder, location, sourceBatchId, status, photoUrls, certifications }
  // ─────────────────────────────────────────────────────────────
  createServiceListing: async (data: CreateServiceListingRequest): Promise<any> => {
    return fetcher<any>('/marketplace/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ─────────────────────────────────────────────────────────────
  // 11. GET /marketplace/seller/sales (Protected - Farmer, Processor, Service Provider)
  // ─────────────────────────────────────────────────────────────
  getSellerSales: async (): Promise<SellerSaleItem[]> => {
    const result = await fetcher<any>('/marketplace/seller/sales', {
      method: 'GET',
    });
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.items)) return result.items;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  },

  // ─────────────────────────────────────────────────────────────
  // Additional / Legacy helpers
  // ─────────────────────────────────────────────────────────────
  getCatalog: async (): Promise<MarketplaceListing[]> => {
    return marketplaceApi.getProducts();
  },

  createListing: async (data: CreateListingRequest): Promise<MarketplaceListing> => {
    return fetcher<MarketplaceListing>('/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateListing: async (id: string, data: UpdateListingRequest): Promise<MarketplaceListing> => {
    return fetcher<MarketplaceListing>(`/marketplace/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteListing: async (id: string): Promise<void> => {
    return fetcher<void>(`/marketplace/listings/${id}`, {
      method: 'DELETE',
    });
  },

  getRecommendations: async (): Promise<MarketplaceListing[]> => {
    try {
      const result = await fetcher<any>('/marketplace/recommendations', {
        method: 'GET',
      });
      return Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
    } catch {
      return marketplaceApi.getProducts({ PageSize: 6 });
    }
  },

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

  // GET /api/v1/Miscellaneous/cassava-varieties
  getCassavaVarieties: async (): Promise<any[]> => {
    try {
      const result = await fetcher<any>('/Miscellaneous/cassava-varieties', {
        method: 'GET',
      });
      const list = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
      if (list.length > 0) {
        return list;
      }
      return [
        { id: 1, name: "Tme419", description: "TME 419" },
        { id: 2, name: "Tms30572", description: "TMS 30572" },
        { id: 3, name: "OkoIyawo", description: "Oko Iyawo" },
        { id: 4, name: "Other", description: "Other" },
      ];
    } catch {
      return [
        { id: 1, name: "Tme419", description: "TME 419" },
        { id: 2, name: "Tms30572", description: "TMS 30572" },
        { id: 3, name: "OkoIyawo", description: "Oko Iyawo" },
        { id: 4, name: "Other", description: "Other" },
      ];
    }
  },

  // GET /api/v1/Miscellaneous/quality-grades
  getQualityGrades: async (): Promise<any[]> => {
    try {
      const result = await fetcher<any>('/Miscellaneous/quality-grades', {
        method: 'GET',
      });
      const list = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
      if (list.length > 0) {
        return list;
      }
      return [
        { id: 1, name: "A", description: "Grade A — Premium" },
        { id: 2, name: "B", description: "Grade B — Standard" },
        { id: 3, name: "C", description: "Grade C" },
        { id: 4, name: "Rejected", description: "Rejected" },
      ];
    } catch {
      return [
        { id: 1, name: "A", description: "Grade A — Premium" },
        { id: 2, name: "B", description: "Grade B — Standard" },
        { id: 3, name: "C", description: "Grade C" },
      ];
    }
  },

  // GET /api/v1/Miscellaneous/listing-categories
  getListingCategories: async (): Promise<any[]> => {
    try {
      const result = await fetcher<any>('/Miscellaneous/listing-categories', {
        method: 'GET',
      });
      const list = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
      if (list.length > 0) return list;
      return [
        { id: 1, name: "CassavaStemsSeedlings", description: "Cassava stems / seedlings" },
        { id: 2, name: "FertilizerAgrochemicals", description: "Fertilizer & agrochemicals" },
        { id: 3, name: "MachineryLease", description: "Machinery lease" },
        { id: 4, name: "ProcessedProduct", description: "Processed product" },
      ];
    } catch {
      return [
        { id: 1, name: "CassavaStemsSeedlings", description: "Cassava stems / seedlings" },
        { id: 2, name: "FertilizerAgrochemicals", description: "Fertilizer & agrochemicals" },
        { id: 3, name: "MachineryLease", description: "Machinery lease" },
        { id: 4, name: "ProcessedProduct", description: "Processed product" },
      ];
    }
  },

  // GET /api/v1/Miscellaneous/processed-product-categories
  getProcessedProductCategories: async (): Promise<any[]> => {
    try {
      const result = await fetcher<any>('/Miscellaneous/processed-product-categories', {
        method: 'GET',
      });
      const list = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
      if (list.length > 0) return list;
      return [
        { id: 1, name: "Garri", description: "Garri" },
        { id: 2, name: "CassavaFlour", description: "Cassava flour" },
        { id: 3, name: "Starch", description: "Starch" },
        { id: 4, name: "AnimalFeed", description: "Animal feed" },
        { id: 5, name: "Other", description: "Other" },
      ];
    } catch {
      return [
        { id: 1, name: "Garri", description: "Garri" },
        { id: 2, name: "CassavaFlour", description: "Cassava flour" },
        { id: 3, name: "Starch", description: "Starch" },
        { id: 4, name: "AnimalFeed", description: "Animal feed" },
        { id: 5, name: "Other", description: "Other" },
      ];
    }
  },
};

export default marketplaceApi;