import { fetchWithAuth } from "@/app/Services/apiClient";
import type {
  UserProfilePayload,
  UserBankDetailsPayload,
} from "@/app/types/auth";

export interface UserProfileResponse {
  successful?: boolean;
  message?: string;
  data?: any;
  [key: string]: any;
}

export interface UserBankDetailsResponse {
  successful?: boolean;
  message?: string;
  data?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    [key: string]: any;
  };
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  [key: string]: any;
}

export interface UserSettingsPayload {
  smsAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
  pushAlertsEnabled: boolean;
}

/**
 * Fetch current user's profile
 * GET /api/v1/user/profile
 */
export async function getUserProfile(): Promise<any> {
  const res = await fetchWithAuth<UserProfileResponse>("/api/v1/user/profile", {
    method: "GET",
  });
  return res?.data ?? res;
}

/**
 * Update current user's profile
 * PUT /api/v1/user/profile
 */
export async function updateUserProfile(
  payload: UserProfilePayload
): Promise<any> {
  const isValidUrl = (url?: string | null) => {
    if (!url) return false;
    const trimmed = url.trim();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://");
  };

  const body: Record<string, any> = {
    name: payload.name?.trim() || null,
    firstName: payload.firstName?.trim() || null,
    lastName: payload.lastName?.trim() || null,
    phoneNumber: payload.phoneNumber?.trim() || null,
    address: payload.address?.trim() || null,
    farmAddress: payload.farmAddress?.trim() || null,
    facilityAddress: payload.facilityAddress?.trim() || null,
    businessAddress: payload.businessAddress?.trim() || null,
    deliveryAddress: payload.deliveryAddress?.trim() || null,
    // Only pass fully-qualified URL if valid; otherwise null to satisfy OpenAPI uri format validator
    avatarUrl: isValidUrl(payload.avatarUrl) ? payload.avatarUrl!.trim() : null,
    state: payload.state?.trim() || null,
    lga: payload.lga?.trim() || null,
    farmName: payload.farmName?.trim() || null,
    businessName: payload.businessName?.trim() || null,
    companyName: payload.companyName?.trim() || null,
    bankName: payload.bankName?.trim() || null,
    accountNumber: payload.accountNumber?.trim() || null,
    accountName: payload.accountName?.trim() || null,
  };

  try {
    const res = await fetchWithAuth<UserProfileResponse>("/api/v1/user/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return res?.data ?? res;
  } catch {
    const res = await fetchWithAuth<UserProfileResponse>("/api/v1/users/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return res?.data ?? res;
  }
}

/**
 * Upload user profile picture
 * POST /api/v1/user/avatar (multipart/form-data)
 */
export async function uploadUserAvatar(file: File): Promise<string | null> {
  if (!file) throw new Error("No image file provided.");

  const formData = new FormData();
  // Strictly "file" field as declared in OpenAPI schema
  formData.append("file", file, file.name);

  const res = await fetchWithAuth<any>("/api/v1/user/avatar", {
    method: "POST",
    body: formData,
  });

  const rawUrl =
    res?.avatarUrl ||
    res?.data?.avatarUrl ||
    res?.url ||
    res?.data?.url ||
    res?.photoUrl ||
    res?.data?.photoUrl ||
    (typeof res?.data === "string" && res.data.length > 5 ? res.data : null) ||
    (typeof res === "string" && res.length > 5 ? res : null) ||
    null;

  if (!rawUrl) return null;

  // If already absolute URL
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  // If backend returns a relative path like /uploads/...
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
    .replace(/\/index\.html?$/i, "")
    .replace(/\/$/, "");

  if (rawUrl.startsWith("/")) {
    return `${baseUrl}${rawUrl}`;
  }

  return rawUrl;
}

/**
 * Fetch user bank details (Farmer, Buyer/Processor, Service Provider)
 * GET /api/v1/user/bank-details (with fallbacks)
 */
export async function getUserBankDetails(
  userId?: string
): Promise<UserBankDetailsResponse> {
  const candidateEndpoints = userId
    ? [
        `/api/v1/admin/users/${encodeURIComponent(userId)}/bank-details`,
        `/api/v1/user/bank-details?userId=${encodeURIComponent(userId)}`,
        `/api/v1/users/bank-details?userId=${encodeURIComponent(userId)}`,
        `/api/v1/user/${encodeURIComponent(userId)}/bank-details`,
        `/api/v1/users/${encodeURIComponent(userId)}/bank-details`,
      ]
    : [
        "/api/v1/user/bank-details",
        "/api/v1/users/bank-details",
      ];

  let rawRes: any = null;
  for (const ep of candidateEndpoints) {
    try {
      rawRes = await fetchWithAuth<any>(ep, { method: "GET" });
      const unwrapped = rawRes?.data?.bankDetails || rawRes?.bankDetails || rawRes?.data || rawRes;
      if (unwrapped && (unwrapped.bankName || unwrapped.BankName || unwrapped.accountNumber || unwrapped.AccountNumber)) {
        break;
      }
    } catch {
      // try next candidate endpoint
    }
  }

  const bankObj = rawRes?.data?.bankDetails || rawRes?.bankDetails || rawRes?.data || rawRes || {};
  const bankName = String(bankObj.bankName || bankObj.BankName || bankObj.bank_name || "").trim();
  const accountNumber = String(bankObj.accountNumber || bankObj.AccountNumber || bankObj.account_number || "").trim();
  const accountName = String(bankObj.accountName || bankObj.AccountName || bankObj.account_name || "").trim();

  if (bankName || accountNumber) {
    const payload = { bankName, accountNumber, accountName };
    if (typeof window !== "undefined") {
      try {
        if (userId) {
          localStorage.setItem(`yuca_bank_details_${userId}`, JSON.stringify(payload));
        } else {
          localStorage.setItem("yuca_user_bank_details", JSON.stringify(payload));
        }
      } catch {}
    }
    return payload;
  }

  // Fallback to cached local storage
  if (typeof window !== "undefined") {
    try {
      const keys = [
        userId ? `yuca_bank_details_${userId}` : null,
        "yuca_user_bank_details",
      ].filter(Boolean) as string[];
      for (const k of keys) {
        const cached = localStorage.getItem(k);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.bankName || parsed.accountNumber) return parsed;
        }
      }
    } catch {}
  }

  return {};
}

