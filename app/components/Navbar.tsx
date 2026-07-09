"use client";

import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Marketplace", href: "/login" },
  { label: "Our Story", href: "#story" },
  { label: "Products", href: "#products" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* Logo */}
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

        {/* Nav Links */}
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

        {/* Action Buttons */}
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
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#1a3a2a] rounded-full hover:bg-[#152e21] transition-all duration-200 shadow-sm"
          >
            Join the Network
          </Link>
        </div>

      </div>
    </header>
  );
}