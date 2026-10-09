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
  };

  const res = await fetchWithAuth<UserProfileResponse>("/api/v1/user/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return res?.data ?? res;
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
 * GET /api/v1/user/bank-details (strictly no query parameters or route fallbacks)
 */
export async function getUserBankDetails(): Promise<UserBankDetailsResponse> {
  const res = await fetchWithAuth<UserBankDetailsResponse>(
    "/api/v1/user/bank-details",
    {
      method: "GET",
    }
  );
  return res?.data ?? res;
}

/**
 * Update user bank details (Farmer, Buyer/Processor, Service Provider)
 * POST /api/v1/user/bank-details (fallback to PUT if method not allowed)
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

  try {
    // Attempt POST as requested by user
    const res = await fetchWithAuth<UserBankDetailsResponse>(
      "/api/v1/user/bank-details",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    return res?.data ?? res;
  } catch (err: any) {
    const msg = String(err?.message || "");
    // If backend only accepts PUT (e.g. 405 Method Not Allowed) or 404, fallback to PUT
    if (
      msg.includes("405") ||
      msg.includes("Method Not Allowed") ||
      msg.includes("404")
    ) {
      const res = await fetchWithAuth<UserBankDetailsResponse>(
        "/api/v1/user/bank-details",
        {
          method: "PUT",
          body: JSON.stringify(body),
        }
      );
      return res?.data ?? res;
    }
    throw err;
  }
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