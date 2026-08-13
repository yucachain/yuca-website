"use client";

import React, { useState } from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import type { AggregatorUser, Notification } from "./types";
import NotificationDropdown from "./NotificationDropdown";

export interface AggregatorNavbarProps {
  user?: AggregatorUser;
  hasNotifications?: boolean;
  onSearch?: (query: string) => void;
  /** Optional: override the default sample notifications */
  notifications?: Notification[];
  onToggleMobileSidebar?: () => void;
}

const defaultUser: AggregatorUser = {
  initials: "PP",
  name: "Penpal",
  role: "Aggregator",
};

/** Sample notifications shown until a real API is wired up */
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "batch-received",
    title: "Batch AGG-000234 received",
    description: "Batch from Alaba Farms has been received and logged.",
    time: "09:45 AM · Today",
    read: false,
  },
  {
    id: "2",
    type: "storage-assigned",
    title: "Batch AGG-000221 assigned to storage",
    description: "Assigned to YucaVault #1 Ilorin — Unit A-24.",
    time: "09:12 AM · Today",
    read: false,
  },
  {
    id: "3",
    type: "dispatch",
    title: "Order MO-2026-011 dispatched",
    description: "Lot CL-2026-00031 is now in transit to Ibadan Millers Co.",
    time: "08:50 AM · Today",
    read: true,
  },
  {
    id: "4",
    type: "alert",
    title: "3 batches at spoilage risk",
    description:
      "Batches YC-2026-00142, YC-2026-00134, and YC-2026-00129 need immediate attention.",
    time: "Yesterday · 06:30 PM",
    read: false,
  },
  {
    id: "5",
    type: "market-order",
    title: "New market order MO-2026-016",
    description:
      "Green Valley Processing placed a new order for 12,000 kg of cassava.",
    time: "Yesterday · 02:15 PM",
    read: true,
  },
  {
    id: "6",
    type: "info",
    title: "System maintenance scheduled",
    description:
      "Yucachain will undergo brief maintenance on Aug 12, 2026 at 2:00 AM.",
    time: "Aug 8, 2026",
    read: true,
  },
];

export default function AggregatorNavbar({
  user = defaultUser,
  notifications: notificationsProp,
  onSearch,
  onToggleMobileSidebar,
}: AggregatorNavbarProps) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(
    notificationsProp ?? SAMPLE_NOTIFICATIONS
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-3.5 lg:px-8">
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={22} />
            </button>
          )}

          <Image
            src="/images/Yucachain_Logo.png"
            alt="YucaChain Logo"
            width={120}
            height={120}
            className="object-contain w-24 sm:w-28 md:w-32 h-auto"
          />
        </div>

        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
            <Search size={16} strokeWidth={1.8} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              placeholder="Search Batches..."
              className="w-full bg-transparent text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Bell button + dropdown wrapper */}
          <div className="relative">
            <button
              type="button"
              id="notification-bell"
              aria-label="Notifications"
              aria-expanded={bellOpen}
              onClick={() => setBellOpen((v) => !v)}
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Bell size={18} strokeWidth={1.6} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#226049]" />
              )}
            </button>

            {bellOpen && (
              <NotificationDropdown
                notifications={notifications}
                onClose={() => setBellOpen(false)}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
              />
            )}
          </div>

          <div className="h-7 sm:h-8 w-px bg-gray-200" />

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 sm:gap-3 rounded-full py-1 pl-1 pr-1.5 sm:pr-2 transition-colors hover:bg-gray-50"
            aria-expanded={menuOpen}
          >
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#226049]/10 text-xs sm:text-sm font-semibold text-[#226049]">
              {user.initials}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-semibold text-gray-900">
                {user.name}
              </span>
              <span className="block text-xs text-gray-500">{user.role}</span>
            </span>
            <span className="text-gray-400">
              <ChevronDown size={14} strokeWidth={1.8} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
