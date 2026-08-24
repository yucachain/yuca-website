import { UserRole, AuthStatus } from "@/app/enums";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  initials?: string;
  companyName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  name?: string;
  role?: UserRole | string;
  companyName?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  message?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  aggregatorLogin: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<User | null>;
  clearError: () => void;
}
