import { refreshAccessToken } from "@/app/Services/authService";
import type {
  VaultUnit,
  CreateVaultUnitRequest,
  ConsolidateVaultRequest,
  VaultLot,
  SpoilageAlert,
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

export const vaultService = {
  /**
   * GET /api/v1/vaults
   * Lists all YucaVault storage units with capacity, used weight, status, temp, humidity
   */
  async getVaults(): Promise<VaultUnit[]> {
    const res = await apiFetch<VaultUnit[]>("/vaults", {
      method: "GET",
    });
    return Array.isArray(res) ? res : [];
  },

  /**
   * POST /api/v1/vaults
   * Creates a new storage unit or facility rack
   */
  async createVault(payload: CreateVaultUnitRequest): Promise<VaultUnit> {
    return apiFetch<VaultUnit>("/vaults", {
      method: "POST",
      body: JSON.stringify({
        unitCode: payload.unitCode,
        unitType: payload.unitType || "YucaVault",
        location: payload.location,
        state: payload.state,
        lga: payload.lga,
        latitude: payload.latitude,
        longitude: payload.longitude,
        capacityKg: payload.capacityKg,
      }),
    });
  },

  /**
   * GET /api/v1/vaults/:id
   * Retrieves the status of a specific storage unit and the batches stored inside it
   */
  async getVaultById(id: string): Promise<VaultUnit> {
    return apiFetch<VaultUnit>(`/vaults/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  },

  /**
   * POST /api/v1/vaults/consolidate
   * Consolidates multiple batches into a single Vault Lot (e.g. Grade A batches into VL-2026-08A)
   */
  async consolidateBatches(payload: ConsolidateVaultRequest): Promise<VaultLot> {
    return apiFetch<VaultLot>("/vaults/consolidate", {
      method: "POST",
      body: JSON.stringify({
        batchIds: payload.batchIds,
        storageUnitId: payload.storageUnitId,
        qualityGrade: payload.qualityGrade,
        lotCode: payload.lotCode,
      }),
    });
  },

  /**
   * GET /api/v1/vaults/lots
   * Lists all consolidated vault lots ready for market sale or dispatch
   */
  async getVaultLots(): Promise<VaultLot[]> {
    const res = await apiFetch<VaultLot[]>("/vaults/lots", {
      method: "GET",
    });
    return Array.isArray(res) ? res : [];
  },

  /**
   * GET /api/v1/vaults/spoilage-alerts
   * Retrieves batches nearing the spoilage risk threshold (>16 to 24 hours)
   */
  async getSpoilageAlerts(): Promise<SpoilageAlert[]> {
    const res = await apiFetch<SpoilageAlert[]>("/vaults/spoilage-alerts", {
      method: "GET",
    });
    return Array.isArray(res) ? res : [];
  },
};

export default vaultService;
