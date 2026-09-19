import {
  BackendNotification,
  MarketplaceNotification,
  NotificationCategory,
  RegisterDeviceTokenRequest,
} from "@/app/types/notification";
import { refreshAccessToken } from "@/app/Services/authService";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "");

const API_PREFIX = "/api/v1";

function buildApiUrl(endpoint: string) {
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

async function notificationFetch<T = any>(
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

  // Attempt auto-refresh on 401
  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        token = refreshedToken;
        headers["Authorization"] = `Bearer ${refreshedToken}`;
        response = await fetch(requestUrl, {
          ...options,
          headers,
        });
      }
    } catch {
      // Refresh failed
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.message ||
      errorData.error ||
      (typeof errorData.data === "string" ? errorData.data : errorData.data?.message) ||
      `Notification request failed with status ${response.status}`;
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

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";

  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function normalizeBackendNotification(raw: BackendNotification): MarketplaceNotification {
  const typeStr = String(raw.type || raw.category || "").toLowerCase();

  let category: NotificationCategory = "system";
  if (typeStr.includes("ship") || typeStr.includes("dispatch") || typeStr.includes("transit") || typeStr.includes("deliver")) {
    category = "shipping";
  } else if (typeStr.includes("pay") || typeStr.includes("escrow") || typeStr.includes("payout") || typeStr.includes("wallet")) {
    category = "payment";
  } else if (typeStr.includes("price") || typeStr.includes("batch") || typeStr.includes("stock") || typeStr.includes("market")) {
    category = "pricing";
  } else if (typeStr.includes("order")) {
    category = "shipping";
  }

  const message = raw.message || raw.content || raw.body || raw.description || "Notification update";
  const time = formatRelativeTime(raw.createdAt || raw.updatedAt);
  const read = Boolean(raw.isRead ?? raw.read ?? false);

  return {
    id: String(raw.id || `notif-${Math.random()}`),
    category,
    title: raw.title || "Notification",
    message,
    time,
    read,
    orderId: raw.orderId || raw.data?.orderId,
    linkText: raw.linkText || (raw.orderId ? "View Order" : undefined),
    linkHref: raw.linkHref || (raw.orderId ? `/marketplace/cart` : undefined),
  };
}

export const notificationService = {
  /**
   * GET /api/v1/notifications
   * Retrieves user notifications
   */
  async getNotifications(): Promise<MarketplaceNotification[]> {
    const res = await notificationFetch<BackendNotification[]>("/notifications", {
      method: "GET",
    });

    const list = Array.isArray(res) ? res : [];
    return list.map(normalizeBackendNotification);
  },

  /**
   * PUT /api/v1/notifications/{id}/read
   * Marks a specific notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await notificationFetch<void>(`/notifications/${id}/read`, {
      method: "PUT",
    });
  },

  /**
   * PUT /api/v1/notifications/read-all
   * Marks all user notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await notificationFetch<void>("/notifications/read-all", {
      method: "PUT",
    });
  },

  /**
   * POST /api/v1/notifications/device-token
   * Registers push notification device token
   */
  async registerDeviceToken(payload: RegisterDeviceTokenRequest): Promise<void> {
    await notificationFetch<void>("/notifications/device-token", {
      method: "POST",
      body: JSON.stringify({
        token: payload.token,
        platform: payload.platform || "web",
      }),
    });
  },
};

export default notificationService;
