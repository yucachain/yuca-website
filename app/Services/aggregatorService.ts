import type { MarketOrder, AggregatorSettings } from "@/app/Aggregator/components/types";
import { refreshAccessToken } from "@/app/Services/authService";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "");

interface DecodedJwtInfo {
  exp: number | null;
  role: string | null;
  accountType: string | null;
  email: string | null;
  isAggregator: boolean;
}

/**
 * Safely decodes JWT payload to extract expiration and role claims
 */
function parseJwtPayload(token: string): DecodedJwtInfo | null {
  try {
    const clean = token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "").trim();
    const parts = clean.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(json);
    const role =
      parsed.role ||
      parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      null;
    const accountType = parsed.accountType || parsed.AccountType || null;
    const email =
      parsed.email ||
      parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
      null;

    const roleStr = String(role || accountType || "").toLowerCase();
    const isAggregator =
      roleStr.includes("aggregator") ||
      roleStr.includes("hub") ||
      roleStr.includes("manager");

    return {
      exp: typeof parsed.exp === "number" ? parsed.exp : null,
      role,
      accountType,
      email,
      isAggregator,
    };
  } catch {
    return null;
  }
}

/**
 * Robustly inspects storage for the freshest, valid Aggregator JWT token.
 * Prevents stale buyer token collisions from overriding aggregator access.
 */
function getAuthToken(): string {
  if (typeof window === "undefined") return "";

  const candidateKeys = ["accessToken", "yuca_access_token", "token", "authToken"];
  const tokens: {
    key: string;
    token: string;
    info: DecodedJwtInfo | null;
  }[] = [];

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
    if (!clean) continue;

    const info = parseJwtPayload(clean);
    tokens.push({ key, token: clean, info });
  }

  if (tokens.length === 0) return "";

  const nowSec = Math.floor(Date.now() / 1000);

  // 1. First priority: Unexpired Aggregator/HubManager tokens
  const aggregatorTokens = tokens.filter(
    (t) => t.info?.isAggregator && (t.info.exp === null || t.info.exp > nowSec)
  );

  if (aggregatorTokens.length > 0) {
    aggregatorTokens.sort((a, b) => (b.info?.exp ?? 0) - (a.info?.exp ?? 0));
    const chosen = aggregatorTokens[0].token;
    try {
      localStorage.setItem("accessToken", chosen);
      localStorage.setItem("yuca_access_token", chosen);
    } catch {}
    return chosen;
  }

  // 2. Second priority: Any unexpired tokens
  const anyValidTokens = tokens.filter(
    (t) => t.info === null || t.info.exp === null || t.info.exp > nowSec
  );

  if (anyValidTokens.length > 0) {
    anyValidTokens.sort((a, b) => (b.info?.exp ?? 0) - (a.info?.exp ?? 0));
    const chosen = anyValidTokens[0].token;
    try {
      localStorage.setItem("accessToken", chosen);
      localStorage.setItem("yuca_access_token", chosen);
    } catch {}
    return chosen;
  }

  // 3. Fallback to first available so refresh flow can attempt renewal
  return tokens[0].token;
}

/**
 * Robust fetch wrapper that adds auth token, auto-refreshes on 401,
 * and preserves detailed backend error messages.
 */
async function aggregatorFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const primaryUrl = `${API_BASE_URL}${endpoint}`;
  let response = await fetch(primaryUrl, { ...options, headers });

  // If 401 Unauthorized, attempt token refresh and transparently retry
  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        token = refreshedToken;
        headers["Authorization"] = `Bearer ${refreshedToken}`;
        response = await fetch(primaryUrl, { ...options, headers });
      }
    } catch {
      // Refresh failed, proceed to handle error response
    }
  }

  // If 404, try alternative path without or with /v1
  if (response.status === 404) {
    let altEndpoint = "";
    if (endpoint.includes("/aggregator/v1/")) {
      altEndpoint = endpoint.replace("/aggregator/v1/", "/aggregator/");
    } else if (endpoint.includes("/aggregator/")) {
      altEndpoint = endpoint.replace("/aggregator/", "/aggregator/v1/");
    }

    if (altEndpoint) {
      try {
        const altResponse = await fetch(`${API_BASE_URL}${altEndpoint}`, {
          ...options,
          headers,
        });
        if (altResponse.ok || altResponse.status !== 404) {
          response = altResponse;
        }
      } catch {
        // use original response
      }
    }
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    const backendMessage =
      data?.message ||
      data?.error ||
      (typeof data?.data === "string" ? data.data : data?.data?.message);

    console.warn("[Aggregator API Error]", {
      url: primaryUrl,
      status: response.status,
      backendMessage,
      fullBody: data,
      tokenPresent: Boolean(token),
    });

    if (response.status === 401) {
      throw new Error(
        backendMessage ||
          "401 Unauthorized: The backend rejected the aggregator session. Verify your aggregator account status or permissions."
      );
    }

    throw new Error(backendMessage || `Request failed with status ${response.status}`);
  }

  return data ?? ({} as T);
}

