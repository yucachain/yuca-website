export type NotificationCategory = "shipping" | "pricing" | "system" | "payment" | "order";

export interface BackendNotification {
  id: string;
  title: string;
  message?: string;
  content?: string;
  body?: string;
  description?: string;
  type?: string;
  category?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
  data?: Record<string, any>;
  orderId?: string;
  linkText?: string;
  linkHref?: string;
  [key: string]: any;
}

export interface MarketplaceNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
  linkText?: string;
  linkHref?: string;
}

export interface RegisterDeviceTokenRequest {
  token: string;
  platform: string;
}
