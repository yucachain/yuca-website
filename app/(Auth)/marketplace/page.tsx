"use client";

import React, { useState } from "react";
import MarketplaceNavbar from "@/app/Marketplace/components/MarketplaceNavbar";
import MarketplaceSidebar, {
  DEFAULT_CATEGORIES,
} from "@/app/Marketplace/components/MarketplaceSidebar";
import ProductCard from "@/app/Marketplace/components/ProductCard";
import ProductDetailPanel from "@/app/Marketplace/components/ProductDetailPanel";
import type { CassavaBatch } from "@/app/Marketplace/components/types";

const Footer = () => null;

/* ------------------------------------------------------------------ */
/*  Per-category data                                                  */
/*  No mockups exist yet for Inputs & Seeds / Machinery Lease /         */
/*  Process Products, so this sample data + copy is a reasonable        */
/*  placeholder - swap in real data whenever it's available.            */
/* ------------------------------------------------------------------ */

interface MarketplaceListing extends CassavaBatch {
  priceLabel?: string;
  quantityLabel?: string;
  storageTimeLabel?: string;
}

interface CategoryContent {
  heading: string;
  subheading: string;
  listings: MarketplaceListing[];
}

const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  "raw-cassava": {
    heading: "Raw Cassava Batches",
    subheading: "Browse and search through all categories",
    listings: [
      {
        id: "1",
        batchCode: "BCH-26-06-001234",
        title: "TME 419 Stems",
        grade: "A",
        quantity: 120000,
        pricePerTonne: 105,
        location: "Offa, Kwara State",
        seller: "Top Farmers Ltd.",
        storageTime: "16hrs",
        temperatureC: 28,
        humidityPercent: 65,
        isNew: true,
         images: [
    "/images/batches/Batch1.png",
    "/images/batches/Batch2.png",
    "/images/batches/Batch3.png",
    "/images/batches/Batch4.png", 
  ],
      },
      {
        id: "2",
        batchCode: "BCH-26-06-234567",
        title: "Fresh Cassava",
        grade: "B",
        quantity: 100000,
        pricePerTonne: 120,
        location: "Offa, Kwara State",
        seller: "Top Farmers Ltd.",
        storageTime: "16hrs",
        temperatureC: 28,
        humidityPercent: 65,
        isNew: true,
         images: [
    "/images/batches/Batch1.png",
    "/images/batches/Batch2.png",
    "/images/batches/Batch3.png",
    "/images/batches/Batch4.png", 
  ],
        description:
          "A freshly harvested cassava stored in optimal condition, clean and ready for processing",
      },
      {
        id: "3",
        batchCode: "BCH-26-06-001234",
        title: "TME 419 Stems",
        grade: "A",
        quantity: 100000,
        pricePerTonne: 120,
        location: "Offa, Kwara State",
        seller: "Top Farmers Ltd.",
        storageTime: "16hrs",
        temperatureC: 28,
        humidityPercent: 65,
        isNew: true,
         images: [
    "/images/batches/Batch1.png",
    "/images/batches/Batch2.png",
    "/images/batches/Batch3.png",
    "/images/batches/Batch4.png", 
  ],
      },
     
    ],
  },

  "inputs-seeds": {
    heading: "Inputs & Seeds",
    subheading: "Seeds, fertilizers, and chemicals from verified suppliers",
    listings: [
    ],
  },

  "machinery-lease": {
    heading: "Machinery Lease",
    subheading: "Tractors, equipment, and tools available for lease",
    listings: [
    ],
  },

  "process-products": {
    heading: "Process Products",
    subheading: "Flour, starch, gari, and other value-added cassava products",
    listings: [
    ],
  },
};

export default function MarketplacePage() {
  const [activeCategoryId, setActiveCategoryId] = useState(DEFAULT_CATEGORIES[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(
    CATEGORY_CONTENT[DEFAULT_CATEGORIES[0].id].listings[0]?.id ?? null
  );

  const { heading, subheading, listings } = CATEGORY_CONTENT[activeCategoryId];
  const selectedBatch = listings.find((b) => b.id === selectedId) ?? null;

  const handleCategoryChange = (id: string) => {
    setActiveCategoryId(id);
    setSelectedId(CATEGORY_CONTENT[id].listings[0]?.id ?? null);
  };

  const handleAddToCart = (batch: CassavaBatch) => {
    // Replace with your real cart logic, e.g.:
    // await fetch("/api/cart", { method: "POST", body: JSON.stringify({ batchId: batch.id }) });
    console.log("Add to cart", batch.id);
  };

  const handlePlaceOrder = (batch: CassavaBatch) => {
    // Replace with your real order logic, e.g.:
    // await fetch("/api/orders", { method: "POST", body: JSON.stringify({ batchId: batch.id }) });
    console.log("Place order", batch.id);
  };

  const handleContactSeller = (batch: CassavaBatch) => {
    // Replace with your real messaging/contact logic.
    console.log("Contact seller for", batch.id);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans antialiased">
      <MarketplaceNavbar
        user={{ initials: "DF", name: "Drevo Foods Ltd.", role: "Buyer" }}
        cartCount={5}
        hasNotifications
      />

      <div className="flex flex-1">
        <MarketplaceSidebar
          activeCategoryId={activeCategoryId}
          onCategoryChange={handleCategoryChange}
        />

        <main className="flex-1 px-8 py-8">
          <h1 className="text-2xl  font-bold text-emerald-800">{heading}</h1>
          <p className="mt-1 text-sm text-gray-500">{subheading}</p>

          {/* Search/sort bar and pagination from the mockup still not built here */}

          {listings.length === 0 ? (
            <p className="mt-10 text-sm text-gray-500">No listings in this category yet.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((batch) => (
                <ProductCard
                  key={batch.id}
                  batch={batch}
                  selected={batch.id === selectedId}
                  onAddToCart={handleAddToCart}
                  onViewDetails={(b) => setSelectedId(b.id)}
                  onPlaceOrder={handlePlaceOrder}
                />
              ))}
            </div>
          )}
        </main>

        <ProductDetailPanel
          batch={selectedBatch}
          onContactSeller={handleContactSeller}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>

      <Footer />
    </div>
  );
}