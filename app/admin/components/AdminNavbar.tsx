"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Menu, LogOut, ShieldCheck, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/Context/AuthContext";
import type { Notification } from "./types";
import NotificationDropdown from "./NotificationDropdown";
import { notificationService } from "@/app/Services/notificationService";
import type { MarketplaceNotification } from "@/app/types/notification";
import { resolveDisplayName, getInitials } from "@/app/Services/authService";
import { toast } from "sonner";

export interface AdminNavbarProps {
  hasNotifications?: boolean;
  onSearch?: (query: string) => void;
  notifications?: Notification[];
  onToggleMobileSidebar?: () => void;
}

const defaultUser = {
  initials: "AD",
  name: "System Administrator",
  role: "Super Admin",
};

function mapToNavbarNotification(notif: MarketplaceNotification): Notification {
  let type: Notification["type"] = "info";
  if (notif.category === "shipping") {
    type = "dispatch";
  } else if (notif.category === "pricing" || notif.category === "order") {
    type = "market-order";
  } else if (notif.category === "payment") {
    type = "batch-received";
  }

  return {
    id: notif.id,
    type,
    title: notif.title,
    description: notif.message,
    time: notif.time,
    read: notif.read,
  };
}

export default function AdminNavbar({
  notifications: notificationsProp,
  onSearch,
  onToggleMobileSidebar,
}: AdminNavbarProps) {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>(
    notificationsProp ?? []
  );

  useEffect(() => {
    if (notificationsProp) {
      setNotifications(notificationsProp);
      return;
    }

    let isMounted = true;
    notificationService
      .getNotifications()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setNotifications(data.map(mapToNavbarNotification));
        }
      })
      .catch((err) => {
        console.error("Failed to load notifications for admin navbar:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [notificationsProp]);

  const effectiveUser = authUser;
  const displayName = resolveDisplayName(
    effectiveUser,
    "Super Admin"
  );
  const displayInitials = getInitials(displayName) || "AD";

  const activeUser = {
    name: displayName,
    initials: displayInitials,
    role: "System Administrator",
    email: authUser?.email || "admin@yucachain.com",
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    toast.success("Admin signed out successfully");
    await logout();
    router.push("/admin-login");
  };

  return (
    <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-40 font-sans shrink-0">
      <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-3.5 lg:px-8">
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={22} />
            </button>
          )}

          <Link href="/admin">
            <Image
              src="/images/Yucachain_Logo.png"
              alt="YucaChain Logo"
              width={120}
              height={40}
              className="object-contain w-24 sm:w-28 md:w-32 h-auto"
              priority
            />
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-2 hidden md:block">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
            <Search size={16} strokeWidth={1.8} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              placeholder="Search users, orders, batches, or transactions..."
              className="w-full bg-transparent text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Bell button + dropdown */}
          <div className="relative">
            <button
              type="button"
              id="notification-bell"
              aria-label="Notifications"
              aria-expanded={bellOpen}
              onClick={() => setBellOpen((v) => !v)}
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer shadow-2xs"
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

          {/* Admin profile button + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 sm:gap-3 rounded-full py-1 pl-1 pr-1.5 sm:pr-2 transition-colors hover:bg-gray-50 cursor-pointer shadow-2xs"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#226049]/10 text-xs sm:text-sm font-semibold text-[#226049]">
                {activeUser.initials}
              </span>
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                  {activeUser.name}
                </span>
                <span className="block text-xs text-gray-500 truncate max-w-[160px]">
                  {activeUser.role}
                </span>
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{activeUser.name}</p>
                  <p className="text-[11px] text-gray-400">{activeUser.email}</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
