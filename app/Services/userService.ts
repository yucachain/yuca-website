import { fetchWithAuth } from "@/app/Services/apiClient";

export async function getUserProfile() {
  return await fetchWithAuth("/api/v1/users/profile");
}

export async function updateUserSettings(settingsData: Record<string, unknown>) {
  return await fetchWithAuth("/api/v1/users/settings", {
    method: "PUT",
    body: JSON.stringify(settingsData),
  });
}