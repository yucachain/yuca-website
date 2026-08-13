"use client";

import React from "react";
import {
  X,
  Bell,
  CheckCheck,
  ArrowDownToLine,
  Database,
  Truck,
  AlertTriangle,
  ShoppingCart,
  Info,
} from "lucide-react";
import type { Notification, NotificationType } from "./types";

const typeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; bg: string; iconColor: string }
> = {
  "batch-received": {
    icon: <ArrowDownToLine size={15} strokeWidth={2} />,
    bg: "bg-emerald-50",
    iconColor: "text-[#226049]",
  },
  "storage-assigned": {
    icon: <Database size={15} strokeWidth={2} />,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  dispatch: {
    icon: <Truck size={15} strokeWidth={2} />,
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  "market-order": {
    icon: <ShoppingCart size={15} strokeWidth={2} />,
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  alert: {
    icon: <AlertTriangle size={15} strokeWidth={2} />,
    bg: "bg-red-50",
    iconColor: "text-red-500",
  },
  info: {
    icon: <Info size={15} strokeWidth={2} />,
    bg: "bg-gray-100",
    iconColor: "text-gray-500",
  },
};

export interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
}

export default function NotificationDropdown({
  notifications,
  onClose,
  onMarkAllRead,
  onMarkRead,
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Backdrop — closes dropdown on outside click */}
      <div
        className="fixed inset-0 z-40"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Popover panel */}
      <div
        role="dialog"
        aria-label="Notifications"
        className="fixed inset-x-3 sm:inset-auto sm:right-0 top-16 sm:top-full z-50 mt-2 sm:mt-2.5 w-auto sm:w-[360px] max-w-sm sm:max-w-[360px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all mx-auto sm:mx-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell size={16} strokeWidth={1.8} className="text-[#226049]" />
            <span className="text-sm font-bold text-gray-900">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#226049] px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-[#226049] transition-colors hover:bg-[#226049]/10"
              >
                <CheckCheck size={13} strokeWidth={2} />
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Bell size={22} strokeWidth={1.6} className="text-gray-400" />
              </span>
              <p className="text-sm text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <ul>
              {notifications.map((notif, idx) => {
                const cfg = typeConfig[notif.type];
                return (
                  <li key={notif.id}>
                    <button
                      type="button"
                      onClick={() => onMarkRead?.(notif.id)}
                      className={[
                        "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50",
                        !notif.read ? "bg-[#226049]/[0.03]" : "",
                        idx !== notifications.length - 1
                          ? "border-b border-gray-50"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {/* Icon badge */}
                      <span
                        className={[
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          cfg.bg,
                          cfg.iconColor,
                        ].join(" ")}
                      >
                        {cfg.icon}
                      </span>

                      {/* Text */}
                      <span className="flex-1">
                        <span
                          className={[
                            "block text-sm leading-snug",
                            notif.read
                              ? "font-normal text-gray-700"
                              : "font-semibold text-gray-900",
                          ].join(" ")}
                        >
                          {notif.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
                          {notif.description}
                        </span>
                        <span className="mt-1.5 block text-[11px] font-medium text-gray-400">
                          {notif.time}
                        </span>
                      </span>

                      {/* Unread dot */}
                      {!notif.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#226049]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              className="w-full rounded-xl border border-[#226049]/30 py-2.5 text-xs font-semibold text-[#226049] transition-colors hover:bg-[#226049]/5"
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}