export interface AssignBatchesPayload {
  batchIds: string[];
  vaultLotId: string;
}

export interface MarketOrderStatusPayload {
  status: string;
}

export interface BackendAggregatorSettings {
  businessName?: string;
  hubName?: string;
  hubId?: string;
  licenseNumber?: string;
  hubState?: string;
  hubLga?: string;
  maxTonnesCapacity?: number;
  spoilageRiskThresholdHours?: number;
  settlementFrequency?: string;
  [key: string]: any;
}

export const aggregatorService = {
  /**
   * GET /api/v1/aggregator/market-orders
   * Retrieves market orders accepted by buyers
   */
  async getMarketOrders(params?: {
    status?: string;
    tab?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
  }): Promise<MarketOrder[]> {
    const query = new URLSearchParams();
    const tabFilter = params?.tab || params?.status;
    if (tabFilter && tabFilter !== "all") query.append("tab", tabFilter);
    if (params?.page) query.append("page", String(params.page));
    if (params?.pageSize) query.append("pageSize", String(params.pageSize));
    else if (params?.limit) query.append("pageSize", String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await aggregatorFetch(`/api/v1/aggregator/market-orders${queryString}`, {
      method: "GET",
    });

    const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    return list.map((item: any) => ({
      id: item.id || item._id || String(Math.random()),
      orderNumber: item.orderNumber || `MO-${item.id?.slice(0, 6) || "2026"}`,
      buyer: item.buyer || item.buyerName || item.customerName || "Marketplace Buyer",
      buyerEmail: item.buyerEmail || item.email,
      buyerPhone: item.buyerPhone || item.phone,
      deliveryLocation: item.deliveryLocation || item.address || "Hub Delivery Area",
      productName: item.productName || item.product || "Cassava Produce",
      grade: item.grade || "A",
      neededKg: item.neededKg || item.totalWeight || item.quantity || 0,
      selectedKg: item.selectedKg || item.fulfilledWeight || item.neededKg || 0,
      pricePerKg: item.pricePerKg || item.unitPrice || 120,
      totalPrice: item.totalPrice || item.totalAmount || (item.neededKg || 0) * 120,
      paymentStatus: item.paymentStatus || (item.isPaid ? "Escrow Paid" : "Pending Payment"),
      acceptedDate: item.acceptedDate || item.createdAt || "Recent",
      statusLabel: item.statusLabel || item.status || "Buyer Accepted - Pending Consolidation",
      tab:
        item.tab ||
        (item.status?.toLowerCase().includes("transit")
          ? "in-transit"
          : item.status?.toLowerCase().includes("fulfill")
          ? "fulfilled"
          : item.status?.toLowerCase().includes("assign")
          ? "assigned"
          : "pending"),
      batches: (item.batches || []).map((b: any, idx: number) => ({
        id: b.id || `b-${idx}`,
        batchCode: b.batchCode || b.code || `YC-BATCH-${idx + 1}`,
        farmer: b.farmer || b.farmerName || "Registered Farmer",
        weightKg: b.weightKg || b.weight || 0,
        grade: b.grade || "A",
      })),
    }));
  },

  /**
   * POST / PUT /api/v1/aggregator/market-orders/{id}/assign-batches
   * Assigns batches and vault lot to a market order
   */
  async assignBatches(
    orderId: string,
    payload: AssignBatchesPayload
  ): Promise<{ successful: boolean; message?: string }> {
    try {
      // Backend supports PUT for assign-batches
      return await aggregatorFetch(
        `/api/v1/aggregator/market-orders/${orderId}/assign-batches`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
    } catch (err: any) {
      if (err?.message?.includes("405")) {
        // Fallback to POST
        return await aggregatorFetch(
          `/api/v1/aggregator/market-orders/${orderId}/assign-batches`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }
      throw err;
    }
  },

  /**
   * PUT /api/v1/aggregator/market-orders/{id}/status
   * Updates market order status
   */
  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<{ successful: boolean; message?: string }> {
    return await aggregatorFetch(
      `/api/v1/aggregator/market-orders/${orderId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );
  },

  /**
   * GET /api/v1/aggregator/settings
   * Retrieves aggregator hub configuration and settings
   */
  async getSettings(): Promise<BackendAggregatorSettings> {
    const res = await aggregatorFetch("/api/v1/aggregator/settings", {
      method: "GET",
    });
    return res.data || res;
  },

  /**
   * PUT /api/v1/aggregator/settings
   * Updates aggregator hub settings
   */
  async updateSettings(
    payload: BackendAggregatorSettings
  ): Promise<{ successful: boolean; message?: string; data?: any }> {
    return await aggregatorFetch("/api/v1/aggregator/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

export default aggregatorService;
