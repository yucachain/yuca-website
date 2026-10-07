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

/**
 * Fetch current user's profile
 * GET /api/v1/user/profile
 */
export async function getUserProfile(): Promise<any> {
  try {
    const res = await fetchWithAuth<UserProfileResponse>("/api/v1/user/profile", {
      method: "GET",
    });
    return res?.data ?? res;
  } catch (error) {
    // Graceful fallback to legacy /api/v1/users/profile if backend uses plural
    try {
      const fallbackRes = await fetchWithAuth<UserProfileResponse>(
        "/api/v1/users/profile",
        { method: "GET" }
      );
      return fallbackRes?.data ?? fallbackRes;
    } catch {
      throw error;
    }
  }
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

  try {
    const res = await fetchWithAuth<UserProfileResponse>("/api/v1/user/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return res?.data ?? res;
  } catch (error) {
    // Graceful fallback if backend uses plural
    try {
      const fallbackRes = await fetchWithAuth<UserProfileResponse>(
        "/api/v1/users/profile",
        {
          method: "PUT",
          body: JSON.stringify(body),
        }
      );
      return fallbackRes?.data ?? fallbackRes;
    } catch {
      throw error;
    }
  }
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

export const userService = {
  getUserProfile,
  updateUserProfile,
  getUserBankDetails,
  updateUserBankDetails,
};

export default userService;