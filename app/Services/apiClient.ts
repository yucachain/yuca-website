import { refreshAccessToken } from "@/app/Services/authService";
import { getAuthToken, getRefreshToken } from "@/app/Services/tokenHelper";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "");

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let accessToken = getAuthToken();

  // If no accessToken is present but a refreshToken exists, attempt to refresh before initial request
  if (!accessToken && typeof window !== "undefined" && getRefreshToken()) {
    try {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        accessToken = refreshed;
      }
    } catch {
      // Refresh failed, proceed to try or throw
    }
  }

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const getHeaders = (token: string | null) => ({
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  });

  const requestUrl = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let response = await fetch(requestUrl, {
    ...options,
    headers: getHeaders(accessToken || null),
  });

  // Attempt auto-refresh on 401
  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        accessToken = refreshedToken;
        response = await fetch(requestUrl, {
          ...options,
          headers: getHeaders(refreshedToken),
        });
      }
    } catch {
      // Token refresh attempt failed
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    let msg =
      data.message ||
      data.error ||
      (typeof data.data === "string" ? data.data : data.data?.message) ||
      `Request failed with status ${response.status}`;

    // Extract detailed validation errors if present (e.g. from 422 response)
    const errorObj =
      data.errors ||
      (typeof data.data === "object" && !Array.isArray(data.data) ? data.data : null);

    if (errorObj && typeof errorObj === "object") {
      const errorList = Object.entries(errorObj)
        .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
        .join(" | ");
      if (errorList) {
        msg = data.message ? `${data.message} (${errorList})` : errorList;
      }
    }

    if (response.status === 401) {
      msg = "Unauthorized: Your session has expired or is invalid. Please sign in again.";
    }
    throw new Error(msg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));
  return data as T;
}

export async function getUserProfile() {
  return await fetchWithAuth("/api/v1/user/profile");
}