import {
  InitializePaymentPayload,
  InitializePaymentResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
  UserTransaction,
} from "@/app/types/Payments/marketplace-payments";
import { refreshAccessToken } from "@/app/Services/authService";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "");

const API_PREFIX = "/api/v1";

function buildApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const base = BASE_URL || "";
  const hasApiPrefix = base.endsWith(API_PREFIX);

  if (!base) {
    return `${API_PREFIX}${normalizedEndpoint}`;
  }

  return `${base}${hasApiPrefix ? "" : API_PREFIX}${normalizedEndpoint}`;
}

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  const candidateKeys = ["accessToken", "yuca_access_token", "token", "authToken"];
  for (const key of candidateKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    let clean = raw.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.slice(1, -1).trim();
    }
    if (clean.startsWith("Bearer ")) {
      clean = clean.slice(7).trim();
    }
    if (clean) return clean;
  }
  return "";
}

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let token = getAuthToken();
  const requestUrl = /^https?:\/\//i.test(endpoint) ? endpoint : buildApiUrl(endpoint);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  let response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        headers["Authorization"] = `Bearer ${refreshedToken}`;
        response = await fetch(requestUrl, {
          ...options,
          headers,
        });
      }
    } catch {
      // ignore
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.message ||
      errorData.error ||
      (typeof errorData.data === "string" ? errorData.data : errorData.data?.message) ||
      `API Error: ${response.statusText || response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();
  if (json && typeof json === "object" && "data" in json && json.data !== null && json.data !== undefined) {
    return json.data as T;
  }

  return json as T;
}

export const MarketplacePaymentsApi = {
  /**
   * POST /api/v1/payments/initialize
   * Initializes a payment gateway transaction (card, bank transfer, Paystack, Flutterwave).
   */
  initializePayment: (
    payload: InitializePaymentPayload
  ): Promise<InitializePaymentResponse> => {
    return fetcher<InitializePaymentResponse>("/payments/initialize", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * POST /api/v1/payments/verify
   * Verifies a payment callback/webhook and places confirmed funds into escrow.
   */
  verifyPayment: (
    payload: VerifyPaymentPayload
  ): Promise<VerifyPaymentResponse> => {
    return fetcher<VerifyPaymentResponse>("/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET /api/v1/payments/transactions
   * Lists ledger transactions for the logged-in web user.
   */
  getUserTransactions: async (): Promise<UserTransaction[]> => {
    const res = await fetcher<any>("/payments/transactions", {
      method: "GET",
    });
    return Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : [];
  },

  /**
   * GET /api/v1/payments/transactions/{id}
   * Retrieves specific transaction receipt details by ID.
   */
  getTransactionById: (id: string): Promise<UserTransaction> => {
    return fetcher<UserTransaction>(`/payments/transactions/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  },
};

export default MarketplacePaymentsApi;