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
  LoginPayload,
  RegisterPayload,
  User,
} from "@/app/types/auth";
import authService from "@/app/Services/authService";

const initialAuthState: AuthState = {
  user: null,
  token: null,
  status: AuthStatus.IDLE,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | null>(null);

function getInitials(name?: string): string {
  if (!name) return "YU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
      localStorage.setItem(StorageKey.USER, JSON.stringify(userData));
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
      localStorage.removeItem(StorageKey.REFRESH_TOKEN);
      localStorage.removeItem("refreshToken");
      localStorage.removeItem(StorageKey.USER);
      localStorage.removeItem("userRole");
    } catch {

    }
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
          localStorage.getItem("accessToken");
        const savedUserJson = localStorage.getItem(StorageKey.USER);

        if (savedToken) {
          setToken(savedToken);
          if (savedUserJson) {
            try {
              const parsedUser: User = JSON.parse(savedUserJson);
              if (!parsedUser.initials && parsedUser.name) {
                parsedUser.initials = getInitials(parsedUser.name);
              }
              setUser(parsedUser);
              setStatus(AuthStatus.AUTHENTICATED);
            } catch {
              // will refresh below
            }
          }

          // Fetch fresh user profile from /api/v1/auth/me
          try {
            const freshUser = await authService.getCurrentUser();
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
  }, [clearSession]);

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

        const formattedUser: User = {
          id: userData.id || "",
          email: userData.email || payload.email,
          name: userData.name || payload.email,
          role: userData.role || UserRole.GUEST,
          initials: userData.initials || getInitials(userData.name || payload.email),
          ...userData,
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

  const aggregatorLogin = useCallback(
    async (payload: LoginPayload): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      setStatus(AuthStatus.LOADING);

      try {
        const response = await authService.aggregatorLogin(payload);
        const payloadData = (response as Partial<AuthResponse> & { data?: Partial<AuthResponse> })?.data ?? response;
        const userData = payloadData.user as Partial<User> | undefined;
        const tokenValue = payloadData.token;

        if (!userData || !tokenValue) {
          throw new Error("Authentication response was missing user data or token.");
        }

        const formattedUser: User = {
          id: userData.id || "",
          email: userData.email || payload.email,
          name: userData.name || payload.email,
          role: userData.role || UserRole.AGGREGATOR,
          initials: userData.initials || getInitials(userData.name || payload.email),
          ...userData,
        };

        setToken(tokenValue);
        setUser(formattedUser);
        setStatus(AuthStatus.AUTHENTICATED);
        persistSession(tokenValue, formattedUser);

        return { ...payloadData, token: tokenValue, user: formattedUser } as AuthResponse;
      } catch (err: unknown) {
        const errMessage =
          err instanceof Error ? err.message : "Failed to log in as Aggregator";
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
        const userData = payloadData.user as Partial<User> | undefined;
        const tokenValue = payloadData.token;

        if (!userData || !tokenValue) {
          throw new Error("Registration response was missing user data or token.");
        }

        const formattedUser: User = {
          id: userData.id || "",
          email: userData.email || payload.email,
          name: userData.name || payload.fullName || payload.name || payload.email,
          role: userData.role || payload.role || UserRole.GUEST,
          initials: userData.initials || getInitials(userData.name || payload.fullName || payload.name || payload.email),
          ...userData,
        };

        setToken(tokenValue);
        setUser(formattedUser);
        setStatus(AuthStatus.AUTHENTICATED);
        persistSession(tokenValue, formattedUser);

        return { ...payloadData, token: tokenValue, user: formattedUser } as AuthResponse;
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
      const freshUser = await authService.getCurrentUser();
      const formatted: User = {
        ...freshUser,
        initials: freshUser.initials || getInitials(freshUser.name),
      };
      setUser(formatted);
      if (typeof window !== "undefined") {
        localStorage.setItem(StorageKey.USER, JSON.stringify(formatted));
      }
      return formatted;
    } catch {
      return null;
    }
  }, [token]);


  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      token,
      status,
      isLoading,
      isAuthenticated,
      error,
      login,
      aggregatorLogin,
      register,
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
      aggregatorLogin,
      register,
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
