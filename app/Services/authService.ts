
import {
  RegisterRequest,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  AuthData,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  User,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  ResetPasswordPayload,
  LogoutRequest,
  RefreshTokenRequest, 
  RefreshTokenResponseData
} from "../types/auth";
import { getRefreshToken } from "./tokenHelper";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "");

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function registerUser(payload: RegisterRequest): Promise<ApiResponse> {
  const endpoint = apiUrl("/api/v1/auth/register");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      role: payload.role,
      fullName: payload.fullName,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      password: payload.password,
      farmAddress: payload.farmAddress || "",
      companyName: payload.companyName || "",
      facilityAddress: payload.facilityAddress || "",
      businessAddress: payload.businessAddress || "",
      deliveryAddress: payload.deliveryAddress || "",
      state: payload.state || "",
      lga: payload.lga || "",
      farmName: payload.farmName || "",
      businessName: payload.businessName || payload.companyName || "",
    }),
  });

  const data: ApiResponse = await response.json().catch(() => ({
    successful: false,
    message: `Server returned an invalid JSON response (status ${response.status})`,
  }));

  if (!response.ok || (data.successful !== undefined && !data.successful)) {
    throw new Error(data.message || `Registration failed with status ${response.status}`);
  }

  return data;
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const endpoint = apiUrl("/api/v1/auth/login");
  let response: Response;

  const phoneVal = (payload.phoneNumber || payload.identifier || "").trim();
  const emailVal = (payload.email || (phoneVal.includes("@") ? phoneVal : "")).trim();

  const requestBody: Record<string, string> = {
    password: payload.password,
  };

  if (phoneVal) {
    if (phoneVal.includes("@")) {
      requestBody.email = phoneVal;
    } else {
      requestBody.phoneNumber = phoneVal;
    }
    requestBody.identifier = phoneVal;
  }

  // Only include email if an actual email was explicitly provided
  if (emailVal && emailVal.includes("@") && !requestBody.email) {
    requestBody.email = emailVal;
  }

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } catch {
    throw new Error(
      `Unable to reach the authentication server at ${endpoint}. Please check your connection and try again.`,
    );
  }

  let data: LoginResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error(`The authentication server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || (data.successful !== undefined && !data.successful)) {
    let errMessage = data.message || `Login failed with status ${response.status}`;
    if (data.data && typeof data.data === "object") {
      const fieldErrors = Object.entries(data.data as unknown as Record<string, unknown>)
        .map(([field, msgs]) => {
          if (Array.isArray(msgs)) return `${msgs.join(", ")}`;
          if (typeof msgs === "string") return `${msgs}`;
          return "";
        })
        .filter(Boolean);
      if (fieldErrors.length > 0) {
        errMessage = fieldErrors.join(" | ");
      }
    }
    throw new Error(errMessage);
  }

  // Persist tokens upon successful authentication
  const token = data.data?.accessToken || (data.data as any)?.token;
  const refreshToken = data.data?.refreshToken || (data.data as any)?.refreshToken;
  if (token) {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("yuca_access_token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("yuca_refresh_token", refreshToken);
    }
    localStorage.setItem("userRole", data.data?.role || "BUYER");
  }

  return data;
}

export async function adminLoginUser(payload: LoginRequest): Promise<LoginResponse> {
  const endpoint = apiUrl("/api/v1/auth/admin/login");
  let response: Response;

  const emailVal = (payload.email || payload.identifier || "").trim();
  const phoneVal = (payload.phoneNumber || (!emailVal.includes("@") ? emailVal : "")).trim();
  const requestBody: Record<string, string> = {
    password: payload.password,
  };

  if (emailVal && emailVal.includes("@")) {
    requestBody.email = emailVal;
  }
  if (phoneVal && !phoneVal.includes("@")) {
    requestBody.phoneNumber = phoneVal;
  }
  if (emailVal || phoneVal) {
    requestBody.identifier = emailVal || phoneVal;
  }

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } catch {
    throw new Error(
      `Unable to reach the admin authentication server at ${endpoint}. Please check your connection and try again.`,
    );
  }

  let data: LoginResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error(`The admin authentication server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || (data.successful !== undefined && !data.successful)) {
    let errMessage = data.message || `Admin login failed with status ${response.status}`;
    if (data.data && typeof data.data === "object") {
      const fieldErrors = Object.entries(data.data as unknown as Record<string, unknown>)
        .map(([field, msgs]) => {
          if (Array.isArray(msgs)) return `${msgs.join(", ")}`;
          if (typeof msgs === "string") return `${msgs}`;
          return "";
        })
        .filter(Boolean);
      if (fieldErrors.length > 0) {
        errMessage = fieldErrors.join(" | ");
      }
    }
    throw new Error(errMessage);
  }

  // Persist tokens upon successful authentication
  const token = data.data?.accessToken || (data.data as any)?.token;
  const refreshToken = data.data?.refreshToken || (data.data as any)?.refreshToken;
  if (token) {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("yuca_access_token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("yuca_refresh_token", refreshToken);
    }
    localStorage.setItem("userRole", data.data?.role || "ADMIN");
  }

  return data;
}

