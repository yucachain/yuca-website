
import {
  RegisterRequest,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  AggregatorLoginRequest,
  AuthData,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest, 
  RefreshTokenResponseData
} from "../types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok || !data.successful) {
    throw new Error(data.message || `Login failed with status ${response.status}`);
  }

  // Persist tokens upon successful authentication
  if (data.data?.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
    localStorage.setItem("userRole", data.data.role);
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

  if (data.data?.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
    localStorage.setItem("userRole", data.data.role || "Aggregator");
  }

  return data;
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
  const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

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
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    throw new Error(data.message || "Failed to refresh session");
  }

  // Update localStorage with new tokens
  localStorage.setItem("accessToken", data.data.accessToken);
  if (data.data.refreshToken) {
    localStorage.setItem("refreshToken", data.data.refreshToken);
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

    const user: User = {
      id: "",
      email: payload.email,
      name: payload.email,
      role: response.data.role || "USER",
      initials: "YU",
    };

    return {
      user,
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      message: response.message,
    };
  },

  async aggregatorLogin(payload: LoginPayload): Promise<AuthResponse> {
    const response = await loginAggregator({
      email: payload.email,
      password: payload.password,
    });

    const user: User = {
      id: "",
      email: payload.email,
      name: payload.email,
      role: response.data?.role || "AGGREGATOR",
      initials: "YU",
    };

    return {
      user,
      token: response.data?.accessToken || "",
      refreshToken: response.data?.refreshToken,
      message: response.message,
    };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await registerUser({
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
      phoneNumber: payload.phoneNumber || "",
      email: payload.email,
      password: payload.password,
      role: payload.role || "Buyer",
      state: payload.state || "",
      lga: payload.lga || "",
      farmName: payload.farmName || "",
      companyName: payload.companyName || "",
      businessName: payload.businessName || "",
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
    throw new Error("getCurrentUser is not implemented for this backend");
  },

  async forgotPassword(payload: { email: string }): Promise<{ message: string }> {
    return { message: `Reset link sent to ${payload.email}` };
  },

  async resetPassword(payload: { token: string; password: string }): Promise<{ message: string }> {
    return { message: "Password reset successful" };
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return { token: refreshToken };
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

