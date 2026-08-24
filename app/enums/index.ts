

export enum UserRole {
  BUYER = "BUYER",
  AGGREGATOR = "AGGREGATOR",
  FARMER = "FARMER",
  PROCESSOR = "PROCESSOR",
  ADMIN = "ADMIN",
  GUEST = "GUEST",
}

export enum AuthStatus {
  IDLE = "IDLE",
  AUTHENTICATED = "AUTHENTICATED",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  LOADING = "LOADING",
  ERROR = "ERROR",
}

export enum StorageKey {
  TOKEN = "yuca_access_token",
  REFRESH_TOKEN = "yuca_refresh_token",
  USER = "yuca_user_data",
  REMEMBER_ME = "yuca_remember_me",
}

export enum ApiEndpoints {

  LOGIN = "/auth/login",
  AGGREGATOR_LOGIN = "/auth/aggregator/login",
  REGISTER = "/auth/register",
  LOGOUT = "/auth/logout",
  REFRESH_TOKEN = "/auth/refresh-token",
  CURRENT_USER = "/auth/me",
  FORGOT_PASSWORD = "/auth/forgot-password",
  RESET_PASSWORD = "/auth/reset-password",
  VERIFY_EMAIL = "/auth/verify-email",

  UPDATE_PROFILE = "/users/profile",
  CHANGE_PASSWORD = "/users/change-password",

  MARKETPLACE_BATCHES = "/marketplace/batches",
  ORDERS = "/orders",
  DISPATCHES = "/dispatches",
  INSPECTIONS = "/inspections",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  IN_STORAGE = "IN_STORAGE",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum BatchStatus {
  ASSIGN_STORAGE = "Assign Storage",
  IN_STORAGE = "In Storage",
  PENDING_TRANSFER = "Pending Transfer",
  DISPATCHED = "Dispatched",
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}