export function isPhoneNumber(value?: string | null): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && /^[+\d\s\-()]+$/.test(value.trim());
}

export function resolveDisplayName(rawUser: any, fallback?: string): string {
  if (!rawUser) {
    return fallback && !isPhoneNumber(fallback) ? fallback.trim() : "Marketplace User";
  }

  const firstName = (rawUser.firstName || rawUser.FirstName || "").trim();
  const lastName = (rawUser.lastName || rawUser.LastName || "").trim();
  if (firstName && lastName) {
    const full = `${firstName} ${lastName}`.trim();
    if (!isPhoneNumber(full)) return full;
  }
  if (firstName && !isPhoneNumber(firstName)) return firstName;
  if (lastName && !isPhoneNumber(lastName)) return lastName;

  const fullName = (rawUser.fullName || rawUser.FullName || "").trim();
  if (fullName && !isPhoneNumber(fullName)) return fullName;

  const name = (rawUser.name || rawUser.Name || "").trim();
  if (name && !isPhoneNumber(name)) return name;

  const business = (
    rawUser.businessName ||
    rawUser.BusinessName ||
    rawUser.companyName ||
    rawUser.CompanyName ||
    rawUser.farmName ||
    rawUser.FarmName ||
    ""
  ).trim();
  if (business && !isPhoneNumber(business)) return business;

  const email = (rawUser.email || rawUser.Email || "").trim();
  if (email && email.includes("@")) {
    const prefix = email.split("@")[0].trim();
    if (prefix && !isPhoneNumber(prefix)) return prefix;
  }

  if (fallback && !isPhoneNumber(fallback)) return fallback.trim();
  return "Marketplace User";
}

