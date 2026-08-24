"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Marketplace", href: "/login" },
  { label: "Our Story", href: "#story" },
  { label: "Products", href: "#products" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/Logo.png"
            alt="YucaChain Logo"
            width={36}
            height={36}
            className="object-contain"
          />
          <span className="text-[#1a3a2a] font-bold text-lg tracking-tight">
            YucaChain
          </span>
        </Link>


        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleScroll(e, item.href)}
              className="text-sm font-medium text-gray-600 hover:text-[#1a3a2a] px-4 py-2 rounded-full hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:border-[#1a3a2a] hover:text-[#1a3a2a] transition-all duration-200"
          >
            Log In
          </Link>
          <Link
            href="/aggregator-login"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-[#226049] border border-[#226049] rounded-full hover:bg-[#226049] hover:text-white transition-all duration-200"
          >
            Partner Login
          </Link>
          <Link
            href="/register"
            className="hidden xs:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#1a3a2a] rounded-full hover:bg-[#152e21] transition-all duration-200 shadow-sm"
          >
            Join Network
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className="text-base font-medium text-gray-700 hover:text-[#1a3a2a] px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:border-[#1a3a2a] hover:text-[#1a3a2a] transition-all"
            >
              Log In
            </Link>
            <Link
              href="/aggregator-login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium text-[#226049] border border-[#226049] rounded-xl hover:bg-[#226049] hover:text-white transition-all"
            >
              Partner Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-[#1a3a2a] rounded-xl hover:bg-[#152e21] transition-all shadow-sm"
            >
              Join the Network
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}