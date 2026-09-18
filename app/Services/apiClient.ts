import { refreshAccessToken } from "@/app/Services/authService";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "");

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const getHeaders = (token: string | null) => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  });

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(accessToken),
  });

  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: getHeaders(accessToken),
      });
    } catch (error) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw error;
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export async function getUserProfile() {
  return await fetchWithAuth("/api/v1/users/profile");
}