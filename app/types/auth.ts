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
  profileImage?: string;
  isVerified?: boolean;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  hubName?: string;
  hubState?: string;
  hubLga?: string;
  accountType?: string;
  address?: string;
  farmAddress?: string;
  facilityAddress?: string;
  deliveryAddress?: string;
  businessAddress?: string;
  state?: string;
  lga?: string;
  farmName?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  serviceCategory?: string;
  processingType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfilePayload {
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  farmAddress?: string;
  facilityAddress?: string;
  businessAddress?: string;
  deliveryAddress?: string;
  avatarUrl?: string;
  state?: string;
  lga?: string;
  farmName?: string;
  businessName?: string;
  companyName?: string;
}

export interface UserBankDetailsPayload {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface LoginPayload {
  phoneNumber?: string;
  email?: string;
  identifier?: string;
  password: string;
}

export interface RegisterPayload {
  role: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
  password: string;
  farmAddress?: string;
  companyName?: string;
  facilityAddress?: string;
  businessAddress?: string;
  deliveryAddress?: string;
  state?: string;
  lga?: string;
  farmName?: string;
  businessName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  message?: string;
}

export interface ForgotPasswordPayload {
  email: string;
  phoneNumber?: string;
}

export interface VerifyOtpPayload {
  email?: string;
  phoneNumber?: string;
  code: string;
}

export interface ResetPasswordPayload {
  phoneNumber?: string;
  email?: string;
  otp?: string;
  resetToken?: string;
  newPassword: string;
}

export interface LogoutPayload {
  refreshToken: string;
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
  adminLogin: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<{ message: string }>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<{ message: string; resetToken?: string; data?: any }>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<User | null>;
  clearError: () => void;
}

export interface RegisterRequest {
  role: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  farmAddress?: string;
  companyName?: string;
  facilityAddress?: string;
  businessAddress?: string;
  deliveryAddress?: string;
  state?: string;
  lga?: string;
  farmName?: string;
  businessName?: string;
}

export interface ApiResponse<T = unknown> {
  code?: number;
  status?: string;
  successful?: boolean;
  message: string;
  data?: T;
}

export interface LoginRequest {
  phoneNumber?: string;
  email?: string;
  identifier?: string;
  password: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  role?: string;
  user?: User;
}

export interface LoginResponse {
  code?: number;
  status?: string;
  successful?: boolean;
  message: string;
  data: AuthData;
}

export interface MiscPayload {
  id: string;
  name: string;
  description: string;
}

export interface ForgotPasswordRequest {
  email: string;
  phoneNumber?: string;
}

export interface VerifyOtpRequest {
  email?: string;
  phoneNumber?: string;
  code: string;
}

export interface ResetPasswordRequest {
  phoneNumber?: string;
  email?: string;
  otp?: string;
  resetToken?: string;
  newPassword: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}