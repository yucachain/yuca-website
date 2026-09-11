import { AuthStatus, UserRole } from "@/app/enums";

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
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  name?: string;
  role?: UserRole | string;
  firstName?: string;
  lastName?: string;
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
  resetToken: string;
  newPassword: string;
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

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  status: string;
  successful: boolean;
  message: string;
  data?: T;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: string;
}

export interface LoginResponse {
  code: number;
  status: string;
  successful: boolean;
  message: string;
  data: AuthData;
}

export interface AggregatorLoginRequest {
  email: string;
  password: string;
}

export interface MiscPayload {
  id: string;
  name: string;
  description: string;
}

export interface AuthContextValues extends AuthState {
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<User | null>;
  clearError: () => void;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}