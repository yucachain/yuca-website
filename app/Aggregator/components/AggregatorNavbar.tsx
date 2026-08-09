"use client";

import React, { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import type { AggregatorUser } from "./types";
import Image from "next/image";

export interface AggregatorNavbarProps {
  user?: AggregatorUser;
  hasNotifications?: boolean;
  onSearch?: (query: string) => void;
  onBellClick?: () => void;
}

const defaultUser: AggregatorUser = {
  initials: "PP",
  name: "Penpal",
  role: "Aggregator",
};

export default function AggregatorNavbar({
  user = defaultUser,
  hasNotifications = false,
  onSearch,
  onBellClick,
}: AggregatorNavbarProps) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <div className="flex items-center gap-6 px-6 py-4 lg:px-8">
        <Image
          src="/images/Yucachain_Logo.png"
          alt="YucaChain Logo"
          width={120}
          height={120}
          className="object-contain"
        />

        <div className="flex-1">
          <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5">
            <Search size={18} strokeWidth={1.8} className="text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              placeholder="Search Batches"
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
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

          <div className="h-8 w-px bg-gray-200" />

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-50"
            aria-expanded={menuOpen}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-200 text-sm font-semibold text-indigo-700">
              {user.initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold text-gray-900">
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