export function getInitials(name?: string): string {
  if (!name || isPhoneNumber(name)) return "YU";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "YU";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function parseJwt(token: string): Record<string, any> | null {
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
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function getCurrentUser(tokenOverride?: string): Promise<User> {
  const token =
    tokenOverride ||
    (typeof window !== "undefined" &&
      (localStorage.getItem("yuca_access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token"))) ||
    "";

  if (!token) {
    throw new Error("No active authentication token found.");
  }

  const jwtClaims = parseJwt(token) || {};
  const jwtUser: Record<string, any> = {
    id:
      jwtClaims.sub ||
      jwtClaims.nameid ||
      jwtClaims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
    email:
      jwtClaims.email ||
      jwtClaims.Email ||
      jwtClaims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
    name:
      jwtClaims.name ||
      jwtClaims.Name ||
      jwtClaims.unique_name ||
      jwtClaims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
    firstName:
      jwtClaims.firstName ||
      jwtClaims.given_name ||
      jwtClaims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"],
    lastName:
      jwtClaims.lastName ||
      jwtClaims.family_name ||
      jwtClaims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"],
    phoneNumber:
      jwtClaims.phoneNumber ||
      jwtClaims.phone_number ||
      jwtClaims.mobilephone ||
      jwtClaims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"],
    role:
      jwtClaims.role ||
      jwtClaims.Role ||
      jwtClaims.accountType ||
      jwtClaims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    hubName: jwtClaims.hubName,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Fetch /api/v1/auth/me and /api/v1/user/profile in parallel
  const [authMeRes, profileRes] = await Promise.allSettled([
    fetch(apiUrl("/api/v1/auth/me"), { method: "GET", headers }),
    fetch(apiUrl("/api/v1/user/profile"), { method: "GET", headers }),
  ]);

  let authMeData: any = null;
  if (authMeRes.status === "fulfilled" && authMeRes.value.ok) {
    try {
      authMeData = await authMeRes.value.json();
    } catch {}
  }

  let profileData: any = null;
  if (profileRes.status === "fulfilled" && profileRes.value.ok) {
    try {
      profileData = await profileRes.value.json();
    } catch {}
  }

  // Handle token refresh if both returned 401
  if (!authMeData && !profileData) {
    const is401 =
      (authMeRes.status === "fulfilled" && authMeRes.value.status === 401) ||
      (profileRes.status === "fulfilled" && profileRes.value.status === 401);
    if (is401) {
      try {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          const retryHeaders = { ...headers, Authorization: `Bearer ${refreshedToken}` };
          const [retryMe, retryProfile] = await Promise.allSettled([
            fetch(apiUrl("/api/v1/auth/me"), { method: "GET", headers: retryHeaders }),
            fetch(apiUrl("/api/v1/user/profile"), { method: "GET", headers: retryHeaders }),
          ]);
          if (retryMe.status === "fulfilled" && retryMe.value.ok) {
            authMeData = await retryMe.value.json().catch(() => null);
          }
          if (retryProfile.status === "fulfilled" && retryProfile.value.ok) {
            profileData = await retryProfile.value.json().catch(() => null);
          }
        }
      } catch {}
    }
  }

  const rawMe = authMeData?.data?.user || authMeData?.data?.profile || authMeData?.data || authMeData?.user || authMeData || {};
  const rawProfile =
    profileData?.data?.profile ||
    profileData?.data?.user ||
    profileData?.data ||
    profileData?.profile ||
    profileData ||
    {};

  const merged = {
    ...jwtUser,
    ...rawMe,
    ...rawProfile,
  };

  const displayName = resolveDisplayName(merged, "Marketplace User");
  const initials = merged.initials || getInitials(displayName);

  const user: User = {
    id: String(merged.id || merged._id || rawMe.id || jwtUser.id || ""),
    email: merged.email || merged.Email || rawMe.email || jwtUser.email || "",
    phoneNumber: merged.phoneNumber || merged.PhoneNumber || merged.phone || rawMe.phoneNumber || jwtUser.phoneNumber || "",
    name: displayName,
    role: merged.role || merged.Role || rawMe.role || jwtUser.role || (typeof window !== "undefined" ? localStorage.getItem("userRole") : null) || "BUYER",
    initials,
    firstName: merged.firstName || merged.FirstName,
    lastName: merged.lastName || merged.LastName,
    companyName: merged.companyName || merged.businessName,
    businessName: merged.businessName || merged.companyName,
    hubName: merged.hubName,
    hubState: merged.hubState,
    hubLga: merged.hubLga,
    accountType: merged.accountType,
    isVerified: merged.isVerified,
    avatarUrl: merged.avatarUrl || merged.avatar,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("yuca_user_data", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role) {
        localStorage.setItem("userRole", String(user.role));
      }
    } catch {}
  }

  return user;
}
export async function forgotPassword(
  payload: ForgotPasswordRequest
): Promise<ApiResponse> {
  const endpoint = apiUrl("/api/v1/auth/forget-password");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      phoneNumber: payload.phoneNumber || "",
    }),
  });

  const data: ApiResponse = await response.json().catch(() => ({
    successful: false,
    message: `Server returned an invalid JSON response (status ${response.status})`,
  }));

  if (!response.ok || (data.successful !== undefined && !data.successful)) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function verifyOtp(
  payload: VerifyOtpRequest
): Promise<ApiResponse> {
  const endpoint = apiUrl("/api/v1/auth/verify-otp");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: payload.email || "",
      phoneNumber: payload.phoneNumber || "",
      code: payload.code,
    }),
  });

  const data: ApiResponse = await response.json().catch(() => ({
    successful: false,
    message: `Server returned an invalid JSON response (status ${response.status})`,
  }));

  if (!response.ok || (data.successful !== undefined && !data.successful)) {
    throw new Error(data.message || `OTP verification failed with status ${response.status}`);
  }

  return data;
}

export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<ApiResponse> {
  const endpoint = apiUrl("/api/v1/auth/reset-password");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      phoneNumber: payload.phoneNumber || "",
      email: payload.email || "",
      otp: payload.otp || "",
      resetToken: payload.resetToken || "",
      newPassword: payload.newPassword,
    }),
  });

  const data: ApiResponse = await response.json().catch(() => ({
    successful: false,
    message: `Server returned an invalid JSON response (status ${response.status})`,
  }));

  if (!response.ok || (data.successful !== undefined && !data.successful)) {
    throw new Error(data.message || `Password reset failed with status ${response.status}`);
  }

  return data;
}

