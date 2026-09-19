
import {
  RegisterRequest,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  AggregatorLoginRequest,
  AggregatorRegisterRequest,
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

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
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

export async function loginAggregator(
  payload: AggregatorLoginRequest
): Promise<ApiResponse<AuthData>> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/aggregator/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: ApiResponse<AuthData> = await response.json();

  if (!response.ok || !data.successful) {
    throw new Error(data.message || `Aggregator login failed with status ${response.status}`);
  }

  const token =
    data.data?.accessToken ||
    (data.data as any)?.token ||
    (data as any)?.accessToken ||
    (data as any)?.token;
  const refreshToken =
    data.data?.refreshToken ||
    (data.data as any)?.refreshToken ||
    (data as any)?.refreshToken;
  const role = data.data?.role || (data as any)?.role || "AGGREGATOR";

  if (token) {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("yuca_access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("yuca_refresh_token");
      localStorage.removeItem("userRole");
    } catch {}

    localStorage.setItem("accessToken", token);
    localStorage.setItem("yuca_access_token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("yuca_refresh_token", refreshToken);
    }
    localStorage.setItem("userRole", role);
  }

  return data;
}

export async function registerAggregator(
  payload: AggregatorRegisterRequest
): Promise<ApiResponse> {
  const endpoint = apiUrl("/api/v1/auth/aggregator/register");
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      `Unable to reach the authentication server at ${endpoint}. Check your connection and NEXT_PUBLIC_API_BASE_URL.`,
    );
  }

  let data: ApiResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error(`The server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || !data.successful) {
    throw new Error(data.message || `Aggregator registration failed with status ${response.status}`);
  }

  return data;
}

export async function getCurrentUser(): Promise<User> {
  const token =
    (typeof window !== "undefined" &&
      (localStorage.getItem("yuca_access_token") ||
        localStorage.getItem("accessToken"))) ||
    "";

  if (!token) {
    throw new Error("No active authentication token found.");
  }

  const endpoint = apiUrl("/api/v1/auth/me");
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(`Unable to reach server at ${endpoint}. Check network connection.`);
  }

  let result: any;
  try {
    result = await response.json();
  } catch {
    throw new Error(`The server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || (result.successful === false && !result.data)) {
    throw new Error(result.message || `Failed to fetch profile (HTTP ${response.status})`);
  }

  const raw = result.data?.user || result.data || result;
  const fullName =
    raw.name ||
    `${raw.firstName || ""} ${raw.lastName || ""}`.trim() ||
    raw.email ||
    "User";

  const parts = fullName.trim().split(/\s+/);
  const initials =
    raw.initials ||
    (parts.length === 1
      ? parts[0].substring(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase());

  const user: User = {
    id: raw.id || raw._id || "",
    email: raw.email || "",
    name: fullName,
    role: raw.role || raw.accountType || "USER",
    initials,
    phoneNumber: raw.phoneNumber,
    companyName: raw.businessName || raw.companyName,
    firstName: raw.firstName,
    lastName: raw.lastName,
    businessName: raw.businessName,
    hubName: raw.hubName,
    hubState: raw.hubState,
    hubLga: raw.hubLga,
    accountType: raw.accountType,
    isVerified: raw.isVerified,
    avatarUrl: raw.avatarUrl,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("yuca_user_data", JSON.stringify(user));
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
    const response = await loginUser({
      identifier: payload.email,
      password: payload.password,
    });

    const token =
      response.data?.accessToken ||
      (response.data as any)?.token ||
      (response as any)?.accessToken ||
      "";

    const user: User = {
      id: "",
      email: payload.email,
      name: payload.email,
      role: response.data.role || "USER",
      initials: "YU",
    };

    return {
      user,
      token,
      refreshToken: response.data.refreshToken,
      message: response.message,
    };
  },

  async aggregatorLogin(payload: LoginPayload): Promise<AuthResponse> {
    const response = await loginAggregator({
      identifier: payload.email,
      password: payload.password,
    });

    const token =
      response.data?.accessToken ||
      (response.data as any)?.token ||
      (response as any)?.accessToken ||
      (response as any)?.token ||
      "";

    const user: User = {
      id: (response.data as any)?.id || "",
      email: payload.email,
      name: (response.data as any)?.name || payload.email,
      role: response.data?.role || (response as any)?.role || "AGGREGATOR",
      initials: "YU",
    };

    return {
      user,
      token,
      refreshToken: response.data?.refreshToken || (response as any)?.refreshToken,
      message: response.message,
    };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await registerUser({
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
      email: payload.email,
      password: payload.password,
      role: payload.role || "Buyer",
    });

    const user: User = {
      id: "",
      email: payload.email,
      name: payload.fullName || payload.name || payload.email,
      role: payload.role || "Buyer",
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

  async getCurrentUser(): Promise<User> {
    return getCurrentUser();
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

