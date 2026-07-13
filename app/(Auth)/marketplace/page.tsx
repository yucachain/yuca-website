"use client";

import  { useState } from "react";
import MarketplaceNavbar from "@/app/Marketplace/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/app/Marketplace/components/MarketplaceSidebar";
import ProductCard from "@/app/Marketplace/components/ProductCard";
import ProductDetailPanel from "@/app/Marketplace/components/ProductDetailPanel";
import type { CassavaBatch } from "@/app/Marketplace/components/types";

const SAMPLE_BATCHES: CassavaBatch[] = [
  {
    id: "1",
    batchCode: "BCH-26-06-234567",
    title: "Fresh Cassava",
    grade: "B",
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
    description:
      "A freshly harvested cassava stored in optimal condition, clean and ready for processing",
       images: [
    "/images/batches/Batch1.png",
    "/images/batches/Batch2.png",
    "/images/batches/Batch3.png",
    "/images/batches/Batch4.png",
  ],
  isNew: true,
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
  },
];

export default function MarketplacePage() {
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_BATCHES[0].id);
  const selectedBatch = SAMPLE_BATCHES.find((b) => b.id === selectedId) ?? null;

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
    <div className="flex min-h-screen flex-col font-sans">
      <MarketplaceNavbar
        user={{ initials: "DF", name: "Drevo Foods Ltd.", role: "Buyer" }}
        cartCount={5}
        hasNotifications
      />

      <div className="flex flex-1">
        <MarketplaceSidebar />

        <main className="flex-1 px-8 py-8">
         {/*  <h1 className="text-3xl font-bold text-emerald-800">Raw Cassava Batches</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and search through all categories
          </p> */}

          {/* Search/sort bar and pagination from the mockup still not built here */}

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {SAMPLE_BATCHES.map((batch) => (
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
        </main>

        <ProductDetailPanel
          batch={selectedBatch}
          onContactSeller={handleContactSeller}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </div>
  );
}