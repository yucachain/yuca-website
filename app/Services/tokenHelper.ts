export interface DecodedJwtInfo {
  exp: number | null;
  role: string | null;
  accountType: string | null;
  email: string | null;
  isAdmin: boolean;
}

/**
 * Safely decodes a JWT payload to extract expiration, role, and account claims.
 */
export function parseJwtPayload(token: string): DecodedJwtInfo | null {
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
    const parsed = JSON.parse(json);

    const rawRole =
      parsed.role ??
      parsed.roles ??
      parsed.Role ??
      parsed.Roles ??
      parsed.userRole ??
      parsed.UserRole ??
      parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ??
      null;

    const role = Array.isArray(rawRole) ? rawRole.join(",") : rawRole ? String(rawRole) : null;
    const accountType = parsed.accountType ?? parsed.AccountType ?? parsed.userType ?? parsed.UserType ?? null;
    const email =
      parsed.email ??
      parsed.Email ??
      parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ??
      null;

    const roleStr = `${role || ""} ${accountType || ""}`.toLowerCase();
    const isAdmin = roleStr.includes("admin") || roleStr.includes("superadmin");

    return {
      exp: typeof parsed.exp === "number" ? parsed.exp : null,
      role,
      accountType,
      email,
      isAdmin,
    };
  } catch {
    return null;
  }
}

/**
 * Persists the JWT to storage.
 */
export function setAuthToken(token: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("yuca_access_token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("yuca_refresh_token", refreshToken);
    }
  } catch {}
}

/**
 * Clears all tokens from storage.
 */
export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("yuca_access_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("yuca_refresh_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
  } catch {}
}

/**
 * Retrieves the active access token from localStorage or user cache.
 */
export function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  const candidateKeys = [
    "accessToken",
    "yuca_access_token",
    "token",
    "authToken",
    "jwt",
    "yuca_token",
  ];
  for (const key of candidateKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    let clean = raw.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.slice(1, -1).trim();
    }
    if (clean.startsWith("Bearer ")) {
      clean = clean.slice(7).trim();
    }
    if (clean) return clean;
  }

  for (const userKey of ["user", "yuca_user_data"]) {
    const raw = localStorage.getItem(userKey);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const token =
        parsed.accessToken ||
        parsed.token ||
        parsed.data?.accessToken ||
        parsed.data?.token;
      if (typeof token === "string" && token.trim()) {
        let clean = token.trim();
        if (clean.startsWith('"') && clean.endsWith('"')) {
          clean = clean.slice(1, -1).trim();
        }
        if (clean.startsWith("Bearer ")) {
          clean = clean.slice(7).trim();
        }
        if (clean) return clean;
      }
    } catch {}
  }

  return "";
}

/**
 * Retrieves the active refresh token from localStorage or user cache.
 */
export function getRefreshToken(): string {
  if (typeof window === "undefined") return "";
  const candidateKeys = [
    "refreshToken",
    "yuca_refresh_token",
    "refresh_token",
  ];
  for (const key of candidateKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    let clean = raw.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.slice(1, -1).trim();
    }
    if (clean) return clean;
  }

  for (const userKey of ["user", "yuca_user_data"]) {
    const raw = localStorage.getItem(userKey);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const token =
        parsed.refreshToken ||
        parsed.data?.refreshToken;
      if (typeof token === "string" && token.trim()) {
        let clean = token.trim();
        if (clean.startsWith('"') && clean.endsWith('"')) {
          clean = clean.slice(1, -1).trim();
        }
        if (clean) return clean;
      }
    } catch {}
  }

  return "";
}

export default getAuthToken;

