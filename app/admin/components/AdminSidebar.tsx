"use client";

import React from "react";
import {
  LayoutGrid,
  Users,
  Receipt,
  Truck,
  Settings,
  X,
} from "lucide-react";
import type { SidebarNavItem } from "./types";

export const DEFAULT_ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  {
    id: "overview",
    label: "Admin Overview",
    icon: <LayoutGrid size={18} strokeWidth={1.8} />,
  },
  {
    id: "user-management",
    label: "User Directory & Roles",
    icon: <Users size={18} strokeWidth={1.8} />,
  },
  {
    id: "orders-payouts",
    label: "Orders, Payouts & Reports",
    icon: <Receipt size={18} strokeWidth={1.8} />,
  },
  {
    id: "dispatch-order",
    label: "Logistics Dispatches",
    icon: <Truck size={18} strokeWidth={1.8} />,
  },
  {
    id: "settings",
    label: "System Settings",
    icon: <Settings size={18} strokeWidth={1.8} />,
  },
];

export interface AdminSidebarProps {
  items?: SidebarNavItem[];
  activeItemId: string;
  onItemChange: (id: string) => void;
  onCloseMobileDrawer?: () => void;
}

export default function AdminSidebar({
  items = DEFAULT_ADMIN_NAV_ITEMS,
  activeItemId,
  onItemChange,
  onCloseMobileDrawer,
}: AdminSidebarProps) {
  const handleItemClick = (id: string) => {
    onItemChange(id);
    onCloseMobileDrawer?.();
  };

  return (
    <aside className="flex w-full max-w-[280px] shrink-0 flex-col justify-between border-r border-gray-100 bg-white px-4 py-6 overflow-y-auto no-scrollbar h-full font-sans">
      <div>
        {onCloseMobileDrawer && (
          <div className="flex items-center justify-end mb-4 px-2">
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              aria-label="Close admin menu"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <nav className="flex flex-col gap-2.5">
          {items.map((item) => {
            const isActive =
              item.id === activeItemId ||
              (item.id === "orders-payouts" &&
                (activeItemId === "sellers-payouts" || activeItemId === "transactions"));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl border-l-4 px-3.5 py-3 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                  isActive
                    ? "border-[#226049] bg-emerald-50/70 text-[#226049] font-bold shadow-2xs"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                ].join(" ")}
              >
                <span className={isActive ? "text-[#226049]" : "text-gray-400"}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}