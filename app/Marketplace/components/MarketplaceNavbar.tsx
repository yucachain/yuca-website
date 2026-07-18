"use client";

import React, { useState } from "react";
import { Bell, ShoppingCart, ChevronDown } from "lucide-react";
import Image from "next/image";

export interface MarketplaceUser {
  initials: string;
  name: string;
  role: string;
}

export interface MarketplaceNavbarProps {
  user?: MarketplaceUser;
  cartCount?: number;
  hasNotifications?: boolean;
  onBellClick?: () => void;
  onCartClick?: () => void;
}

const defaultUser: MarketplaceUser = {
  initials: "DF",
  name: "Drevo Foods Ltd.",
  role: "Buyer",
};

export default function MarketplaceNavbar({
  user = defaultUser,
  cartCount = 0,
  hasNotifications = false,
  onBellClick,
  onCartClick,
}: MarketplaceNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4 lg:px-8">
          <Image
                     src="/images/Yucachain_Logo.png"
                     alt="YucaChain Logo"
                     width={120}
                     height={120}
                     className="object-contain"
                   />
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onBellClick}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Bell size={20} strokeWidth={1.6} />
            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={onCartClick}
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ShoppingCart size={20} strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-gray-200" />

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-50"
            aria-expanded={menuOpen}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#05095E]/20 text-sm font-semibold text-[#05095E]">
              {user.initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold text-[#05095E]">
                {user.name}
              </span>
              <span className="block text-xs text-gray-500">{user.role}</span>
            </span>
            <span className="text-gray-400">
              <ChevronDown size={16} strokeWidth={1.8} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}