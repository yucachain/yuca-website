"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Truck,
  Search,
  MapPin,
  Scale,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import MarketplaceNavbar from "../components/MarketplaceNavbar";
import Footer from "@/app/components/Footer";
import type { TrackDispatchResult } from "@/app/types/batchVaultDispatch";
import { dispatchService } from "@/app/Services/dispatchService";

function TrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || searchParams.get("tracking") || "";

  const [searchCode, setSearchCode] = useState(initialCode);
  const [trackResult, setTrackResult] = useState<TrackDispatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [escrowReleased, setEscrowReleased] = useState(false);

  const fetchTracking = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await dispatchService.trackShipment(code.trim());
      setTrackResult(res);
    } catch (err: any) {
      console.error("Tracking lookup error:", err);
      setTrackResult(null);
      setErrorMsg(
        err?.message ||
          `No shipment found for tracking code "${code.trim()}". Please verify your tracking number and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchTracking(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      fetchTracking(searchCode.trim());
    }
  };

  const handleConfirmReceipt = async () => {
    if (!trackResult) return;
    setConfirming(true);
    try {
      await dispatchService.confirmReceipt(trackResult.dispatch.id);
      setEscrowReleased(true);
      setConfirmModalOpen(false);
      setTrackResult((prev) =>
        prev
          ? {
              ...prev,
              dispatch: { ...prev.dispatch, status: "delivered" },
              timeline: [
                ...prev.timeline,
                {
                  status: "Delivery Confirmed & Escrow Released",
                  time: "Just now",
                  location: trackResult.dispatch.buyerDeliveryAddress,
                  description: "Buyer confirmed produce receipt. Escrow funds released to seller.",
                },
              ],
            }
          : prev
      );
    } catch (err: any) {
      console.error("Receipt confirmation error:", err);
      setErrorMsg(err?.message || "Failed to confirm produce receipt on server. Please try again.");
      setConfirmModalOpen(false);
    } finally {
      setConfirming(false);
    }
  };

  const currentStatus = trackResult?.dispatch.status || "pending";
  const stepIndex =
    currentStatus === "delivered"
      ? 3
      : currentStatus === "in-transit"
      ? 2
      : currentStatus === "dispatched"
      ? 1
      : 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <MarketplaceNavbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-[#226049] mb-3">
            <Truck size={14} />
            Live Shipment Telematics
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Track Your Cassava Shipment
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            Enter your freight tracking number to monitor dispatch status, transit route, and confirm delivery to release escrow funds.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter tracking code (e.g. TRK-9921-KD)"
                className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-mono text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchCode.trim()}
              className="rounded-2xl bg-[#226049] px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#1a4336] transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : "Track"}
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-700 flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {escrowReleased && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex items-start gap-3 text-emerald-900 animate-in fade-in">
            <ShieldCheck size={24} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Escrow Released Successfully!</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Thank you for confirming receipt of your order. The smart contract has validated the delivery and released the held escrow payment to the suppliers.
              </p>
            </div>
          </div>
        )}

        {!trackResult && !loading && !errorMsg && (
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center text-xs text-gray-500 shadow-xs">
            <Truck size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700 text-sm">No Shipment Looked Up Yet</p>
            <p className="mt-1 text-gray-400 max-w-sm mx-auto">
              Please enter your freight tracking code in the field above to retrieve live telematics and dispatch waybill information.
            </p>
          </div>
        )}

        {trackResult && (
          <div className="space-y-6">
            {/* Status Progress Stepper */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Tracking Number
                  </span>
                  <p className="text-lg font-bold font-mono text-gray-900 mt-0.5">
                    {trackResult.dispatch.trackingNumber || trackResult.dispatch.trackingCode}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Carrier:</span>
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800">
                    {trackResult.dispatch.carrierName}
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-4 gap-2 text-center relative">
                {["Order Placed", "Dispatched", "In Transit", "Delivered"].map((step, idx) => {
                  const isDone = idx <= stepIndex;
                  const isCurrent = idx === stepIndex;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={[
                          "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs font-bold transition-all",
                          isDone
                            ? "bg-[#226049] text-white shadow-2xs"
                            : "bg-gray-100 text-gray-400",
                          isCurrent ? "ring-4 ring-emerald-100" : "",
                        ].join(" ")}
                      >
                        {isDone ? <Check size={16} strokeWidth={2.5} /> : idx + 1}
                      </div>
                      <span
                        className={[
                          "text-xs font-semibold mt-2",
                          isDone ? "text-gray-900" : "text-gray-400",
                        ].join(" ")}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipment Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs space-y-3 text-xs">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Scale size={16} className="text-[#226049]" />
                  Freight &amp; Weighbridge Verification
                </h3>
                <div className="flex justify-between text-gray-600">
                  <span>Verified Weight:</span>
                  <span className="font-bold text-gray-900">
                    {(trackResult.dispatch.weightKg || 0).toLocaleString()} kg
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Weighbridge Ticket:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {trackResult.dispatch.weighbridgeTicket}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pickup Location:</span>
                  <span className="font-semibold text-gray-900">
                    {trackResult.dispatch.pickupHub}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs space-y-3 text-xs">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <MapPin size={16} className="text-[#226049]" />
                  Destination &amp; ETA
                </h3>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Address:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[200px] truncate">
                    {trackResult.dispatch.buyerDeliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery:</span>
                  <span className="font-bold text-emerald-800">
                    {trackResult.dispatch.estimatedDelivery || "In Transit"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Current Location:</span>
                  <span className="font-semibold text-gray-900">
                    {trackResult.currentLocation || "In Transit Corridor"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Events Timeline */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-7 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-[#226049]" />
                Shipment History
              </h3>

              <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {trackResult.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-[#226049] ring-4 ring-emerald-50" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900">{event.status}</span>
                      <span className="text-gray-400 font-medium">{event.time}</span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{event.description}</p>
                    )}
                    {event.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 mt-1">
                        <MapPin size={11} /> {event.location}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Confirm Receipt Action for Buyer */}
              {trackResult.dispatch.status !== "delivered" && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Received your cassava batch?</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Confirming produce delivery releases the payment held safely in escrow.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#226049] px-6 py-3 text-xs font-bold text-white hover:bg-[#1a4336] transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <ShieldCheck size={16} />
                    Confirm Delivery &amp; Release Escrow
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#226049] mb-4">
                <ShieldCheck size={28} />
              </div>

              <h3 className="text-base font-bold text-gray-900">Confirm Produce Delivery</h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                By confirming, you acknowledge that the cassava lot has arrived at your facility and satisfies your quality requirements. This will trigger the smart contract to release the held escrow funds.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceipt}
                  disabled={confirming}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#226049] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#1a4336] transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {confirming && <Loader2 size={14} className="animate-spin" />}
                  Confirm &amp; Release Funds
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
          <RefreshCw size={24} className="animate-spin text-[#226049]" />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
