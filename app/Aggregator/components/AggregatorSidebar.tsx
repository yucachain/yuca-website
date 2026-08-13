"use client";

import React from "react";
import {
  LayoutGrid,
  FileInput,
  Truck,
  ShoppingCart,
  HandCoins,
  ShieldCheck,
} from "lucide-react";
import type { SidebarNavItem } from "./types";

export const DEFAULT_NAV_ITEMS: SidebarNavItem[] = [
  { id: "overview", label: "Overview", icon: <LayoutGrid size={18} strokeWidth={1.8} /> },
  {
    id: "receive-batch",
    label: "Receive Batches",
    icon: <FileInput size={18} strokeWidth={1.8} />,
  },
  { id: "market-orders", label: "Market Orders", icon: <ShoppingCart size={18} strokeWidth={1.8} /> },
  { id: "dispatch-order", label: "Dispatch Order", icon: <Truck size={18} strokeWidth={1.8} /> },
  {
    id: "sellers-payouts",
    label: "Sellers & Payouts",
    icon: <HandCoins size={18} strokeWidth={1.8} />,
  },
];

export interface AggregatorSidebarProps {
  items?: SidebarNavItem[];
  activeItemId: string;
  onItemChange: (id: string) => void;
}

export default function AggregatorSidebar({
  items = DEFAULT_NAV_ITEMS,
  activeItemId,
  onItemChange,
}: AggregatorSidebarProps) {
  return (
    <aside className="flex w-full max-w-[260px] shrink-0 flex-col justify-between border-r border-gray-100 bg-white px-4 py-6">
      <div>
        <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-gray-400">
          AGGREGATOR ADMIN
        </p>

        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = item.id === activeItemId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemChange(item.id)}
                className={[
                  "flex w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-left text-sm transition-colors",
                  isActive
                    ? "border-emerald-800 bg-emerald-50/70 font-semibold text-emerald-800"
                    : "border-transparent text-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                <span className={isActive ? "text-emerald-800" : "text-gray-400"}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-start gap-2 border-t border-gray-100 px-3 pt-5">
        <ShieldCheck size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-emerald-700" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Aggregator Workspace</p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
            You are operating as a verified Yucachain Aggregator
          </p>
        </div>
      </div>
    </aside>
  );
}