"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthStatus, StorageKey, UserRole } from "@/app/enums";
import type {
  AuthContextType,
  AuthResponse,
  AuthState,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
  VerifyOtpPayload,
} from "@/app/types/auth";
import authService, {
  resolveDisplayName,
  getInitials,
  isPhoneNumber,
} from "@/app/Services/authService";
import { clearAuthTokens } from "@/app/Services/tokenHelper";

const initialAuthState: AuthState = {
  user: null,
  token: null,
  status: AuthStatus.IDLE,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.IDLE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useMemo(() => {
    return Boolean(token && user);
  }, [token, user]);

  const persistSession = useCallback((authToken: string, userData: User) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(StorageKey.TOKEN, authToken);
      localStorage.setItem("accessToken", authToken);
      localStorage.setItem("yuca_access_token", authToken);
      localStorage.setItem(StorageKey.USER, JSON.stringify(userData));
      localStorage.setItem("yuca_user_data", JSON.stringify(userData));
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.role) {
        localStorage.setItem("userRole", String(userData.role));
      }
    } catch {

    }
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(StorageKey.TOKEN);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("yuca_access_token");
      localStorage.removeItem(StorageKey.REFRESH_TOKEN);
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("yuca_refresh_token");
      localStorage.removeItem(StorageKey.USER);
      localStorage.removeItem("yuca_user_data");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      clearAuthTokens();
    } catch {}
  }, []);


  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        if (typeof window === "undefined") {
          setIsLoading(false);
          return;
        }

        const savedToken =
          localStorage.getItem(StorageKey.TOKEN) ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("yuca_access_token");
        const savedUserJson =
          localStorage.getItem(StorageKey.USER) ||
          localStorage.getItem("yuca_user_data") ||
          localStorage.getItem("user");

        if (savedToken) {
          setToken(savedToken);
          if (savedUserJson) {
            try {
              const parsedUser: User = JSON.parse(savedUserJson);
              const safeName = resolveDisplayName(parsedUser, "Marketplace User");
              parsedUser.name = safeName;
              parsedUser.initials = getInitials(safeName);
              setUser(parsedUser);
              setStatus(AuthStatus.AUTHENTICATED);
            } catch {
              // will refresh below
            }
          }

          // Fetch fresh user profile from /api/v1/auth/me and /api/v1/users/profile
          try {
            const freshUser = await authService.getCurrentUser(savedToken);
            setUser(freshUser);
            setStatus(AuthStatus.AUTHENTICATED);
            persistSession(savedToken, freshUser);
          } catch (profileErr) {
            if (!savedUserJson) {
              clearSession();
              setStatus(AuthStatus.UNAUTHENTICATED);
            }
          }
        } else {
          setStatus(AuthStatus.UNAUTHENTICATED);
        }
      } catch (err: unknown) {
        console.error("Failed to hydrate auth state:", err);
        setStatus(AuthStatus.UNAUTHENTICATED);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateAuth();

    // Listen for unauthorized 401 event dispatched by Axios interceptor
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      setStatus(AuthStatus.UNAUTHENTICATED);
      setError("Your session has expired. Please log in again.");
    };

    window.addEventListener("yuca:auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("yuca:auth:unauthorized", handleUnauthorized);
    };
  }, [clearSession, persistSession]);

  /**
   * Handle user login
   */
  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      setStatus(AuthStatus.LOADING);

      try {
        const response = await authService.login(payload);
        const payloadData = (response as Partial<AuthResponse> & { data?: Partial<AuthResponse> })?.data ?? response;
        const userData = payloadData.user as Partial<User> | undefined;
        const tokenValue = payloadData.token;

        if (!userData || !tokenValue) {
          throw new Error("Authentication response was missing user data or token.");
        }

        const idVal = (payload.phoneNumber || payload.identifier || payload.email || "").trim();
        const resolvedName = resolveDisplayName(userData, "Marketplace User");
        const formattedUser: User = {
          ...userData,
          id: userData.id || "",
          email: userData.email || (idVal.includes("@") ? idVal : ""),
          phoneNumber: userData.phoneNumber || payload.phoneNumber || (!idVal.includes("@") ? idVal : undefined),
          name: resolvedName,
          role: userData.role || UserRole.BUYER,
          initials: getInitials(resolvedName),
        };

        setToken(tokenValue);
        setUser(formattedUser);
        setStatus(AuthStatus.AUTHENTICATED);
        persistSession(tokenValue, formattedUser);

        return { ...payloadData, token: tokenValue, user: formattedUser } as AuthResponse;
      } catch (err: unknown) {
        const errMessage =
          err instanceof Error ? err.message : "Failed to log in";
        setError(errMessage);
        setStatus(AuthStatus.ERROR);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession]
  );

  const adminLogin = useCallback(
    async (payload: LoginPayload): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      setStatus(AuthStatus.LOADING);

      try {
        const response = await authService.adminLogin(payload);
        const payloadData = (response as Partial<AuthResponse> & { data?: Partial<AuthResponse> })?.data ?? response;
        const userData = payloadData.user as Partial<User> | undefined;
        const tokenValue = payloadData.token;

        if (!userData || !tokenValue) {
          throw new Error("Authentication response was missing user data or token.");
        }

        const idVal = (payload.identifier || payload.phoneNumber || payload.email || "").trim();
        const resolvedName = resolveDisplayName(userData, "System Administrator");
        const formattedUser: User = {
          ...userData,
          id: userData.id || "",
          email: userData.email || (idVal.includes("@") ? idVal : ""),
          phoneNumber: userData.phoneNumber || payload.phoneNumber || (!idVal.includes("@") ? idVal : undefined),
          name: resolvedName,
          role: userData.role || UserRole.ADMIN,
          initials: getInitials(resolvedName),
        };

        setToken(tokenValue);
        setUser(formattedUser);
        setStatus(AuthStatus.AUTHENTICATED);
        persistSession(tokenValue, formattedUser);

        return { ...payloadData, token: tokenValue, user: formattedUser } as AuthResponse;
      } catch (err: unknown) {
        const errMessage =
          err instanceof Error ? err.message : "Failed to log in as Administrator";
        setError(errMessage);
        setStatus(AuthStatus.ERROR);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession]
  );


  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      setStatus(AuthStatus.LOADING);

      try {
        const response = await authService.register(payload);
        const payloadData = (response as Partial<AuthResponse> & { data?: Partial<AuthResponse> })?.data ?? response;
        const userData = (payloadData.user as Partial<User> | undefined) || {};
        const tokenValue = payloadData.token || "";

        const fallbackName =
          payload.fullName ||
          `${payload.firstName || ""} ${payload.lastName || ""}`.trim() ||
          "Marketplace User";
        const resolvedName = resolveDisplayName(userData, fallbackName);

        const formattedUser: User = {
          ...userData,
          id: userData.id || "",
          email:
            userData.email ||
            payload.email ||
            (payload.phoneNumber
              ? `${payload.phoneNumber.replace(/[^0-9]/g, "")}@yucachain.com`
              : "user@yucachain.com"),
          name: resolvedName,
          role: userData.role || payload.role || UserRole.GUEST,
          initials: getInitials(resolvedName),
        };

        if (tokenValue) {
          setToken(tokenValue);
          setUser(formattedUser);
          setStatus(AuthStatus.AUTHENTICATED);
          persistSession(tokenValue, formattedUser);
        } else {
          setStatus(AuthStatus.UNAUTHENTICATED);
        }

        return {
          ...payloadData,
          token: tokenValue,
          user: formattedUser,
          message: payloadData.message || response.message || "Registration successful",
        } as AuthResponse;
      } catch (err: unknown) {
        const errMessage =
          err instanceof Error ? err.message : "Registration failed";
        setError(errMessage);
        setStatus(AuthStatus.ERROR);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {

      await authService.logout().catch(() => { });
    } finally {
      clearSession();
      setToken(null);
      setUser(null);
      setStatus(AuthStatus.UNAUTHENTICATED);
      setError(null);
      setIsLoading(false);
    }
  }, [clearSession]);


  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      if (userData.name && !userData.initials) {
        updated.initials = getInitials(userData.name);
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(StorageKey.USER, JSON.stringify(updated));
        } catch {

        }
      }
      return updated;
    });
  }, []);


  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!token) return null;
    try {
      const freshUser = await authService.getCurrentUser(token);
      const safeName = resolveDisplayName(freshUser, "Marketplace User");
      const formatted: User = {
        ...freshUser,
        name: safeName,
        initials: freshUser.initials || getInitials(safeName),
      };
      setUser(formatted);
      persistSession(token, formatted);
      return formatted;
    } catch {
      return null;
    }
  }, [token, persistSession]);


  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const forgotPassword = useCallback(
    async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
      return await authService.forgotPassword(payload);
    },
    []
  );

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload): Promise<{ message: string; resetToken?: string; data?: any }> => {
      return await authService.verifyOtp(payload);
    },
    []
  );

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
      return await authService.resetPassword(payload);
    },
    []
  );

  const value: AuthContextType = useMemo(
    () => ({
      user,
      token,
      status,
      isLoading,
      isAuthenticated,
      error,
      login,
      adminLogin,
      register,
      forgotPassword,
      verifyOtp,
      resetPassword,
      logout,
      updateUser,
      refreshUser,
      clearError,
    }),
    [
      user,
      token,
      status,
      isLoading,
      isAuthenticated,
      error,
      login,
      adminLogin,
      register,
      forgotPassword,
      verifyOtp,
      resetPassword,
      logout,
      updateUser,
      refreshUser,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}

export default AuthContext;