/**
 * Update user bank details (Farmer, Buyer/Processor, Service Provider)
 * POST /api/v1/user/bank-details (fallback to PUT, and fallback to /users/bank-details)
 * Body: { bankName, accountNumber, accountName }
 */
export async function updateUserBankDetails(
  payload: UserBankDetailsPayload
): Promise<UserBankDetailsResponse> {
  const body = {
    bankName: (payload.bankName || "").trim(),
    accountNumber: (payload.accountNumber || "").trim(),
    accountName: (payload.accountName || "").trim(),
  };

  const attempts = [
    { url: "/api/v1/user/bank-details", method: "POST" },
    { url: "/api/v1/user/bank-details", method: "PUT" },
    { url: "/api/v1/users/bank-details", method: "POST" },
    { url: "/api/v1/users/bank-details", method: "PUT" },
  ];

  let lastError: any = null;
  let successfulRes: any = null;

  for (const att of attempts) {
    try {
      const res = await fetchWithAuth<UserBankDetailsResponse>(att.url, {
        method: att.method,
        body: JSON.stringify(body),
      });
      successfulRes = res?.data ?? res;
      break;
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.response?.status;
      const msg = String(err?.message || "");
      if (status === 405 || status === 404 || msg.includes("405") || msg.includes("404")) {
        continue;
      }
      break;
    }
  }

  // Persist to localStorage caches immediately so all UI sections (including admin directory) reflect it
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("yuca_user_bank_details", JSON.stringify(body));
      const userRaw = localStorage.getItem("yuca_user_data");
      if (userRaw) {
        const u = JSON.parse(userRaw);
        u.bankName = body.bankName;
        u.accountNumber = body.accountNumber;
        u.accountName = body.accountName;
        localStorage.setItem("yuca_user_data", JSON.stringify(u));
        if (u.id) {
          localStorage.setItem(`yuca_bank_details_${u.id}`, JSON.stringify(body));
        }
        if (u.email) {
          localStorage.setItem(`yuca_bank_details_${String(u.email).toLowerCase()}`, JSON.stringify(body));
        }
      }
    } catch {}
  }

  if (successfulRes) return successfulRes;
  if (lastError) throw lastError;
  return body;
}

/**
 * Fetch user notification & alert settings
 * GET /api/v1/user/settings
 */
export async function getUserSettings(): Promise<UserSettingsPayload> {
  const res = await fetchWithAuth<any>("/api/v1/user/settings", {
    method: "GET",
  });
  return res?.data ?? res;
}

/**
 * Update user notification & alert settings
 * PUT /api/v1/user/settings
 */
export async function updateUserSettings(
  payload: UserSettingsPayload
): Promise<any> {
  const body = {
    smsAlertsEnabled: Boolean(payload.smsAlertsEnabled),
    emailAlertsEnabled: Boolean(payload.emailAlertsEnabled),
    pushAlertsEnabled: Boolean(payload.pushAlertsEnabled),
  };

  const res = await fetchWithAuth<any>("/api/v1/user/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return res?.data ?? res;
}

export const userService = {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  getUserBankDetails,
  updateUserBankDetails,
  getUserSettings,
  updateUserSettings,
};

export default userService;