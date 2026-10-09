import type { MarketOrder } from "@/app/admin/components/types";
import { refreshAccessToken } from "@/app/Services/authService";
import { getAuthToken } from "@/app/Services/tokenHelper";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "");

async function adminFetch<T = any>(
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

  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        token = refreshedToken;
        headers["Authorization"] = `Bearer ${refreshedToken}`;
        response = await fetch(primaryUrl, { ...options, headers });
      }
    } catch {
      // Refresh failed
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

    if (response.status === 401) {
      throw new Error(
        backendMessage ||
          "401 Unauthorized: The session was rejected. Please verify your admin credentials."
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

export interface BackendAdminSettings {
  businessName?: string;
  hubName?: string;
  hubId?: string;
  licenseNumber?: string;
  hubState?: string;
  hubLga?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  maxCapacityTonnes?: number;
  maxTonnesCapacity?: number;
  spoilageRiskThresholdHours?: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  settlementFrequency?: "Instant" | "Daily" | "Weekly" | string;
  spoilageAlertsEmail?: boolean;
  orderAlertsSms?: boolean;
  twoFactorEnabled?: boolean;
  [key: string]: any;
}

export const adminService = {
  /**
   * GET /api/v1/admin/market-orders
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
    const res = await adminFetch(`/api/v1/admin/market-orders${queryString}`, {
      method: "GET",
    }).catch(async () => {
      // Fallback endpoint
      return await adminFetch(`/api/v1/orders${queryString}`, { method: "GET" }).catch(() => ({ data: [] }));
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
      pricePerKg: item.pricePerKg ?? item.unitPrice ?? 0,
      totalPrice: item.totalPrice ?? item.totalAmount ?? (item.neededKg || 0) * (item.pricePerKg ?? item.unitPrice ?? 0),
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
   * PUT /api/v1/admin/market-orders/{id}/assign-batches
   */
  async assignBatches(
    orderId: string,
    payload: AssignBatchesPayload
  ): Promise<{ successful: boolean; message?: string }> {
    try {
      return await adminFetch(
        `/api/v1/admin/market-orders/${orderId}/assign-batches`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
    } catch {
      return await adminFetch(
        `/api/v1/orders/${orderId}/assign-batches`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
    }
  },

  /**
   * PUT /api/v1/admin/market-orders/{id}/status
   */
  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<{ successful: boolean; message?: string }> {
    try {
      return await adminFetch(
        `/api/v1/admin/market-orders/${orderId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );
    } catch {
      return await adminFetch(
        `/api/v1/orders/${orderId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );
    }
  },

  /**
   * GET /api/v1/admin/settings
   */
  async getSettings(): Promise<BackendAdminSettings> {
    const res = await adminFetch("/api/v1/admin/settings", {
      method: "GET",
    }).catch(async () => {
      return await adminFetch("/api/v1/settings", { method: "GET" }).catch(() => ({}));
    });
    return res.data || res;
  },

  /**
   * PUT /api/v1/admin/settings
   */
  async updateSettings(
    payload: BackendAdminSettings
  ): Promise<{ successful: boolean; message?: string; data?: any }> {
    return await adminFetch("/api/v1/admin/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }).catch(async () => {
      return await adminFetch("/api/v1/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    });
  },
};

export default adminService;
