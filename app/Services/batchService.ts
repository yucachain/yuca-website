import { refreshAccessToken } from "@/app/Services/authService";
import { getAuthToken } from "@/app/Services/tokenHelper";
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

export function extractBatchCode(input: string): string {
  const cleaned = (input || "").trim();
  if (!cleaned) return "";

  // If a URL or path is provided (e.g. from QR scan: https://.../batches/scan/YC-2026-00001 or .../batches/YC-2026-00001)
  const yucaCodeMatch = cleaned.match(/YC-[A-Za-z0-9_-]+/i);
  if (yucaCodeMatch) {
    return yucaCodeMatch[0];
  }

  if (cleaned.includes("/")) {
    try {
      const url = new URL(cleaned, "http://localhost");
      const segments = url.pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        return segments[segments.length - 1];
      }
    } catch {
      const parts = cleaned.split("/").filter(Boolean);
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    }
  }

  return cleaned;
}

export function formatBatchRecord(raw: any): BatchRecord {
  if (!raw || typeof raw !== "object") return raw;
  const target = raw.data && typeof raw.data === "object" && !Array.isArray(raw.data) ? raw.data : raw;

  const id = String(target.id ?? target._id ?? target.Id ?? target.batchId ?? target.BatchId ?? target.code ?? target.batchCode ?? "");
  const code = String(target.code ?? target.Code ?? target.batchCode ?? target.BatchCode ?? id ?? "");
  const batchCode = String(target.batchCode ?? target.BatchCode ?? target.code ?? target.Code ?? id ?? "");
  const batchStatus = (target.status ?? target.Status ?? "Harvested") as BatchStatus;
  const estWeightKg = Number(
    target.estimatedWeightKg ??
    target.EstimatedWeightKg ??
    target.estWeightKg ??
    target.weightKg ??
    target.weight ??
    0
  );
  const verifiedWeightKg =
    target.confirmedWeightKg !== undefined
      ? Number(target.confirmedWeightKg)
      : target.verifiedWeightKg !== undefined
        ? Number(target.verifiedWeightKg)
        : undefined;

  return {
    ...target,
    id: id || batchCode || code,
    batchCode: batchCode || code || id,
    status: batchStatus,
    weightKg: verifiedWeightKg ?? estWeightKg,
    estWeightKg,
    verifiedWeightKg,
    qualityGrade: target.qualityGrade ?? target.QualityGrade ?? "A",
    farmerName: target.farmerName ?? target.FarmerName ?? target.farmer?.name ?? target.farmer ?? target.sellerName ?? "Registered Farmer",
    moistureContent: target.moistureContent ?? target.MoistureContent,
    urgentStorageFlag: target.urgentStorageFlag ?? target.UrgentStorageFlag ?? false,
    vaultLotId: target.vaultLotId ?? target.VaultLotId ?? target.consolidatedLot ?? target.vaultLotCode,
    vaultName: target.vaultName ?? target.VaultName ?? target.storageSlot,
    harvestDate: target.harvestDate ?? target.HarvestDate ?? target.createdAt ?? target.CreatedAt,
    createdAt: target.createdAt ?? target.CreatedAt,
  };
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
    cache: "no-store",
    ...options,
    headers,
  });

  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        token = refreshedToken;
        headers["Authorization"] = `Bearer ${refreshedToken}`;
        response = await fetch(requestUrl, {
          cache: "no-store",
          ...options,
          headers,
        });
      }
    } catch {
      // Refresh failed
    }
  }

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const backendMessage =
      errJson.message ||
      errJson.error ||
      (typeof errJson.data === "string" ? errJson.data : errJson.data?.message);

    if (response.status === 401) {
      throw new Error(
        backendMessage ||
        "401 Unauthorized: Your session has expired or your account is unauthorized. Please log in again."
      );
    }

    throw new Error(backendMessage || `Request failed with status ${response.status}`);
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
    try {
      const query = status && status !== ("All" as any) ? `?status=${encodeURIComponent(status)}` : "";
      const res = await apiFetch<any>(`/batches${query}`, {
        method: "GET",
      });

      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (res && typeof res === "object") {
        if (Array.isArray(res.items)) rawList = res.items;
        else if (Array.isArray(res.batches)) rawList = res.batches;
        else if (Array.isArray(res.data)) rawList = res.data;
        else if (Array.isArray(res.data?.items)) rawList = res.data.items;
        else if (Array.isArray(res.data?.batches)) rawList = res.data.batches;
        else if (Array.isArray(res.data?.data)) rawList = res.data.data;
        else if (Array.isArray(res.data?.list)) rawList = res.data.list;
        else if (Array.isArray(res.data?.records)) rawList = res.data.records;
        else if (Array.isArray(res.data?.result)) rawList = res.data.result;
        else if (Array.isArray(res.result?.items)) rawList = res.result.items;
        else if (Array.isArray(res.result)) rawList = res.result;
        else {
          const targetObj = res.data && typeof res.data === "object" ? res.data : res;
          for (const val of Object.values(targetObj)) {
            if (Array.isArray(val)) {
              rawList = val;
              break;
            }
          }
        }
      }

      return rawList.map((raw: any) => formatBatchRecord(raw));
    } catch (err: any) {
      console.warn("[yuca-website batchService.getBatches] error:", err?.message);
      return [];
    }
  },

  /**
   * GET /api/v1/batches/:id
   * Full details for single batch (traceability timeline, vault lot, environmental metrics)
   */
  async getBatchById(id: string): Promise<BatchRecord> {
    const raw = await apiFetch<any>(`/batches/${encodeURIComponent(id)}`, {
      method: "GET",
    });
    return formatBatchRecord(raw);
  },

  /**
   * GET /api/v1/batches/scan/:code
   * Lookup batch by scanning QR code or barcode (e.g. YC-2026-00142)
   * NOTE: Only aggregators/vault operators can use this endpoint.
   * For general lookup use lookupBatch() which uses /batches/:id instead.
   */
  async scanBatch(code: string): Promise<BatchRecord> {
    const batchCode = extractBatchCode(code);
    if (!batchCode) {
      throw new Error("Invalid batch code or QR data provided.");
    }

    const raw = await apiFetch<any>(`/batches/scan/${encodeURIComponent(batchCode)}`, {
      method: "GET",
    });
    return formatBatchRecord(raw);
  },

  /**
   * Lookup a batch by its code, ID, or title � uses GET /batches/:id
   * (avoids the restricted /batches/scan/:code endpoint).
   * Falls back to searching the batch list by title/code if direct ID lookup fails.
   * This is the correct method for aggregators to use when scanning a QR code.
   */
  async lookupBatch(input: string): Promise<BatchRecord> {
    const trimmed = (input || "").trim();
    if (!trimmed) throw new Error("Please enter a batch code or title to search.");

    // Extract clean batch code from QR data (URLs, YC-XXXX codes, etc)
    const batchCode = extractBatchCode(trimmed);
    const lookupId = batchCode || trimmed;

    // 1. Try direct ID lookup via /batches/:id
    try {
      const raw = await apiFetch<any>(`/batches/${encodeURIComponent(lookupId)}`, {
        method: "GET",
      });
      const record = formatBatchRecord(raw);
      if (record && (record.id || record.batchCode)) return record;
    } catch {
      // fall through to list search
    }

    // 2. Fall back: fetch all batches and search by code, id, or title
    const allBatches = await this.getBatches();
    const q = trimmed.toLowerCase();
    const match = allBatches.find((b) => {
      const code = (b.batchCode || String(b.id) || "").toLowerCase();
      const title = (`Batch ${b.batchCode || b.id}`).toLowerCase();
      const id = String(b.id || "").toLowerCase();
      return (
        code === q ||
        id === q ||
        code.includes(q) ||
        id.includes(q) ||
        title.includes(q) ||
        q.includes(code)
      );
    });

    if (match) return match;
    throw new Error(`No batch found matching "${trimmed}". Check the batch code or title and try again.`);
  },


  async intakeBatch(id: string, payload: BatchIntakeRequest): Promise<BatchRecord> {
    const raw = await apiFetch<any>(`/batches/${encodeURIComponent(id)}/intake`, {
      method: "PUT",
      body: JSON.stringify({
        verifiedWeight: payload.verifiedWeight,
        qualityGrade: payload.qualityGrade,
        moistureContent: payload.moistureContent,
        urgentStorageFlag: payload.urgentStorageFlag,
        notes: payload.notes,
      }),
    });
    return formatBatchRecord(raw);
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