export async function logoutUser(
  payload?: LogoutRequest
): Promise<ApiResponse> {
  const endpoint = apiUrl("/api/v1/auth/logout");
  const storedRefreshToken =
    payload?.refreshToken ||
    (typeof window !== "undefined"
      ? localStorage.getItem("refreshToken") ||
        localStorage.getItem("yuca_refresh_token") ||
        ""
      : "");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ||
        localStorage.getItem("yuca_access_token")
      : null;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        refreshToken: storedRefreshToken,
      }),
    });

    const data: ApiResponse = await response.json().catch(() => ({
      successful: true,
      message: "Logged out successfully",
    }));

    return data;
  } catch {
    return {
      successful: true,
      message: "Logged out locally",
    };
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("yuca_access_token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("yuca_refresh_token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      localStorage.removeItem("yuca_user_data");
    }
  }
}

export async function refreshAccessToken(): Promise<string> {
  const storedRefreshToken = getRefreshToken();

  if (!storedRefreshToken) {
    throw new Error("No refresh token available");
  }

  const payload: RefreshTokenRequest = {
    refreshToken: storedRefreshToken,
  };

  const response = await fetch(apiUrl("/api/v1/auth/refresh-token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: ApiResponse<RefreshTokenResponseData> = await response.json().catch(() => ({}));

  if (!response.ok || (data.successful !== undefined && !data.successful) || !data.data?.accessToken) {
    throw new Error(data.message || "Failed to refresh session");
  }

  // Update localStorage with new tokens
  const cleanAccessToken = (data.data.accessToken || "").replace(/^"|"$/g, "").replace(/^Bearer\s+/i, "").trim();
  localStorage.setItem("accessToken", cleanAccessToken);
  localStorage.setItem("yuca_access_token", cleanAccessToken);
  if (data.data.refreshToken) {
    const cleanRefresh = (data.data.refreshToken || "").replace(/^"|"$/g, "").trim();
    localStorage.setItem("refreshToken", cleanRefresh);
    localStorage.setItem("yuca_refresh_token", cleanRefresh);
  }

  return cleanAccessToken;
}

const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const phoneOrIdentifier = (payload.phoneNumber || payload.identifier || "").trim();
    const emailOrIdentifier = (payload.email || (phoneOrIdentifier.includes("@") ? phoneOrIdentifier : "")).trim();
    const response = await loginUser({
      identifier: phoneOrIdentifier,
      phoneNumber: phoneOrIdentifier,
      email: emailOrIdentifier,
      password: payload.password,
    });

    const token =
      response.data?.accessToken ||
      (response.data as any)?.token ||
      (response as any)?.accessToken ||
      "";

    const refreshToken =
      response.data?.refreshToken ||
      (response.data as any)?.refreshToken ||
      (response as any)?.refreshToken;

    // Immediately fetch full authenticated profile from /auth/me
    let user: User;
    try {
      user = await getCurrentUser(token);
    } catch {
      const fallbackName = resolveDisplayName(
        (response.data as any)?.user || (response.data as any),
        "Marketplace User"
      );
      user = {
        id: "",
        email: emailOrIdentifier,
        phoneNumber: !phoneOrIdentifier.includes("@") ? phoneOrIdentifier : "",
        name: fallbackName,
        role: response.data?.role || "BUYER",
        initials: getInitials(fallbackName),
      };
    }

    return {
      user,
      token,
      refreshToken,
      message: response.message,
    };
  },

  async adminLogin(payload: LoginPayload): Promise<AuthResponse> {
    const emailOrIdentifier = (payload.email || payload.identifier || "").trim();
    const phoneOrIdentifier = (payload.phoneNumber || (!emailOrIdentifier.includes("@") ? emailOrIdentifier : "")).trim();
    const response = await adminLoginUser({
      identifier: emailOrIdentifier,
      email: emailOrIdentifier,
      phoneNumber: phoneOrIdentifier,
      password: payload.password,
    });

    const token =
      response.data?.accessToken ||
      (response.data as any)?.token ||
      (response as any)?.accessToken ||
      "";

    const refreshToken =
      response.data?.refreshToken ||
      (response.data as any)?.refreshToken ||
      (response as any)?.refreshToken;

    let user: User;
    try {
      user = await getCurrentUser(token);
    } catch {
      const fallbackName = resolveDisplayName(
        (response.data as any)?.user || (response.data as any),
        "Admin"
      );
      user = {
        id: "",
        email: emailOrIdentifier,
        phoneNumber: phoneOrIdentifier,
        name: fallbackName,
        role: response.data?.role || "ADMIN",
        initials: getInitials(fallbackName),
      };
    }

    return {
      user,
      token,
      refreshToken,
      message: response.message,
    };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const names = (payload.fullName || "").trim().split(/\s+/).filter(Boolean);
    const firstName = payload.firstName || names[0] || "User";
    const lastName = payload.lastName || names.slice(1).join(" ") || firstName;
    const fallbackEmail =
      payload.email ||
      (payload.phoneNumber
        ? `${payload.phoneNumber.replace(/[^0-9]/g, "")}@yucachain.com`
        : "user@example.com");

    const response = await registerUser({
      role: payload.role || "farmer",
      fullName: payload.fullName || `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      phoneNumber: payload.phoneNumber,
      email: fallbackEmail,
      password: payload.password,
      farmAddress: payload.farmAddress || "",
      companyName: payload.companyName || "",
      facilityAddress: payload.facilityAddress || "",
      businessAddress: payload.businessAddress || "",
      deliveryAddress: payload.deliveryAddress || "",
      state: payload.state || "",
      lga: payload.lga || "",
      farmName: payload.farmName || "",
      businessName: payload.businessName || payload.companyName || "",
    });

    const respObj =
      response.data && typeof response.data === "object"
        ? (response.data as Record<string, unknown>)
        : null;
    const rawResp = response as unknown as Record<string, unknown>;

    const token =
      (respObj?.accessToken as string) ||
      (respObj?.token as string) ||
      ((respObj?.tokens as Record<string, unknown>)?.accessToken as string) ||
      (rawResp?.accessToken as string) ||
      (rawResp?.token as string) ||
      "";

    const refreshToken =
      (respObj?.refreshToken as string) ||
      ((respObj?.tokens as Record<string, unknown>)?.refreshToken as string) ||
      (rawResp?.refreshToken as string) ||
      undefined;

    let user: User;
    if (token) {
      try {
        user = await getCurrentUser(token);
      } catch {
        user = {
          id: "",
          email: fallbackEmail,
          name: payload.fullName || `${firstName} ${lastName}`.trim(),
          role: payload.role || "farmer",
          phoneNumber: payload.phoneNumber,
          initials: getInitials(payload.fullName),
        };
      }
    } else {
      const respUser =
        respObj && "user" in respObj && typeof respObj.user === "object" && respObj.user !== null
          ? (respObj.user as Record<string, unknown>)
          : respObj && "id" in respObj
          ? respObj
          : null;

      user = {
        id: String(respUser?.id || ""),
        email: String(respUser?.email || fallbackEmail),
        name: String(respUser?.name || respUser?.fullName || payload.fullName || `${firstName} ${lastName}`.trim()),
        role: (respUser?.role as string) || payload.role || "farmer",
        phoneNumber: (respUser?.phoneNumber as string) || payload.phoneNumber,
        initials: getInitials(String(respUser?.name || respUser?.fullName || payload.fullName)),
      };
    }

    return {
      user,
      token,
      refreshToken,
      message: response.message,
    };
  },

  async logout(): Promise<{ message: string }> {
    const res = await logoutUser();
    return { message: res.message || "Logged out successfully" };
  },

  async getCurrentUser(tokenOverride?: string): Promise<User> {
    return getCurrentUser(tokenOverride);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await forgotPassword(payload);
    return { message: response.message };
  },

  async verifyOtp(payload: VerifyOtpRequest): Promise<{ message: string; resetToken?: string; data?: any }> {
    const response = await verifyOtp(payload);
    const resetToken =
      (response.data as any)?.resetToken ||
      (response.data as any)?.token ||
      (response.data as any)?.otp;
    return {
      message: response.message,
      resetToken,
      data: response.data,
    };
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await resetPassword(payload);
    return { message: response.message };
  },

  async refreshToken(): Promise<{ token: string }> {
    const token = await refreshAccessToken();
    return { token };
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    return {
      id: userData.id || "",
      email: userData.email || "",
      name: userData.name || "",
      role: userData.role || "USER",
      initials: userData.initials || "YU",
      ...userData,
    };
  },
};

export default authService;

