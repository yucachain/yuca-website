"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, LogIn, UserPlus, ShoppingBag, Lock } from "lucide-react";

export interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  redirectUrl?: string;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  title = "Sign In Required",
  message = "You need to sign in or register as a new user to add products to your cart, view your shopping bag, and place marketplace orders.",
  redirectUrl = "/marketplace",
}: AuthPromptModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const loginHref = redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login";
  const registerHref = redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#226049] border border-emerald-100 shadow-xs">
            <ShoppingBag size={28} strokeWidth={2.2} />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#226049] text-white shadow-xs">
              <Lock size={12} strokeWidth={2.5} />
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-sm">
            {message}
          </p>
        </div>

        {/* Call to Actions */}
        <div className="mt-6 space-y-3">
          <Link
            href={loginHref}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#226049] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#1a4336] active:scale-[0.99] transition-all cursor-pointer"
          >
            <LogIn size={16} />
            <span>Sign In to Continue</span>
          </Link>

          <Link
            href={registerHref}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-100 hover:border-gray-300 active:scale-[0.99] transition-all cursor-pointer"
          >
            <UserPlus size={16} className="text-gray-600" />
            <span>Register as New User</span>
          </Link>
        </div>

        {/* Dismiss Footer */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Continue Browsing Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
