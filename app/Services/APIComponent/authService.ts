import { http } from "@/app/Services/Axios";
import { ApiEndpoints } from "@/app/enums";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  User,
} from "@/app/types/auth";

export const authService = {

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const phoneOrIdentifier = (payload.phoneNumber || payload.identifier || payload.email || "").trim();
    return http.post<AuthResponse>(ApiEndpoints.LOGIN, {
      identifier: phoneOrIdentifier,
      Identifier: phoneOrIdentifier,
      phoneNumber: phoneOrIdentifier,
      password: payload.password,
      Password: payload.password,
    });
  },

  async adminLogin(payload: LoginPayload): Promise<AuthResponse> {
    const phoneOrIdentifier = (payload.phoneNumber || payload.identifier || payload.email || "").trim();
    return http.post<AuthResponse>(ApiEndpoints.ADMIN_LOGIN, {
      identifier: phoneOrIdentifier,
      Identifier: phoneOrIdentifier,
      phoneNumber: phoneOrIdentifier,
      password: payload.password,
      Password: payload.password,
    });
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return http.post<AuthResponse>(ApiEndpoints.REGISTER, payload);
  },

  async logout(): Promise<{ message: string }> {
    return http.post<{ message: string }>(ApiEndpoints.LOGOUT);
  },

  async getCurrentUser(): Promise<User> {
    return http.get<User>(ApiEndpoints.CURRENT_USER);
  },


  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    return http.post<{ message: string }>(ApiEndpoints.FORGOT_PASSWORD, payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    return http.post<{ message: string }>(ApiEndpoints.RESET_PASSWORD, payload);
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return http.post<{ token: string }>(ApiEndpoints.REFRESH_TOKEN, { refreshToken });
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    return http.put<User>(ApiEndpoints.UPDATE_PROFILE, userData);
  },
};

export default authService;
