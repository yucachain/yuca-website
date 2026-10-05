"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShoppingCart,
  ChevronDown,
  User,
  UserPlus,
  Package,
  LogOut,
  Settings,
  Sprout,
  Factory,
  Tractor,
  ShoppingBag,
  TrendingUp,
  Search,
  Menu,
} from "lucide-react";
import {
  useMarketplaceRole,
  MarketplaceRole,
} from "../context/MarketplaceRoleContext";
import UserOrdersAndSalesModal from "./UserOrdersAndSalesModal";
import RoleProfileSettingsModal from "./RoleProfileSettingsModal";

export interface MarketplaceUser {
  initials?: string;
  name?: string;
  role?: string;
  email?: string;
}

export interface MarketplaceNavbarProps {
  user?: MarketplaceUser;
  cartCount?: number;
  hasNotifications?: boolean;
  onBellClick?: () => void;
  onCartClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onToggleMobileSidebar?: () => void;
}

const ROLE_META: Record<
  MarketplaceRole,
  { label: string; icon: React.ReactNode; color: string; badge: string }
> = {
  farmer: {
    label: "Farmer",
    icon: <Sprout size={13} />,
    color: "bg-emerald-50 text-[#226049] border-emerald-200",
    badge: "bg-emerald-50 text-[#226049] border-emerald-200",
  },
  processor: {
    label: "Buyer / Processor",
    icon: <Factory size={13} />,
    color: "bg-amber-50/80 text-amber-900 border-amber-200",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  "service-provider": {
    label: "Service Provider",
    icon: <Tractor size={13} />,
    color: "bg-emerald-50/70 text-[#226049] border-emerald-200",
    badge: "bg-emerald-50 text-[#226049] border-emerald-200",
  },
  consumer: {
    label: "Consumer",
    icon: <ShoppingBag size={13} />,
    color: "bg-amber-50 text-amber-900 border-amber-200",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
};

export default function MarketplaceNavbar({
  cartCount = 0,
  hasNotifications = false,
  onBellClick,
  onCartClick,
  searchQuery,
  onSearchChange,
  onToggleMobileSidebar,
}: MarketplaceNavbarProps) {
  const router = useRouter();
  const { activeRole, setActiveRole, currentUser } = useMarketplaceRole();

  const [menuOpen, setMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCartTrigger = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      router.push("/marketplace/cart");
    }
  };

  const currentMeta = ROLE_META[activeRole];
  const firstName = currentUser.name.split(" ")[0] || "User";

  return (
    <>
      <header className="w-full shrink-0 border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-40 transition-all font-sans">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Left: Mobile hamburger & Greeting */}
          <div className="flex items-center gap-3 sm:gap-6">
            {onToggleMobileSidebar && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Toggle navigation"
              >
                <Menu size={18} />
              </button>
            )}

            <Link href="/marketplace" className="flex items-center gap-2 group">
              <Image
                src="/images/Yucachain_Logo.png"
                alt="YucaChain Logo"
                width={120}
                height={40}
                className="object-contain w-24 sm:w-28 md:w-30 h-auto transition-transform group-hover:scale-[1.02]"
                priority
              />
            </Link>

            {/* Greeting from inspiration: "Hello [Name]" */}
            <div className="hidden md:flex items-center gap-2 border-l border-gray-100 pl-4">
              <span className="text-sm font-bold text-gray-800">
                Hello {firstName}
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                {currentMeta.label}
              </span>
            </div>
          </div>

          {/* Center: Search input from inspiration */}
          {onSearchChange !== undefined && (
            <div className="hidden sm:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products, batches, suppliers..."
                  value={searchQuery ?? ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2 pl-10 pr-3.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#226049] focus:bg-white focus:ring-1 focus:ring-[#226049] transition-all"
                />
              </div>
            </div>
          )}

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Role Switcher Pill with slight gold accent */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => setRoleMenuOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold border transition-all cursor-pointer shadow-2xs ${currentMeta.color}`}
                title="Switch active user role"
              >
                <span>{currentMeta.icon}</span>
                <span className="hidden sm:inline">Role: {currentMeta.label}</span>
                <span className="sm:hidden">{currentMeta.label.split(" ")[0]}</span>
                <ChevronDown size={12} className="opacity-70" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
                  <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Switch Active Marketplace Role
                  </p>
                  {(Object.keys(ROLE_META) as MarketplaceRole[]).map((roleKey) => {
                    const meta = ROLE_META[roleKey];
                    const isSelected = activeRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => {
                          setActiveRole(roleKey);
                          setRoleMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 text-[#226049] font-bold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{meta.icon}</span>
                          <span>{meta.label}</span>
                        </div>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#226049]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Register Link on Navbar */}
            <Link
              href="/register"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#226049] rounded-xl hover:bg-[#1b4d3a] transition-all shadow-xs"
            >
              <UserPlus size={14} />
              <span>Register</span>
            </Link>

            {/* Notifications */}
            <button
              type="button"
              onClick={onBellClick || (() => router.push("/marketplace/notifications"))}
              aria-label="Notifications"
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95 cursor-pointer shadow-2xs"
            >
              <Bell size={17} strokeWidth={1.8} />
              {hasNotifications && (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={handleCartTrigger}
              aria-label="Shopping Cart"
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95 cursor-pointer shadow-2xs"
            >
              <ShoppingCart size={17} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#226049] text-[10px] font-bold text-white shadow-xs">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white p-1.5 sm:pr-3 transition-all hover:bg-gray-50 hover:border-gray-300 cursor-pointer shadow-2xs"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#226049]/10 text-xs sm:text-sm font-bold text-[#226049] overflow-hidden">
                  {currentUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    currentUser.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs sm:text-sm font-bold text-gray-900 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
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
                <div className="absolute right-0 mt-2 w-56 sm:w-60 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="px-3 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                    <span className="mt-1 inline-block rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {currentMeta.label}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowOrdersModal(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Package size={15} className="text-gray-500" />
                      <span>
                        {activeRole === "consumer"
                          ? "My Orders Placed"
                          : "My Sales & Orders"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowSettingsModal(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Settings size={15} className="text-gray-500" />
                      <span>Profile &amp; Bank Settings</span>
                    </button>

                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <User size={15} className="text-gray-500" />
                      <span>Register New Role Account</span>
                    </Link>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/login");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile & Orders Modals */}
      <UserOrdersAndSalesModal
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        initialTab={activeRole === "consumer" ? "purchases" : "sales"}
      />

      <RoleProfileSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
}