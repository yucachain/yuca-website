"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Filter, RefreshCw } from "lucide-react";
import MarketplaceNavbar from "./components/MarketplaceNavbar";
import MarketplaceSidebar from "./components/MarketplaceSidebar";
import ProductGrid from "./components/ProductGrid";
import Pagination from "./components/Pagination";
import ProductDetailPanel from "./components/ProductDetailPanel";
import type { CassavaBatch } from "./components/types";
import type { MarketplaceFilters } from "./components/FilterPanel";
import { useCart } from "./context/CartContext";
import { useRouter } from "next/navigation";
import Footer from "@/app/components/Footer";
import { marketplaceApi } from "@/app/Services/marketplaceService";
import type { MarketplaceListing } from "@/app/types/marketplace";

const CATEGORY_MAP_TO_UI: Record<string, string> = {
  CassavaStemsSeedlings: "raw-cassava",
  FertilizerAgrochemicals: "inputs-seeds",
  MachineryLease: "machinery-lease",
  ProcessedProduct: "process-products",
};

const CATEGORY_LABELS: Record<string, string> = {
  "raw-cassava": "Raw Cassava Batches",
  "inputs-seeds": "Inputs & Seeds",
  "machinery-lease": "Machinery Lease",
  "process-products": "Process Products",
};

const ITEMS_PER_PAGE = 8;

const normalizeListingToBatch = (
  listing: any,
  fallbackCategory = "raw-cassava",
): CassavaBatch => {
  const rawCat = String(listing.category ?? fallbackCategory);
  const category = CATEGORY_MAP_TO_UI[rawCat] || rawCat;
  const gradeValue = String(listing.grade ?? listing.qualityGrade ?? "A").toUpperCase();
  const grade = gradeValue === "B" ? "B" : "A";
  const quantity = Number(
    listing.stockAvailable ??
    listing.quantity ??
    listing.quantityAvailable ??
    listing.machinesAvailable ??
    0
  );
  const unit = String(listing.unitOfMeasure ?? listing.unit ?? "Tonnes");
  const pricePerTonne = Number(listing.price ?? listing.pricePerTonne ?? 0);
  const title = String(
    listing.productName ??
    listing.title ??
    listing.name ??
    "Cassava Product"
  );

  const images = Array.isArray(listing.photoUrls) && listing.photoUrls.length > 0
    ? listing.photoUrls
    : Array.isArray(listing.images) && listing.images.length > 0
    ? listing.images
    : ["/images/batches/Batch1.png"];

  return {
    id: String(listing.id ?? listing.batchCode ?? `${category}-${Math.random()}`),
    batchCode: String(listing.batchCode ?? listing.id ?? "BCH-UNKNOWN"),
    title,
    grade,
    quantity: Number.isFinite(quantity) ? quantity : 0,
    unit,
    pricePerTonne: Number.isFinite(pricePerTonne) ? pricePerTonne : 0,
    currency: String(listing.currency ?? "₦"),
    category,
    location: String(listing.location ?? listing.origin ?? "Nigeria"),
    storageLocation: String(listing.storageLocation ?? listing.location ?? "Hub Storage"),
    seller: String(listing.seller ?? listing.sellerName ?? listing.farmerName ?? "Verified Supplier"),
    storageTime: String(listing.storageTime ?? listing.storageDuration ?? "Fresh"),
    temperatureC: Number(listing.temperatureC ?? listing.temperature ?? 25),
    humidityPercent: Number(listing.humidityPercent ?? listing.humidity ?? 55),
    isNew: Boolean(listing.isNew ?? true),
    description: String(
      listing.description ?? "Freshly sourced cassava produce available for purchase."
    ),
    images,
  };
};

