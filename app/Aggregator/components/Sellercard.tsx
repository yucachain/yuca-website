import React from "react";
import { Star } from "lucide-react";
import type { Seller, SellerCategory } from "./types";

const categoryBadgeStyles: Record<SellerCategory, string> = {
  farmer: "bg-amber-50 text-amber-700 border-amber-200",
  "buyer-processor": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "service-provider": "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

const categoryLabels: Record<SellerCategory, string> = {
  farmer: "Farmer",
  "buyer-processor": "Buyer / processor",
  "service-provider": "Service Provider",
};

export interface SellerCardProps {
  seller: Seller;
  onInitiatePayout?: (seller: Seller) => void;
}

export default function SellerCard({ seller, onInitiatePayout }: SellerCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{seller.name}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
            {seller.location} · {seller.phone}
            <span className="ml-1.5 flex items-center gap-1 text-gray-700">
              <Star size={14} className="fill-emerald-700 text-emerald-700" />
              {seller.rating}
            </span>
          </p>
        </div>

        <span
          className={[
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold",
            categoryBadgeStyles[seller.category],
          ].join(" ")}
        >
          {categoryLabels[seller.category]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 py-5 text-sm">
        <span className="text-gray-500">Bank Name</span>
        <span className="text-right font-medium text-gray-900">{seller.bankName}</span>

        <span className="text-gray-500">Account Number</span>
        <span className="text-right font-medium text-gray-900">{seller.accountNumber}</span>

        <span className="text-gray-500">Account Name</span>
        <span className="text-right font-medium text-gray-900">{seller.accountName}</span>
      </div>

      <button
        type="button"
        onClick={() => onInitiatePayout?.(seller)}
        className="rounded-xl bg-[#215243] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336]"
      >
        Initiate Payout
      </button>
    </div>
  );
}