"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Truck,
  ShieldCheck,
  Tag,
  AlertCircle,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import MarketplaceNavbar from "../components/MarketplaceNavbar";
import Footer from "@/app/components/Footer";

export interface MarketplaceNotification {
  id: string;
  category: "shipping" | "pricing" | "system" | "payment";
  title: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
  linkText?: string;
  linkHref?: string;
}

const SAMPLE_NOTIFICATIONS: MarketplaceNotification[] = [
  {
    id: "notif-1",
    category: "shipping",
    title: "Order MO-2026-014 Dispatched",
    message: "Your cassava order MO-2026-014 has been consolidated into YucaVault #1 Ilorin and is now in transit with cold-chain tracking.",
    time: "10 mins ago",
    read: false,
    orderId: "MO-2026-014",
    linkText: "View Order Status",
    linkHref: "/marketplace/cart",
  },
  {
    id: "notif-2",
    category: "payment",
    title: "Escrow Deposit Verified",
    message: "Payment of ₦1,440,000 for Order MO-2026-014 has been secured in YucaPay Escrow.",
    time: "2 hours ago",
    read: false,
    orderId: "MO-2026-014",
    linkText: "View Receipt",
    linkHref: "/marketplace/cart",
  },
  {
    id: "notif-3",
    category: "pricing",
    title: "New Batch Available: TME 419 Stems",
    message: "Top Farmers Ltd. listed 15,000 kg of Grade A Cassava Stems at ₦120/kg in Kwara State.",
    time: "5 hours ago",
    read: false,
    linkText: "Browse Product",
    linkHref: "/marketplace",
  },
  {
    id: "notif-4",
    category: "shipping",
    title: "Logistics Vehicle Allocated",
    message: "Driver assigned to transport Lot CL-2026-00031. Estimated arrival at Ikeja Hub tomorrow at 10:00 AM.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "notif-5",
    category: "system",
    title: "Buyer Verification Status Renewed",
    message: "Drevo Foods Ltd. corporate verification badge renewed for 2026–2027.",
    time: "2 days ago",
    read: true,
  },
];

const categoryIcons = {
  shipping: <Truck size={18} className="text-[#226049]" />,
  payment: <ShieldCheck size={18} className="text-emerald-700" />,
  pricing: <Tag size={18} className="text-amber-600" />,
  system: <AlertCircle size={18} className="text-blue-600" />,
};

const categoryBadgeStyles = {
  shipping: "bg-emerald-50 text-emerald-800 border-emerald-200",
  payment: "bg-blue-50 text-blue-800 border-blue-200",
  pricing: "bg-amber-50 text-amber-800 border-amber-200",
  system: "bg-purple-50 text-purple-800 border-purple-200",
};

export default function MarketplaceNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>(SAMPLE_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread" | "shipping" | "pricing" | "system">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "shipping") return n.category === "shipping" || n.category === "payment";
    if (filter === "pricing") return n.category === "pricing";
    if (filter === "system") return n.category === "system";
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#F9FAFB]">
      <MarketplaceNavbar
        hasNotifications={unreadCount > 0}
        onCartClick={() => router.push("/marketplace/cart")}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-5xl mx-auto w-full">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => router.push("/marketplace")}
          className="mb-4 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 hover:underline cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Marketplace
        </button>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#226049] px-2.5 py-0.5 text-xs font-bold text-white">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Stay updated on your cassava orders, batch dispatches, price alerts, and escrow payments.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <CheckCheck size={16} className="text-[#226049]" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto touch-scroll py-4 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={[
              "rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
              filter === "all"
                ? "bg-[#226049] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            All ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={[
              "rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
              filter === "unread"
                ? "bg-[#226049] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            Unread ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter("shipping")}
            className={[
              "rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
              filter === "shipping"
                ? "bg-[#226049] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            Orders &amp; Shipping
          </button>

          <button
            type="button"
            onClick={() => setFilter("pricing")}
            className={[
              "rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
              filter === "pricing"
                ? "bg-[#226049] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            Price &amp; Stock Alerts
          </button>

          <button
            type="button"
            onClick={() => setFilter("system")}
            className={[
              "rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
              filter === "system"
                ? "bg-[#226049] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            System
          </button>
        </div>

        {/* Notifications List */}
        <div className="mt-2 space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={[
                "group relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all shadow-xs",
                notif.read
                  ? "bg-white border-gray-100/90 text-gray-600"
                  : "bg-emerald-50/40 border-emerald-100 text-gray-900 ring-1 ring-emerald-200/50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Icon Container */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-100 shadow-2xs mt-0.5">
                  {categoryIcons[notif.category]}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-[#226049]" />
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                    <span className="text-gray-400 font-medium">{notif.time}</span>

                    {notif.linkHref && (
                      <button
                        type="button"
                        onClick={() => router.push(notif.linkHref!)}
                        className="inline-flex items-center gap-1 font-semibold text-[#226049] hover:underline cursor-pointer"
                      >
                        {notif.linkText || "View Details"}
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-start pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handleToggleRead(notif.id)}
                  title={notif.read ? "Mark as unread" : "Mark as read"}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-800 hover:bg-white transition-colors cursor-pointer"
                >
                  <CheckCircle2 size={16} className={notif.read ? "text-gray-300" : "text-[#226049]"} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(notif.id)}
                  title="Dismiss notification"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-gray-100 bg-white p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 mb-3">
                <Bell size={24} />
              </div>
              <p className="text-sm font-bold text-gray-900">No notifications found</p>
              <p className="mt-1 text-xs text-gray-500 max-w-sm">
                You do not have any notifications matching this filter at the moment.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
