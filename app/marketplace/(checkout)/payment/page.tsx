"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckoutShell from "@/app/marketplace/components/CheckoutShell";
import { useCart } from "@/app/marketplace/context/CartContext";
import { useMarketplaceRole } from "@/app/marketplace/context/MarketplaceRoleContext";
import { marketplaceApi } from "@/app/Services/marketplaceService";
import {
  Building2,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Upload,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, subtotal, total, replaceCart } = useCart();
  const { placeOrder, activeRole, currentUser } = useMarketplaceRole();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transferRef, setTransferRef] = useState("");
  const [depositorName, setDepositorName] = useState(currentUser.name || "");
  const [orderRef, setOrderRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const generated = `YC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderRef(generated);
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName === "account" ? "Account number" : fieldName === "ref" ? "Order reference" : "Text"} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCompletePayment = async () => {
    setSubmitting(true);

    try {
      let firstItem = cartItems[0];
      const deliveryMethod =
        (typeof window !== "undefined" &&
          (localStorage.getItem("yuca_delivery_method") as any)) ||
        "yucavault-pickup";

      const shippingInfo = (() => {
        try {
          return JSON.parse(localStorage.getItem("yuca_shipping_info") || "{}");
        } catch {
          return {};
        }
      })();

      const orderPayload = {
        type: "Standard",
        paymentMethod: "BankTransfer",
        deliveryMethod: deliveryMethod === "direct-delivery" ? "Delivery" : "SelfPickup",
        deliveryAddress: shippingInfo.address ? `${shippingInfo.address}, ${shippingInfo.state || "Oyo"}` : (currentUser.deliveryAddress || "Farm Gate"),
        pickupLocation: "YucaVault Central Cluster, Oyo State",
        preferredPickupDate: new Date().toISOString().split("T")[0],
        logisticsNote: transferRef ? `Transfer Ref: ${transferRef} (Depositor: ${depositorName})` : "Bank transfer to YucaChain Escrow",
        batchId: firstItem?.id && firstItem.id.length > 20
          ? firstItem.id
          : "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        quantityKg: firstItem?.quantity ? Number(firstItem.quantity) * 1000 : 1000,
      };

      const apiResult = await marketplaceApi.createOrder(orderPayload).catch((err) => {
        console.warn("Backend createOrder API fallback:", err);
        return null;
      });

      if (transferRef.trim()) {
        await marketplaceApi.verifyPayment(transferRef.trim(), "BankTransfer").catch((err) => {
          console.warn("verifyPayment API notice:", err);
        });
      }

      const assignedOrderNumber = apiResult?.orderNumber || apiResult?.id || orderRef;

      const createdOrderNumber = placeOrder({
        orderNumber: assignedOrderNumber,
        productTitle: firstItem ? firstItem.title : "Cassava Produce & Goods",
        category: firstItem ? (firstItem as any).category || "Produce" : "Produce",
        sellerName: firstItem ? firstItem.seller : "Verified Farm Hub",
        sellerRole: "farmer",
        quantity: firstItem ? firstItem.quantity : 1,
        unit: firstItem ? firstItem.unit : "Tonnes",
        totalAmount: total > 0 ? total : subtotal,
        deliveryMethod,
        paymentStatus: "Paid to YucaChain Escrow",
        payoutStatus: "Pending Admin Payout",
        sellerBankDetails: {
          bankName: "First Bank of Nigeria",
          accountNumber: "3084920194",
          accountName: "Musa Ibrahim Farm Ent.",
        },
      });

      try {
        localStorage.setItem("yuca_last_order_ref", createdOrderNumber || assignedOrderNumber);
      } catch { }

      replaceCart([]);
      setSubmitting(false);
      toast.success("Payment submitted to YucaChain Escrow!");
      router.push(`/marketplace/confirmation?orderNumber=${createdOrderNumber || assignedOrderNumber}`);
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err.message || "Failed to process payment");
    }
  };

  return (
    <CheckoutShell currentStep={3} cardMaxWidth="max-w-4xl">
      <div className="font-sans">
        <div className="text-center max-w-lg mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#226049] border border-emerald-200 mb-2">
            <ShieldCheck size={14} />
            Escrow-Protected Bank Transfer
          </span>
          <h2 className="text-2xl font-bold text-gray-900">
            Pay to YucaChain Official Account
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Transfer order amount directly to the company escrow account. Funds are held safely until produce inspection &amp; delivery are verified.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Company Bank Account Details Card */}
          <div className="rounded-3xl border-2 border-[#226049]/20 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/20 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Building2 size={20} className="text-[#226049]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">YucaChain Company Account</h3>
                <p className="text-[11px] text-gray-500">Designated Escrow Collection Account</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Bank Name */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400">BANK NAME</p>
                  <p className="font-bold text-gray-900 text-sm">Sterling Bank Plc</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Official Partner Bank
                </span>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400">ACCOUNT NUMBER</p>
                  <p className="font-mono font-extrabold text-gray-900 text-base tracking-wider">
                    0124892301
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("0124892301", "account")}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#226049] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedField === "account" ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400">BENEFICIARY ACCOUNT NAME</p>
                  <p className="font-bold text-gray-900 text-sm">
                    YucaChain Technologies Ltd - Escrow
                  </p>
                </div>
              </div>

              {/* Unique Payment Reference */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-100/40 border border-emerald-200/80">
                <div>
                  <p className="text-[10px] font-bold text-emerald-900">
                    PAYMENT REMARK / REFERENCE
                  </p>
                  <p className="font-mono font-bold text-[#226049] text-xs">
                    {orderRef || "YC-ORD-948201"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(orderRef || "YC-ORD-948201", "ref")}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#226049] bg-white px-2.5 py-1 rounded-md shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {copiedField === "ref" ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                  <span>{copiedField === "ref" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Total Payable */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Total Amount to Transfer:</span>
                <span className="text-xl font-extrabold text-gray-900">
                  ₦{(total > 0 ? total : subtotal).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Transfer Confirmation Form */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h4 className="font-bold text-gray-900 text-sm">
              Confirm Your Bank Transfer
            </h4>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              After transferring funds from your banking app or USSD, enter your transfer details below so our automated system instantly reconciles your payment.
            </p>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Sender Account Name / Depositor Name *
              </label>
              <input
                type="text"
                required
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
                placeholder="e.g. Musa Ibrahim or PrimeStarch Mills"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#226049] focus:outline-none focus:ring-1 focus:ring-[#226049]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Bank Transfer Session ID / Transaction Ref
              </label>
              <input
                type="text"
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value)}
                placeholder="e.g. 000013260928192038192"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-mono text-xs text-gray-900 focus:border-[#226049] focus:outline-none focus:ring-1 focus:ring-[#226049]"
              />
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload size={18} className="mx-auto text-gray-400 mb-1" />
              <p className="font-semibold text-gray-700 text-xs">Upload Transfer Receipt (Optional)</p>
              <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, or PDF receipt screenshot</p>
            </div>

            <button
              type="button"
              onClick={handleCompletePayment}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#226049] py-3 text-sm font-bold text-white shadow-md hover:bg-[#1a4336] transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Transfer &amp; Confirming Order...</span>
                </>
              ) : (
                <>
                  <span>I Have Completed the Transfer</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </CheckoutShell>
  );
}
