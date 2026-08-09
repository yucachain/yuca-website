"use client";

import React, { useMemo, useState } from "react";
import SellerCategoryTabs, { SellerCategoryTab } from "./Sellercategorytabs";
import SellerCard from "./Sellercard";
import Pagination from "./Pagination";
import type { Seller } from "./types";

const PER_PAGE = 3;

// Sample data standing in for a real "fetch registered sellers" call.
const SELLERS: Seller[] = [
  {
    id: "1",
    name: "Agbetoba Farms",
    location: "Ilorin, Kwara State",
    phone: "+234 803 123 4567",
    rating: 4.5,
    category: "farmer",
    bankName: "Zenith Bank",
    accountNumber: "0011223344",
    accountName: "Agbetoba Farms",
  },
  {
    id: "2",
    name: "Nino Farms",
    location: "Ibadan, Oyo State",
    phone: "+234 802 234 4554",
    rating: 4.8,
    category: "buyer-processor",
    bankName: "Access Bank",
    accountNumber: "1100332255",
    accountName: "Nino Farms",
  },
  {
    id: "3",
    name: "GoldenPearl Ltd",
    location: "Ilorin, Kwara State",
    phone: "+234 803 123 4567",
    rating: 4.0,
    category: "service-provider",
    bankName: "Zenith Bank",
    accountNumber: "2187657878",
    accountName: "GoldenPearl Ltd",
  },
  {
    id: "4",
    name: "Kays & Sons",
    location: "Offa, Kwara State",
    phone: "+234 805 111 2222",
    rating: 4.2,
    category: "farmer",
    bankName: "GTBank",
    accountNumber: "3344556677",
    accountName: "Kays & Sons",
  },
];

export default function SellersPayoutsSection() {
  const [activeTab, setActiveTab] = useState<SellerCategoryTab>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (activeTab === "all" ? SELLERS : SELLERS.filter((s) => s.category === activeTab)),
    [activeTab]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const startIndex = (page - 1) * PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + PER_PAGE);
  const rangeEnd = Math.min(startIndex + PER_PAGE, filtered.length);

  const handleTabChange = (tab: SellerCategoryTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleInitiatePayout = (seller: Seller) => {
    // Replace with your real "initiate payout" call, e.g.:
    // await fetch(`/api/aggregator/payouts`, { method: "POST", body: JSON.stringify({ sellerId: seller.id }) });
    console.log("Initiate payout for", seller.name);
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900">Registered Sellers</h1>
      <p className="mt-1 text-sm text-gray-500">
        Farmers, buyers, and service providers with payout details
      </p>

      <div className="mt-6">
        <SellerCategoryTabs activeTab={activeTab} onChange={handleTabChange} />
      </div>

      <div className="mt-6 space-y-6">
        {pageItems.length > 0 ? (
          pageItems.map((seller) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              onInitiatePayout={handleInitiatePayout}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
            No sellers in this category.
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            resultsLabel={`Showing ${startIndex + 1}-${rangeEnd} of ${filtered.length} Results`}
          />
        </div>
      )}
    </>
  );
}