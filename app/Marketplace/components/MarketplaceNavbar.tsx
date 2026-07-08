// MarketplaceNavbar — top bar with YucaChain logo, notification bell, cart icon with badge, and user avatar + company name dropdown
"use client";

import { useState } from "react";
import Image from "next/image";

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="21" r="1.4" fill="currentColor" />
      <circle cx="17" cy="21" r="1.4" fill="currentColor" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
    <header className="w-full border-b border-gray-300">
      <div className="flex items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex h-11 w-29 items-center justify-center sm:h-12 sm:w-36">
            <Image
                        src="/images/Yucachain_Logo.png"
                        alt="YucaChain Logo"
                        width={150}
                        height={150}
                        className="object-contain"
                      />
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onBellClick}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <BellIcon />
            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={onCartClick}
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-11 border-r border-gray-300"/>

              <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-50"
            aria-expanded={menuOpen}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#05095E] text-sm font-semibold text-[#05095E]">
              {user.initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold text-[#05095E]">
                {user.name}
              </span>
              <span className="block text-xs text-gray-500">{user.role}</span>
            </span>
            <span className="text-gray-400">
              <ChevronDownIcon />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}