export default function MarketplacePage() {
  const { addToCart, totalItems } = useCart();
  const router = useRouter();

  const [allBatches, setAllBatches] = useState<CassavaBatch[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState("raw-cassava");
  const [selectedBatch, setSelectedBatch] = useState<CassavaBatch | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({ grades: ["A", "B"], weight: 1 });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [page, setPage] = useState(1);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);

      const listings = await marketplaceApi.getListings();
      const list = Array.isArray(listings) ? listings : [];
      const normalized = list.map((item) => normalizeListingToBatch(item, activeCategoryId));
      setAllBatches(normalized);
    } catch (err: any) {
      console.error("Failed to load marketplace listings from server:", err);
      setAllBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      requestAnimationFrame(() => setPanelVisible(true));
    } else {
      setPanelVisible(false);
    }
  }, [selectedBatch]);

  const visibleBatches = useMemo(() => {
    let list = allBatches.filter((b) => {
      const catMatch = b.category === activeCategoryId;
      const gradeMatch = filters.grades.length === 0 || filters.grades.includes(b.grade as "A" | "B");
      const searchMatch = search === "" || b.title.toLowerCase().includes(search.toLowerCase());
      return catMatch && gradeMatch && searchMatch;
    });

    if (sortBy === "Newest") list = [...list].reverse();
    if (sortBy === "Price: Low to High") list = [...list].sort((a, b) => a.pricePerTonne - b.pricePerTonne);
    if (sortBy === "Price: High to Low") list = [...list].sort((a, b) => b.pricePerTonne - a.pricePerTonne);

    return list;
  }, [allBatches, activeCategoryId, filters, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visibleBatches.length / ITEMS_PER_PAGE));
  const paginated = visibleBatches.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCategoryChange = (id: string) => {
    setActiveCategoryId(id);
    setSelectedBatch(null);
    setPage(1);
    setShowMobileSidebar(false);
  };

  const handleViewDetails = (batch: CassavaBatch) => {
    setSelectedBatch((prev) => (prev?.id === batch.id ? null : batch));
  };

  const handleClosePanel = () => {
    setPanelVisible(false);
    setTimeout(() => setSelectedBatch(null), 300);
  };

  const handleAddToCart = (batch: CassavaBatch) => {
    addToCart(batch);
  };

  const handlePlaceOrder = (batch: CassavaBatch) => {
    addToCart(batch);
    router.push("/marketplace/shipping");
  };

  const panelOpen = selectedBatch !== null;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#F9FAFB]">
      <MarketplaceNavbar
        cartCount={totalItems}
        onCartClick={() => router.push("/marketplace/cart")}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <MarketplaceSidebar
            activeCategoryId={activeCategoryId}
            onCategoryChange={handleCategoryChange}
            onApplyFilters={(f) => { setFilters(f); setPage(1); }}
          />
        </div>

        {/* Mobile Drawer */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="relative z-10 w-full max-w-[280px] bg-white h-full shadow-2xl">
              <MarketplaceSidebar
                activeCategoryId={activeCategoryId}
                onCategoryChange={handleCategoryChange}
                onApplyFilters={(f) => { setFilters(f); setPage(1); }}
                onCloseMobileDrawer={() => setShowMobileSidebar(false)}
              />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMobileSidebar(true)}
                  className="lg:hidden flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer"
                >
                  <Filter size={14} />
                  Filter &amp; Categories
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {CATEGORY_LABELS[activeCategoryId] || "Cassava Marketplace"}
                </h1>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Browse verified cassava batches directly from farmers &amp; aggregators
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                {visibleBatches.length} {visibleBatches.length === 1 ? "Product" : "Products"}
              </span>
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="relative flex items-center">
              <label className="text-xs text-gray-500 mr-1.5 whitespace-nowrap">Sort By</label>
              <div className="relative inline-block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-7 text-xs text-gray-700 outline-none focus:border-emerald-600 cursor-pointer"
                >
                  {["Newest", "Price: Low to High", "Price: High to Low"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Listings State */}
          {loading ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-16 text-center shadow-xs">
              <RefreshCw size={24} className="animate-spin text-[#226049] mb-3" />
              <p className="text-sm font-semibold text-gray-900">Loading Marketplace Listings...</p>
              <p className="text-xs text-gray-500 mt-1">Fetching live inventory from YucaChain marketplace</p>
            </div>
          ) : (
            <>
              <ProductGrid
                batches={paginated}
                selectedBatchId={selectedBatch?.id || null}
                onViewDetails={handleViewDetails}
                onAddToCart={handleAddToCart}
                onPlaceOrder={handlePlaceOrder}
                panelOpen={panelOpen}
              />

              {visibleBatches.length > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={visibleBatches.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              )}
            </>
          )}
        </main>

        {/* Desktop Product Detail Panel */}
        {selectedBatch && (
          <div
            ref={panelRef}
            className="hidden lg:block shrink-0 overflow-hidden border-l border-gray-100 transition-all duration-300 ease-in-out"
            style={{
              width: panelVisible ? "400px" : "0px",
              opacity: panelVisible ? 1 : 0,
            }}
          >
            <div className="w-[400px] h-full overflow-y-auto bg-white">
              <ProductDetailPanel
                batch={selectedBatch}
                onClose={handleClosePanel}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </div>
        )}

        {/* Mobile Product Detail Modal */}
        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center lg:hidden bg-black/50 p-0 sm:p-4">
            <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6 animate-in slide-in-from-bottom-4">
              <ProductDetailPanel
                batch={selectedBatch}
                onClose={handleClosePanel}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}