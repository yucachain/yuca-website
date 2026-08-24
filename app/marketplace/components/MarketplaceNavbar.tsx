"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, ShoppingCart, ChevronDown, User, Package, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface MarketplaceUser {
  initials: string;
  name: string;
  role?: string;
  email?: string;
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
  email: "procurement@drevofoods.com",
};

export default function MarketplaceNavbar({
  user = defaultUser,
  cartCount = 0,
  hasNotifications = false,
  onBellClick,
  onCartClick,
}: MarketplaceNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellTrigger = () => {
    if (onBellClick) {
      onBellClick();
    } else {
      router.push("/marketplace/notifications");
    }
  };

  const handleCartTrigger = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      router.push("/marketplace/cart");
    }
  };

  return (
    <header className="w-full border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <Link href="/marketplace" className="flex items-center gap-2 group">
          <Image
            src="/images/Yucachain_Logo.png"
            alt="YucaChain Logo"
            width={120}
            height={120}
            className="object-contain w-24 sm:w-28 md:w-32 h-auto transition-transform group-hover:scale-[1.02]"
            priority
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={handleBellTrigger}
            aria-label="Notifications"
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95 cursor-pointer"
          >
            <Bell size={18} strokeWidth={1.8} />
            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#226049] ring-2 ring-white" />
            )}
          </button>

          <button
            type="button"
            onClick={handleCartTrigger}
            aria-label="Cart"
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95 cursor-pointer"
          >
            <ShoppingCart size={18} strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#226049] px-1.5 text-[11px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-gray-200/80 hidden sm:block" />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white p-1.5 sm:pr-3 transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-[0.99] cursor-pointer"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#226049]/10 text-xs sm:text-sm font-bold text-[#226049]">
                {user.initials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {user.name}
                </span>
              </span>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`text-gray-400 transition-transform duration-200 ${
                  menuOpen ? "rotate-180 text-gray-700" : ""
                }`}
              />
            </button>

      
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-3 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user.email || "Verified Buyer"}</p>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/marketplace/cart");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Package size={15} className="text-gray-500" />
                    My Cart ({cartCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/login");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    Sign Out
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