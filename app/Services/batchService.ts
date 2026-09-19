import { refreshAccessToken } from "@/app/Services/authService";
import type {
  BatchRecord,
  BatchStatus,
  BatchIntakeRequest,
  AssignStorageRequest,
  UpdatePricingRequest,
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

export const batchService = {
  /**
   * GET /api/v1/batches
   * Lists batches, filterable by status: Harvested, Aggregated, In Storage, Listed, Sold
   */
  async getBatches(status?: BatchStatus): Promise<BatchRecord[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const res = await apiFetch<BatchRecord[]>(`/batches${query}`, {
      method: "GET",
    });
    return Array.isArray(res) ? res : [];
  },

  /**
   * GET /api/v1/batches/:id
   * Full details for single batch (traceability timeline, vault lot, environmental metrics)
   */
  async getBatchById(id: string): Promise<BatchRecord> {
    return apiFetch<BatchRecord>(`/batches/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  },

  /**
   * GET /api/v1/batches/scan/:code
   * Lookup batch by scanning QR code or barcode (e.g. YC-2026-00142)
   */
  async scanBatch(code: string): Promise<BatchRecord> {
    return apiFetch<BatchRecord>(`/batches/scan/${encodeURIComponent(code.trim())}`, {
      method: "GET",
    });
  },

  /**
   * PUT /api/v1/batches/:id/intake
   * Aggregator records intake & inspection: verified weight, grade A/B/C, moisture %, urgent storage flags
   */
  async intakeBatch(id: string, payload: BatchIntakeRequest): Promise<BatchRecord> {
    return apiFetch<BatchRecord>(`/batches/${encodeURIComponent(id)}/intake`, {
      method: "PUT",
      body: JSON.stringify({
        verifiedWeight: payload.verifiedWeight,
        qualityGrade: payload.qualityGrade,
        moistureContent: payload.moistureContent,
        urgentStorageFlag: payload.urgentStorageFlag,
        notes: payload.notes,
      }),
    });
  },

  /**
   * PUT /api/v1/batches/:id/assign-storage
   * Assigns verified batch to specific YucaVault and YucaHub
   */
  async assignStorage(id: string, payload: AssignStorageRequest): Promise<void> {
    await apiFetch<void>(`/batches/${encodeURIComponent(id)}/assign-storage`, {
      method: "PUT",
      body: JSON.stringify({
        vaultId: payload.vaultId,
        hubId: payload.hubId,
        unitCode: payload.unitCode,
      }),
    });
  },

  /**
   * PUT /api/v1/batches/:id/pricing
   * Updates price per tonne or destination
   */
  async updatePricing(id: string, payload: UpdatePricingRequest): Promise<void> {
    await apiFetch<void>(`/batches/${encodeURIComponent(id)}/pricing`, {
      method: "PUT",
      body: JSON.stringify({
        pricePerTonne: payload.pricePerTonne,
        destination: payload.destination,
      }),
    });
  },
};

export default batchService;
