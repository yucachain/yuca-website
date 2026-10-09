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
  const body = {
    name: payload.name || "",
    firstName: payload.firstName || "",
    lastName: payload.lastName || "",
    phoneNumber: payload.phoneNumber || "",
    address: payload.address || "",
    farmAddress: payload.farmAddress || "",
    facilityAddress: payload.facilityAddress || "",
    businessAddress: payload.businessAddress || "",
    deliveryAddress: payload.deliveryAddress || "",
    avatarUrl: payload.avatarUrl || "",
    state: payload.state || "",
    lga: payload.lga || "",
    farmName: payload.farmName || "",
    businessName: payload.businessName || "",
    companyName: payload.companyName || "",
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
  const formData = new FormData();
  formData.append("file", file);
  formData.append("avatar", file);

  const res = await fetchWithAuth<any>("/api/v1/user/avatar", {
    method: "POST",
    body: formData,
  });

  return (
    res?.avatarUrl ||
    res?.data?.avatarUrl ||
    res?.url ||
    res?.data?.url ||
    res?.photoUrl ||
    res?.data?.photoUrl ||
    (typeof res?.data === "string" && (res.data.startsWith("http://") || res.data.startsWith("https://")) ? res.data : null) ||
    (typeof res === "string" && (res.startsWith("http://") || res.startsWith("https://")) ? res : null) ||
    null
  );
}

/**
 * Fetch user bank details (Farmer, Buyer/Processor, Service Provider)
 * GET /api/v1/user/bank-details
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
 * PUT /api/v1/user/bank-details
 */
export async function updateUserBankDetails(
  payload: UserBankDetailsPayload
): Promise<UserBankDetailsResponse> {
  const body = {
    bankName: payload.bankName || "",
    accountNumber: payload.accountNumber || "",
    accountName: payload.accountName || "",
  };

  const res = await fetchWithAuth<UserBankDetailsResponse>(
    "/api/v1/user/bank-details",
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
  return res?.data ?? res;
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