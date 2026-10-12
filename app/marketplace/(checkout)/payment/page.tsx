"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckoutShell from "@/app/marketplace/components/CheckoutShell";
import { useCart } from "@/app/marketplace/context/CartContext";
import { useMarketplaceRole } from "@/app/marketplace/context/MarketplaceRoleContext";
import { marketplaceApi } from "@/app/Services/marketplaceService";
import { MarketplacePaymentsApi } from "@/app/Services/marketplacePaymentServices";
import { getUserBankDetails } from "@/app/Services/userService";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  Loader2,
  Mail,
  User,
  ShoppingBag,
  ExternalLink,
  Building,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

function isUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function generateUuid(): string {
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
}

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, subtotal, total, replaceCart } = useCart();
  const { placeOrder, currentUser } = useMarketplaceRole();

  const [customerName, setCustomerName] = useState(currentUser.name || "");
  const [customerEmail, setCustomerEmail] = useState(currentUser.email || "");
  const [orderRef, setOrderRef] = useState("");
  const [availableMethods, setAvailableMethods] = useState<any[]>([]);
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("BankTransfer");
  const [selectedProvider, setSelectedProvider] = useState<string>("Paystack");
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    // Generate an order identifier if not yet set
    const generated = `YC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderRef(generated);

    // Pre-fill user profile info if available
    if (!customerEmail && typeof window !== "undefined") {
      const storedEmail =
        localStorage.getItem("yuca_user_email") ||
        localStorage.getItem("email") ||
        "";
      if (storedEmail) setCustomerEmail(storedEmail);
    }

    // Fetch dynamic payment methods from live backend: GET /api/v1/Miscellaneous/payment-methods
    MarketplacePaymentsApi.getPaymentMethods()
      .then((methods) => {
        if (Array.isArray(methods) && methods.length > 0) {
          setAvailableMethods(methods);
          const hasBankTransfer = methods.some(
            (m) => m.name.toLowerCase() === "banktransfer"
          );
          if (hasBankTransfer) {
            setSelectedMethod("BankTransfer");
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load payment methods:", err);
      });

    // Fetch dynamic payment providers: GET /api/v1/Miscellaneous/payment-providers
    MarketplacePaymentsApi.getPaymentProviders()
      .then((providers) => {
        if (Array.isArray(providers) && providers.length > 0) {
          setAvailableProviders(providers);
          const paystack = providers.find(
            (p) => p.name.toLowerCase() === "paystack"
          );
          if (paystack) {
            setSelectedProvider(paystack.name);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load payment providers:", err);
      });
  }, [customerEmail]);

  const payableAmount = total > 0 ? total : subtotal;

  const handlePaystackPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerEmail.trim()) {
      toast.error("Please enter a valid email address for Paystack receipt");
      return;
    }

    if (payableAmount <= 0) {
      toast.error("Cart total must be greater than zero");
      return;
    }

    setIsInitializing(true);

    try {
      const firstItem = cartItems[0];
      const deliveryMethod =
        (typeof window !== "undefined" &&
          (localStorage.getItem("yuca_delivery_method") as any)) ||
        "yucavault-pickup";

      const shippingInfo = (() => {
        try {
          return JSON.parse(
            localStorage.getItem("yuca_shipping_info") || "{}"
          );
        } catch {
          return {};
        }
      })();

      // 1. Create Order in backend
      const orderPayload = {
        type: "Standard",
        paymentMethod: selectedMethod || "Paystack",
        deliveryMethod:
          deliveryMethod === "direct-delivery" ? "Delivery" : "SelfPickup",
        deliveryAddress: shippingInfo.address
          ? `${shippingInfo.address}, ${shippingInfo.state || "Oyo"}`
          : currentUser.deliveryAddress || "Farm Gate",
        pickupLocation: "YucaVault Central Cluster, Oyo State",
        preferredPickupDate: new Date().toISOString().split("T")[0],
        logisticsNote: `Paystack Escrow Payment for ${customerName || "Customer"}`,
        batchId:
          firstItem?.id && isUuid(firstItem.id)
            ? firstItem.id
            : "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        quantityKg: firstItem?.quantity
          ? Number(firstItem.quantity) * 1000
          : 1000,
      };

      const apiResult = await marketplaceApi
        .createOrder(orderPayload)
        .catch((err) => {
          console.warn("Backend createOrder API fallback:", err);
          return null;
        });

      // Ensure valid UUIDs for backend Guid parameters
      const validOrderId = isUuid(apiResult?.id)
        ? apiResult.id
        : isUuid(apiResult?.orderId)
        ? apiResult.orderId
        : generateUuid();

      const validMarketplaceOrderId = isUuid(apiResult?.marketplaceOrderId)
        ? apiResult.marketplaceOrderId
        : isUuid(apiResult?.order?.id)
        ? apiResult.order.id
        : validOrderId;

      const displayOrderNumber =
        apiResult?.orderNumber || apiResult?.id || orderRef;

      // 2. Initialize Payment via POST /api/v1/payments/initialize
      const callbackUrl =
        typeof window !== "undefined" && window.location.origin
          ? `${window.location.origin}/marketplace/confirmation?orderNumber=${displayOrderNumber}`
          : "https://yucachain.com/marketplace/confirmation";

      const initPayload = {
        orderId: validOrderId,
        marketplaceOrderId: validMarketplaceOrderId,
        amount: Number(payableAmount),
        paymentMethod: selectedMethod || "BankTransfer",
        provider: selectedProvider || "Paystack",
        callbackUrl,
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim() || "Valued Buyer",
      };

      const initResult = await MarketplacePaymentsApi.initializePayment(initPayload);

      // Extract the Paystack checkout URL
      const targetUrl =
        initResult.paymentUrl || initResult.authorizationUrl;

      if (!targetUrl) {
        throw new Error(
          "Paystack checkout URL was not returned by the payment gateway. Please verify that your Paystack keys are configured in backend appsettings."
        );
      }

      // Resolve seller bank details dynamically from API
      let sellerBank = (firstItem as any)?.sellerBankDetails || (firstItem as any)?.bankDetails || null;
      if (!sellerBank?.accountNumber) {
        try {
          const sellerUserId = (firstItem as any)?.sellerId || (firstItem as any)?.userId;
          const liveBank = await getUserBankDetails(sellerUserId);
          if (liveBank && liveBank.accountNumber) {
            sellerBank = {
              bankName: liveBank.bankName || "Commercial Bank",
              accountNumber: liveBank.accountNumber,
              accountName: liveBank.accountName || firstItem?.seller || "Verified Seller",
            };
          }
        } catch {}
      }

      // Save order state locally
      const createdOrderNumber = placeOrder({
        orderNumber: displayOrderNumber,
        productTitle: firstItem ? firstItem.title : "Cassava Produce & Goods",
        category: firstItem
          ? (firstItem as any).category || "Produce"
          : "Produce",
        sellerName: firstItem ? firstItem.seller : "Verified Farm Hub",
        sellerRole: (firstItem as any)?.sellerRole || "farmer",
        sellerId: (firstItem as any)?.sellerId || (firstItem as any)?.userId,
        quantity: firstItem ? firstItem.quantity : 1,
        unit: firstItem ? firstItem.unit : "Tonnes",
        totalAmount: payableAmount,
        deliveryMethod,
        paymentStatus: "Paid to YucaChain Escrow",
        payoutStatus: "Pending Admin Payout",
        sellerBankDetails: sellerBank || {
          bankName: "Awaiting Bank Setup",
          accountNumber: "No bank details on file",
          accountName: firstItem?.seller || "Verified Seller",
        },
      });

      try {
        localStorage.setItem(
          "yuca_last_order_ref",
          createdOrderNumber || displayOrderNumber
        );
        if (initResult.reference) {
          localStorage.setItem(
            "yuca_pending_payment_ref",
            initResult.reference
          );
        }
      } catch {}

      replaceCart([]);

      // 3. Navigate user directly to Paystack website!
      toast.success("Redirecting to Paystack secure checkout...");
      window.location.href = targetUrl;
    } catch (err: any) {
      console.error("Payment initialization failed:", err);
      const errMsg =
        err?.message ||
        "Could not initialize Paystack payment. Please check backend configuration.";
      setPaymentError(errMsg);
      toast.error(errMsg);
      setIsInitializing(false);
    }
  };

  return (
    <CheckoutShell currentStep={3} cardMaxWidth="max-w-4xl">
      <div className="font-sans">
        {/* Header Section */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#226049] border border-emerald-200/80 mb-3 shadow-2xs">
            <ShieldCheck size={14} className="text-[#226049]" />
            <span>Escrow Protected Checkout</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Secure Payment
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Pay safely via Paystack. Funds are held in escrow until produce is
            inspected and delivered.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Form (Paystack Gateway) */}
          <div className="lg:col-span-7 space-y-5">
            <form
              onSubmit={handlePaystackPayment}
              className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-7 shadow-sm space-y-6"
            >
              {/* Payment Gateway Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#226049] flex items-center justify-center font-bold">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Paystack Secure Gateway
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Virtual Bank Transfer, Debit Card &amp; USSD
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <Lock size={11} />
                  <span>256-bit SSL</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Channel / Method
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("BankTransfer")}
                    className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                      selectedMethod === "BankTransfer"
                        ? "border-[#226049] bg-emerald-50/70 text-[#226049] shadow-2xs font-bold ring-1 ring-[#226049]"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Building size={16} className={selectedMethod === "BankTransfer" ? "text-[#226049]" : "text-gray-400"} />
                    <p className="leading-tight mt-1">Bank Transfer</p>
                    <span className="text-[10px] text-gray-400 font-normal">Pay to Virtual Acc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("Card")}
                    className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                      selectedMethod === "Card"
                        ? "border-[#226049] bg-emerald-50/70 text-[#226049] shadow-2xs font-bold ring-1 ring-[#226049]"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard size={16} className={selectedMethod === "Card" ? "text-[#226049]" : "text-gray-400"} />
                    <p className="leading-tight mt-1">Debit Card</p>
                    <span className="text-[10px] text-gray-400 font-normal">Visa / Verve / Master</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("Ussd")}
                    className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                      selectedMethod === "Ussd"
                        ? "border-[#226049] bg-emerald-50/70 text-[#226049] shadow-2xs font-bold ring-1 ring-[#226049]"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Smartphone size={16} className={selectedMethod === "Ussd" ? "text-[#226049]" : "text-gray-400"} />
                    <p className="leading-tight mt-1">USSD</p>
                    <span className="text-[10px] text-gray-400 font-normal">Bank dial code</span>
                  </button>
                </div>
              </div>

              {/* Channel Explanatory Banner */}
              {selectedMethod === "BankTransfer" && (
                <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                  <Building size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Paystack Virtual Bank Transfer:</span>
                    <p className="mt-0.5 text-amber-800 text-[11px]">
                      When you click &ldquo;Proceed to Paystack&rdquo;, you will be taken to Paystack&apos;s official checkout page where a unique 10-digit virtual bank account number (e.g. Wema Bank, Sterling) is generated specifically for this order. Transfer directly from your bank app, and Paystack will instantly confirm your escrow deposit.
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Customer Name
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Doe or Prime Mills"
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#226049] focus:outline-none focus:ring-1 focus:ring-[#226049] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. buyer@example.com"
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#226049] focus:outline-none focus:ring-1 focus:ring-[#226049] transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    Paystack receipt &amp; payment reference will be sent here.
                  </p>
                </div>
              </div>

              {/* Supported payment badges */}
              <div className="rounded-2xl bg-gray-50/70 border border-gray-100 p-3.5 flex items-center justify-between text-gray-600 text-xs">
                <span className="text-[11px] font-medium text-gray-500">
                  Accepted Channels
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-700">
                  <span className="bg-white border border-gray-200 px-2 py-0.5 rounded shadow-2xs">
                    Bank Transfer
                  </span>
                  <span className="bg-white border border-gray-200 px-2 py-0.5 rounded shadow-2xs">
                    Debit Cards
                  </span>
                  <span className="bg-white border border-gray-200 px-2 py-0.5 rounded shadow-2xs">
                    USSD
                  </span>
                </div>
              </div>

              {/* Escrow Guarantee note */}
              <div className="flex items-start gap-2.5 text-[11px] text-gray-500 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5">
                <ShieldCheck
                  size={16}
                  className="text-[#226049] shrink-0 mt-0.5"
                />
                <p className="leading-relaxed">
                  <strong className="text-gray-900 font-semibold">
                    Escrow Protection Guarantee:
                  </strong>{" "}
                  Your funds are secured until produce intake and physical
                  inspection are approved.
                </p>
              </div>

              {/* Error Alert Display */}
              {paymentError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-rose-900">Payment Initialization Notice</p>
                    <p className="text-rose-700 font-mono text-[11px] break-all">{paymentError}</p>
                    <p className="text-[11px] text-rose-600">
                      Redirect stopped because the checkout URL was not provided. Please check the backend connection or credentials.
                    </p>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isInitializing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#226049] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1a4336] transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {isInitializing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Connecting to Paystack...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Proceed to Paystack (₦{payableAmount.toLocaleString()})
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={17} className="text-[#226049]" />
                  <h4 className="text-sm font-bold text-gray-900">
                    Order Summary
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {orderRef}
                </span>
              </div>

              {/* Items in cart */}
              <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
                {cartItems.length > 0 ? (
                  cartItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between text-xs py-1.5"
                    >
                      <div className="pr-2 truncate">
                        <p className="font-semibold text-gray-800 truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Qty: {item.quantity} {item.unit || "tonnes"}
                        </p>
                      </div>
                      <span className="font-bold text-gray-900 shrink-0">
                        ₦{((item.pricePerTonne || (item as any).price || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Produce checkout
                  </p>
                )}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Escrow Fee</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                    Free (Sponsored)
                  </span>
                </div>
                {total > subtotal && (
                  <div className="flex justify-between">
                    <span>Logistics / Delivery</span>
                    <span className="font-semibold text-gray-800">
                      ₦{(total - subtotal).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">
                    Total Payable
                  </span>
                  <span className="text-xl font-extrabold text-[#226049]">
                    ₦{payableAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Security Badge */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-center">
              <p className="text-[11px] text-gray-500 font-medium">
                Official Settlement Provider:{" "}
                <span className="font-bold text-gray-800">Paystack Payments</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </CheckoutShell>
  );
}
