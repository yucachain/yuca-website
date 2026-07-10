import React from "react";
import MarketplaceNavbar from "@/app/Marketplace/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/app/Marketplace/components/MarketplaceSidebar";


export default function MarketplacePage() {
  return (
    <div className="flex min-h-screen flex-col font-sans linear-gradient(to bottom, #f0f5f2 100%, rgba(34,96,73,0.5) 70%, #f0f5f2 100%)">
      <MarketplaceNavbar
        user={{ initials: "DF", name: "Drevo Foods Ltd.", role: "Buyer" }}
        cartCount={5}
        hasNotifications
      />

      <div className="flex flex-1">
        <MarketplaceSidebar />

        <main className="flex-1 px-8 py-8">
          {/*
            "Raw Cassava Batches" header, search/sort bar, product card grid,
            and pagination from the mockup go here. Not built out yet - this
            page exists to host the navbar + sidebar per this request.
          */}
        </main>
      </div>

    </div>
  );
}