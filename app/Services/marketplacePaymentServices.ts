import {
  InitializePaymentPayload,
  InitializePaymentResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
  UserTransaction,
  SellerPayoutItem,
  ProcessPayoutPayload,
  ProcessPayoutResponse,
  PaymentStatsResponse,
  PaymentMethodItem,
  PaymentProviderItem,
  PaymentStatusItem,
} from "@/app/types/Payments/marketplace-payments";
import { refreshAccessToken } from "@/app/Services/authService";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/index\.html?$/i, "")
  .replace(/\/$/, "");

const API_PREFIX = "/api/v1";

function buildApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const base = BASE_URL || "";
  const hasApiPrefix = base.endsWith(API_PREFIX);

  if (!base) {
    return `${API_PREFIX}${normalizedEndpoint}`;
  }

  return `${base}${hasApiPrefix ? "" : API_PREFIX}${normalizedEndpoint}`;
}

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  const candidateKeys = ["accessToken", "yuca_access_token", "token", "authToken"];
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
  return "";
}

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let token = getAuthToken();
  const requestUrl = /^https?:\/\//i.test(endpoint) ? endpoint : buildApiUrl(endpoint);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  let response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    try {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        headers["Authorization"] = `Bearer ${refreshedToken}`;
        response = await fetch(requestUrl, {
          ...options,
          headers,
        });
      }
    } catch {
      // ignore
    }
  }

  if (!response.ok) {
    const rawBody = await response.text().catch(() => "");
    let errorData: any = {};
    try {
      errorData = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      errorData = { message: rawBody };
    }
    console.error("Payment API Error Response:", response.status, "Raw body:", rawBody, "Parsed:", errorData);

    let validationDetails = "";
    const errSource = errorData.data || errorData.errors || errorData;
    if (errSource && typeof errSource === "object") {
      const issues: string[] = [];
      for (const [key, val] of Object.entries(errSource)) {
        if (key === "message" || key === "error" || key === "status") continue;
        if (Array.isArray(val)) {
          issues.push(`${key}: ${val.join(", ")}`);
        } else if (typeof val === "string") {
          issues.push(`${key}: ${val}`);
        } else if (val && typeof val === "object") {
          issues.push(`${key}: ${JSON.stringify(val)}`);
        }
      }
      if (issues.length > 0) {
        validationDetails = issues.join("; ");
      }
    }

    const message =
      (validationDetails
        ? `${errorData.message ? errorData.message + " -> " : ""}${validationDetails}`
        : null) ||
      errorData.message ||
      errorData.error ||
      (rawBody && rawBody.length < 200 ? rawBody : null) ||
      `API Error: ${response.statusText || response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();
  if (json && typeof json === "object" && "data" in json && json.data !== null && json.data !== undefined) {
    return json.data as T;
  }

  return json as T;
}

export const MarketplacePaymentsApi = {
  /**
   * 1. POST /api/v1/payments/initialize
   * Initializes payment transaction via Paystack (or Stub).
   */
  initializePayment: async (
    payload: InitializePaymentPayload
  ): Promise<InitializePaymentResponse> => {
    const isUuid = (str?: string | null) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    const generateUuid = () => {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        try {
          return crypto.randomUUID();
        } catch {}
      }
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const safeOrderId = isUuid(payload.orderId) ? payload.orderId : generateUuid();
    const safeMarketplaceOrderId = isUuid(payload.marketplaceOrderId)
      ? payload.marketplaceOrderId
      : safeOrderId;

    const requestBody = {
      orderId: safeOrderId,
      marketplaceOrderId: safeMarketplaceOrderId,
      amount: Number(payload.amount),
      paymentMethod: payload.paymentMethod || "BankTransfer",
      provider: payload.provider || "Paystack",
      callbackUrl:
        payload.callbackUrl ||
        (typeof window !== "undefined" && window.location.origin
          ? `${window.location.origin}/marketplace/confirmation`
          : "https://yucachain.com/marketplace/confirmation"),
      customerEmail: payload.customerEmail,
      customerName: payload.customerName,
    };

    const res = await fetcher<any>("/payments/initialize", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const accessCode =
      res?.accessCode ||
      res?.access_code ||
      res?.data?.accessCode ||
      res?.data?.access_code ||
      res?.data?.data?.access_code;

    const paymentUrl =
      res?.paymentUrl ||
      res?.authorizationUrl ||
      res?.authorization_url ||
      res?.checkoutUrl ||
      res?.redirectUrl ||
      res?.url ||
      res?.data?.authorization_url ||
      res?.data?.authorizationUrl ||
      res?.data?.paymentUrl ||
      res?.data?.checkoutUrl ||
      res?.data?.redirectUrl ||
      res?.data?.url ||
      res?.data?.data?.authorization_url ||
      res?.data?.data?.authorizationUrl ||
      (accessCode ? `https://checkout.paystack.com/${accessCode}` : "") ||
      "";

    const reference =
      res?.reference ||
      res?.data?.reference ||
      `PAY-${Date.now()}`;

    return {
      ...res,
      reference,
      paymentUrl,
      authorizationUrl: paymentUrl,
      amount: res?.amount ?? payload.amount,
      provider: res?.provider || payload.provider || "Paystack",
      status: res?.status || "initialized",
    };
  },

  /**
   * 2. POST /api/v1/payments/verify
   * Verifies payment reference and locks verified funds into escrow.
   */
  verifyPayment: async (
    payload: VerifyPaymentPayload
  ): Promise<VerifyPaymentResponse> => {
    const res = await fetcher<any>("/payments/verify", {
      method: "POST",
      body: JSON.stringify({
        reference: payload.reference,
        provider: payload.provider || "Paystack",
      }),
    });

    const isSuccess =
      res?.success !== undefined
        ? Boolean(res.success)
        : res?.status === "success" || !res?.error;

    return {
      success: isSuccess,
      status: res?.status || (isSuccess ? "success" : "verified"),
      reference: res?.reference || payload.reference,
      escrowStatus: res?.escrowStatus || "held",
      message: res?.message || "Payment verified and placed in escrow",
      data: res?.data || res,
    };
  },

  /**
   * 3. GET /api/v1/payments/transactions?type={type}
   * Retrieves ledger transactions, optionally filtered by type.
   */
  getUserTransactions: async (type?: string): Promise<UserTransaction[]> => {
    const query = type && type !== "All" ? `?type=${encodeURIComponent(type)}` : "";
    const res = await fetcher<any>(`/payments/transactions${query}`, {
      method: "GET",
    });

    const items = Array.isArray(res)
      ? res
      : Array.isArray(res?.items)
      ? res.items
      : Array.isArray(res?.transactions)
      ? res.transactions
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return items.map((t: any) => ({
      id: String(t.id || t._id || t.reference || Math.random()),
      reference: String(t.reference || t.ref || t.id || ""),
      amount: Number(t.amount ?? t.totalAmount ?? 0),
      currency: t.currency || "NGN",
      type: t.type || t.transactionType || "Marketplace Sale",
      status: t.status || "Completed",
      createdAt: t.createdAt || t.createdOn || t.date || new Date().toISOString(),
      description: t.description || t.title || undefined,
      channel: t.channel || t.paymentMethod || undefined,
      customerEmail: t.customerEmail || t.email,
      customerName: t.customerName || t.name,
    }));
  },

  /**
   * 4. GET /api/v1/payments/transactions/{id}
   * Retrieves specific transaction receipt details by ID.
   */
  getTransactionById: async (id: string): Promise<UserTransaction> => {
    const res = await fetcher<any>(`/payments/transactions/${encodeURIComponent(id)}`, {
      method: "GET",
    });

    const t = res?.data || res?.transaction || res;
    return {
      id: String(t.id || id),
      reference: String(t.reference || t.ref || id),
      amount: Number(t.amount ?? 0),
      currency: t.currency || "NGN",
      type: t.type || "Marketplace Sale",
      status: t.status || "Completed",
      createdAt: t.createdAt || t.createdOn || new Date().toISOString(),
      description: t.description,
      channel: t.channel || t.paymentMethod,
      customerEmail: t.customerEmail,
      customerName: t.customerName,
    };
  },

  /**
   * 5. GET /api/v1/payments/sellers-payouts
   * Retrieves list of all seller payouts.
   */
  getSellersPayouts: async (): Promise<SellerPayoutItem[]> => {
    const res = await fetcher<any>("/payments/sellers-payouts", {
      method: "GET",
    });

    const items = Array.isArray(res)
      ? res
      : Array.isArray(res?.items)
      ? res.items
      : Array.isArray(res?.payouts)
      ? res.payouts
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return items.map((p: any) => ({
      id: String(p.id || p.payoutId || Math.random()),
      payoutId: p.payoutId || p.id,
      payeeUserId: String(p.payeeUserId || p.sellerId || p.userId || ""),
      sellerName: p.sellerName || p.payeeName || p.userName || "Verified Producer",
      sellerEmail: p.sellerEmail || p.email,
      orderId: p.orderId,
      orderNumber: p.orderNumber,
      amount: Number(p.amount ?? p.totalAmount ?? 0),
      currency: p.currency || "NGN",
      status: p.status || "Pending",
      provider: p.provider || "Paystack",
      bankName: p.bankName,
      accountNumber: p.accountNumber,
      accountName: p.accountName,
      createdAt: p.createdAt || p.date,
      processedAt: p.processedAt,
      notes: p.notes,
    }));
  },

  /**
   * 6. POST /api/v1/payments/payouts/process
   * Processes disbursement/payout to a seller.
   */
  processPayout: async (
    payload: ProcessPayoutPayload
  ): Promise<ProcessPayoutResponse> => {
    const res = await fetcher<any>("/payments/payouts/process", {
      method: "POST",
      body: JSON.stringify({
        payeeUserId: payload.payeeUserId,
        amount: payload.amount,
        provider: payload.provider || "Paystack",
      }),
    });

    const isSuccess =
      res?.success !== undefined
        ? Boolean(res.success)
        : res?.status === "success" || !res?.error;

    return {
      success: isSuccess,
      status: res?.status || "Processed",
      payoutId: res?.payoutId || res?.id,
      transactionReference: res?.transactionReference || res?.reference,
      message: res?.message || "Payout processed successfully",
    };
  },

  /**
   * 7. GET /api/v1/payments/stats
   * Retrieves high-level payment and escrow statistics.
   */
  getPaymentStats: async (): Promise<PaymentStatsResponse> => {
    const res = await fetcher<any>("/payments/stats", {
      method: "GET",
    });

    const data = res?.data || res;
    return {
      totalProcessed: Number(data?.totalProcessed ?? data?.totalVolume ?? 0),
      escrowBalance: Number(data?.escrowBalance ?? data?.escrowHeld ?? 0),
      totalTransactions: Number(data?.totalTransactions ?? 0),
      successfulTransactions: Number(data?.successfulTransactions ?? 0),
      totalPayouts: Number(data?.totalPayouts ?? 0),
      pendingPayoutsCount: Number(data?.pendingPayoutsCount ?? 0),
      pendingPayoutsAmount: Number(data?.pendingPayoutsAmount ?? 0),
      currency: data?.currency || "NGN",
    };
  },

  /**
   * GET /api/v1/Miscellaneous/payment-methods
   * Returns supported payment methods (BankTransfer, Paystack, Card, Ussd, Flutterwave).
   */
  getPaymentMethods: async (): Promise<PaymentMethodItem[]> => {
    const res = await fetcher<any>("/Miscellaneous/payment-methods", {
      method: "GET",
    });
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return list.map((item: any) => ({
      id: Number(item.id ?? 0),
      name: String(item.name ?? ""),
      description: String(item.description ?? ""),
    }));
  },

  /**
   * GET /api/v1/Miscellaneous/payment-providers
   * Returns supported payment providers (Stub, Paystack, Flutterwave).
   */
  getPaymentProviders: async (): Promise<PaymentProviderItem[]> => {
    const res = await fetcher<any>("/Miscellaneous/payment-providers", {
      method: "GET",
    });
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return list.map((item: any) => ({
      id: Number(item.id ?? 0),
      name: String(item.name ?? ""),
      description: String(item.description ?? ""),
    }));
  },

  /**
   * GET /api/v1/Miscellaneous/payment-statuses
   * Returns payment lifecycle statuses (Pending, EscrowHeld, Processing, Completed, Failed, Confirmed).
   */
  getPaymentStatuses: async (): Promise<PaymentStatusItem[]> => {
    const res = await fetcher<any>("/Miscellaneous/payment-statuses", {
      method: "GET",
    });
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return list.map((item: any) => ({
      id: Number(item.id ?? 0),
      name: String(item.name ?? ""),
      description: String(item.description ?? ""),
    }));
  },
};

export default MarketplacePaymentsApi;