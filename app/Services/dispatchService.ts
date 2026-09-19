import { refreshAccessToken } from "@/app/Services/authService";
import type {
  DispatchRecord,
  DispatchStatus,
  CreateDispatchRequest,
  UpdateDispatchStatusRequest,
  TrackDispatchResult,
} from "@/app/types/batchVaultDispatch";

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

async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = getAuthToken();
  const requestUrl = /^https?:\/\//i.test(endpoint) ? endpoint : buildApiUrl(endpoint);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
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
    const errJson = await response.json().catch(() => ({}));
    const message =
      errJson.message ||
      errJson.error ||
      (typeof errJson.data === "string" ? errJson.data : errJson.data?.message) ||
      `Request failed with status ${response.status}`;
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

export const dispatchService = {
  /**
   * GET /api/v1/dispatches
   * Lists all dispatch orders, filterable by: pending, dispatched, in-transit, delivered
   */
  async getDispatches(status?: DispatchStatus): Promise<DispatchRecord[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const res = await apiFetch<DispatchRecord[]>(`/dispatches${query}`, {
      method: "GET",
    });
    return Array.isArray(res) ? res : [];
  },

  /**
   * GET /api/v1/dispatches/:id
   * Retrieves full dispatch record and generates data for a dispatch receipt
   */
  async getDispatchById(id: string): Promise<DispatchRecord> {
    return apiFetch<DispatchRecord>(`/dispatches/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  },

  /**
   * POST /api/v1/dispatches
   * Creates a new dispatch release (captures pickup hub/vault, carrier, tracking #, ticket, buyer address)
   */
  async createDispatch(payload: CreateDispatchRequest): Promise<DispatchRecord> {
    return apiFetch<DispatchRecord>("/dispatches", {
      method: "POST",
      body: JSON.stringify({
        pickupHub: payload.pickupHub,
        carrierName: payload.carrierName,
        trackingNumber: payload.trackingNumber,
        weighbridgeTicket: payload.weighbridgeTicket,
        buyerDeliveryAddress: payload.buyerDeliveryAddress,
        orderId: payload.orderId,
        vaultLotId: payload.vaultLotId,
        batchIds: payload.batchIds,
        weightKg: payload.weightKg,
      }),
    });
  },

  /**
   * PUT /api/v1/dispatches/:id/status
   * Updates dispatch status: pending, dispatched, in-transit, delivered
   */
  async updateStatus(id: string, payload: UpdateDispatchStatusRequest): Promise<void> {
    await apiFetch<void>(`/dispatches/${encodeURIComponent(id)}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status: payload.status,
      }),
    });
  },

  /**
   * GET /api/v1/dispatches/track/:trackingCode
   * Tracks a shipment's current status using its tracking number (e.g. TRK-9921-KD)
   */
  async trackShipment(trackingCode: string): Promise<TrackDispatchResult> {
    const raw = await apiFetch<any>(`/dispatches/track/${encodeURIComponent(trackingCode.trim())}`, {
      method: "GET",
    });

    // Normalize response if returned flat or nested
    const dispatch: DispatchRecord = raw.dispatch || {
      id: raw.id || trackingCode,
      trackingNumber: raw.trackingNumber || raw.trackingCode || trackingCode,
      trackingCode: raw.trackingCode || raw.trackingNumber || trackingCode,
      pickupHub: raw.pickupHub || raw.origin || "YucaVault Storage",
      carrierName: raw.carrierName || raw.carrier || "Freight Logistics",
      weighbridgeTicket: raw.weighbridgeTicket || "WB-PENDING",
      buyerDeliveryAddress: raw.buyerDeliveryAddress || raw.destination || "Destination Hub",
      weightKg: raw.weightKg || raw.totalWeight || 0,
      status: (raw.status || "in-transit").toLowerCase(),
      estimatedDelivery: raw.estimatedDelivery || "1-2 Business Days",
    };

    const timeline = Array.isArray(raw.timeline)
      ? raw.timeline
      : [
          {
            status: "Order Dispatched",
            time: raw.dispatchedAt || "Recently",
            location: raw.pickupHub || "YucaVault",
            description: "Package received by carrier and weighed at weighbridge.",
          },
          {
            status: "In Transit",
            time: "Current",
            location: "En route",
            description: "Shipment in transit to buyer delivery location.",
          },
        ];

    return {
      dispatch,
      currentLocation: raw.currentLocation || raw.location || "En Route",
      timeline,
      canConfirmReceipt: dispatch.status === "in-transit" || dispatch.status === "delivered",
    };
  },

  /**
   * PUT /api/v1/dispatches/:id/confirm-receipt
   * Buyer confirms delivery of product, which releases held escrow funds
   */
  async confirmReceipt(id: string): Promise<void> {
    await apiFetch<void>(`/dispatches/${encodeURIComponent(id)}/confirm-receipt`, {
      method: "PUT",
    });
  },
};

export default dispatchService;
