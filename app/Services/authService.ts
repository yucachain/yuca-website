
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
  ResetPasswordRequest,
  ResetPasswordPayload,
  RefreshTokenRequest, 
  RefreshTokenResponseData
} from "../types/auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "");

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function registerUser(payload: RegisterRequest): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: ApiResponse = await response.json();

  if (!response.ok || !data.successful) {
    throw new Error(data.message || `Registration failed with status ${response.status}`);
  }

  return data;
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const endpoint = apiUrl("/api/v1/auth/login");
  let response: Response;

  const phoneOrIdentifier = (payload.identifier || payload.phoneNumber || "").trim();
  const requestBody = {
    identifier: phoneOrIdentifier,
    Identifier: phoneOrIdentifier,
    phoneNumber: phoneOrIdentifier,
    password: payload.password,
    Password: payload.password,
  };

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
      `Unable to reach the authentication server at ${endpoint}. Check NEXT_PUBLIC_API_BASE_URL, the backend, and its CORS configuration.`,
    );
  }

  let data: LoginResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error(`The authentication server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || !data.successful) {
    throw new Error(data.message || `Login failed with status ${response.status}`);
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

  // Fetch /api/v1/auth/me and /api/v1/users/profile in parallel
  const [authMeRes, profileRes] = await Promise.allSettled([
    fetch(apiUrl("/api/v1/auth/me"), { method: "GET", headers }),
    fetch(apiUrl("/api/v1/users/profile"), { method: "GET", headers }),
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
            fetch(apiUrl("/api/v1/users/profile"), { method: "GET", headers: retryHeaders }),
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
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: ApiResponse = await response.json();

  if (!response.ok || !data.successful) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function refreshAccessToken(): Promise<string> {
  const storedRefreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem("refreshToken") ||
        localStorage.getItem("yuca_refresh_token")
      : null;

  if (!storedRefreshToken) {
    throw new Error("No refresh token available");
  }

  const payload: RefreshTokenRequest = {
    refreshToken: storedRefreshToken,
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: ApiResponse<RefreshTokenResponseData> = await response.json();

  if (!response.ok || !data.successful || !data.data?.accessToken) {
    // Clear storage if token refresh fails
    localStorage.removeItem("accessToken");
    localStorage.removeItem("yuca_access_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("yuca_refresh_token");
    localStorage.removeItem("userRole");
    throw new Error(data.message || "Failed to refresh session");
  }

  // Update localStorage with new tokens
  localStorage.setItem("accessToken", data.data.accessToken);
  localStorage.setItem("yuca_access_token", data.data.accessToken);
  if (data.data.refreshToken) {
    localStorage.setItem("refreshToken", data.data.refreshToken);
    localStorage.setItem("yuca_refresh_token", data.data.refreshToken);
  }

  return data.data.accessToken;
}

export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: ApiResponse = await response.json();

  if (!response.ok || !data.successful) {
    throw new Error(data.message || `Password reset failed with status ${response.status}`);
  }

  return data;
}

const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const phoneOrIdentifier = (payload.phoneNumber || payload.identifier || payload.email || "").trim();
    const response = await loginUser({
      identifier: phoneOrIdentifier,
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

    // Immediately fetch full authenticated profile from /auth/me and /users/profile
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
        email: payload.email || (phoneOrIdentifier.includes("@") ? phoneOrIdentifier : ""),
        phoneNumber: payload.phoneNumber || (!phoneOrIdentifier.includes("@") ? phoneOrIdentifier : ""),
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
    return this.login(payload);
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const fallbackEmail =
      payload.email ||
      (payload.phoneNumber
        ? `${payload.phoneNumber.replace(/[^0-9]/g, "")}@yucachain.com`
        : "user@yucachain.com");

    const response = await registerUser({
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
      email: fallbackEmail,
      password: payload.password,
      role: payload.role || "Buyer",
      phoneNumber: payload.phoneNumber,
      businessName: payload.businessName,
      farmAddress: payload.farmAddress,
      facilityAddress: payload.facilityAddress,
      deliveryAddress: payload.deliveryAddress,
      businessAddress: payload.businessAddress,
      bankName: payload.bankName,
      accountNumber: payload.accountNumber,
    });

    const user: User = {
      id: "",
      email: fallbackEmail,
      name: payload.fullName || payload.name || payload.phoneNumber || fallbackEmail,
      role: payload.role || "Buyer",
      phoneNumber: payload.phoneNumber,
      initials: "YU",
    };

    return {
      user,
      token:
        response.data && typeof response.data === "object" && "accessToken" in response.data
          ? String((response.data as { accessToken?: string }).accessToken || "")
          : "",
      refreshToken:
        response.data && typeof response.data === "object" && "refreshToken" in response.data
          ? String((response.data as { refreshToken?: string }).refreshToken || "")
          : undefined,
      message: response.message,
    };
  },

  async logout(): Promise<{ message: string }> {
    return { message: "Logged out successfully" };
  },

  async getCurrentUser(tokenOverride?: string): Promise<User> {
    return getCurrentUser(tokenOverride);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await forgotPassword(payload);
    return { message: response.message };
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
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

