"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Filter,
  RefreshCw,
  Plus,
  LayoutGrid,
  List,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import MarketplaceNavbar from "./components/MarketplaceNavbar";
import MarketplaceSidebar from "./components/MarketplaceSidebar";
import ProductGrid from "./components/ProductGrid";
import Pagination from "./components/Pagination";
import ProductDetailPanel from "./components/ProductDetailPanel";
import type { CassavaBatch } from "./components/types";
import type { MarketplaceFilters } from "./components/FilterPanel";
import { useCart } from "./context/CartContext";
import { useMarketplaceRole } from "./context/MarketplaceRoleContext";
import { useRouter } from "next/navigation";
import { marketplaceApi } from "@/app/Services/marketplaceService";
import { SEED_MARKETPLACE_BATCHES } from "./data/seedListings";
import CreateCassavaBatchModal from "./components/CreateCassavaBatchModal";
import ListProcessedProductModal from "./components/ListProcessedProductModal";
import ListServiceMachineryModal from "./components/ListServiceMachineryModal";
import UserOrdersAndSalesModal from "./components/UserOrdersAndSalesModal";

const CATEGORY_MAP_TO_UI: Record<string, string> = {
  CassavaStemsSeedlings: "raw-cassava",
  FertilizerAgrochemicals: "inputs-seeds",
  MachineryLease: "machinery-lease",
  ProcessedProduct: "process-products",
};

interface HorizontalTab {
  id: string;
  label: string;
}

const HORIZONTAL_TABS: HorizontalTab[] = [
  { id: "all", label: "All Products" },
  { id: "raw-cassava", label: "Raw Cassava" },
  { id: "inputs-seeds", label: "Inputs & Seeds" },
  { id: "machinery-lease", label: "Machinery Lease" },
  { id: "process-products", label: "Process Products" },
];

const ITEMS_PER_PAGE = 8;

const normalizeListingToBatch = (
  listing: any,
  fallbackCategory = "raw-cassava"
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
    listing.productName ?? listing.title ?? listing.name ?? "Cassava Product"
  );

  const images =
    Array.isArray(listing.photoUrls) && listing.photoUrls.length > 0
      ? listing.photoUrls
      : Array.isArray(listing.images) && listing.images.length > 0
      ? listing.images
      : ["/images/batches/Batch1.png"];

  return {
    id: String(listing.id ?? listing.batchCode ?? `${category}-${Math.random()}`),
    batchCode: String(listing.batchCode ?? listing.id ?? "BCH-UNKNOWN"),
    title,
    grade,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 10,
    unit,
    pricePerTonne: Number.isFinite(pricePerTonne) && pricePerTonne > 0 ? pricePerTonne : 100000,
    currency: String(listing.currency ?? "₦"),
    category,
    location: String(listing.location ?? listing.origin ?? "Nigeria"),
    storageLocation: String(listing.storageLocation ?? listing.location ?? "Central Hub"),
    seller: String(
      listing.seller ?? listing.sellerName ?? listing.farmerName ?? "Verified Supplier"
    ),
    storageTime: String(listing.storageTime ?? listing.storageDuration ?? "Fresh"),
    temperatureC: Number(listing.temperatureC ?? listing.temperature ?? 24),
    humidityPercent: Number(listing.humidityPercent ?? listing.humidity ?? 52),
    isNew: Boolean(listing.isNew ?? true),
    description: String(
      listing.description ?? "Freshly harvested and verified cassava produce available on YucaChain."
    ),
    images,
  };
};

export default function MarketplacePage() {
  const { addToCart, totalItems } = useCart();
  const { activeRole, currentUser } = useMarketplaceRole();
  const router = useRouter();

  const [allBatches, setAllBatches] = useState<CassavaBatch[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState<CassavaBatch | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({ grades: ["A", "B"], weight: 1 });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Role Action Modals
  const [showFarmerBatchModal, setShowFarmerBatchModal] = useState(false);
  const [showProcessorProductModal, setShowProcessorProductModal] = useState(false);
  const [showServiceMachineryModal, setShowServiceMachineryModal] = useState(false);
  const [showOrdersSalesModal, setShowOrdersSalesModal] = useState(false);
  const [ordersModalTab, setOrdersModalTab] = useState<"purchases" | "sales">("sales");

  const panelRef = useRef<HTMLDivElement>(null);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      const listings = await marketplaceApi.getListings().catch(() => []);
      const list = Array.isArray(listings) ? listings : [];
      let normalized = list.map((item) => normalizeListingToBatch(item, "raw-cassava"));

      // Combine with local custom listings created in modals
      try {
        const custom = JSON.parse(localStorage.getItem("yuca_custom_listings") || "[]");
        if (Array.isArray(custom) && custom.length > 0) {
          normalized = [...custom, ...normalized];
        }
      } catch {}

      // If backend inventory is empty, seamlessly provide rich seed inventory
      if (normalized.length === 0) {
        normalized = SEED_MARKETPLACE_BATCHES;
      } else {
        const presentCategories = new Set(normalized.map((b) => b.category));
        for (const seed of SEED_MARKETPLACE_BATCHES) {
          if (!presentCategories.has(seed.category)) {
            normalized.push(seed);
          }
        }
      }

      setAllBatches(normalized);
    } catch (err: any) {
      console.error("Failed to load marketplace listings:", err);
      setAllBatches(SEED_MARKETPLACE_BATCHES);
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
      const catMatch = activeCategoryId === "all" || b.category === activeCategoryId;
      const gradeMatch =
        filters.grades.length === 0 || filters.grades.includes(b.grade as "A" | "B");
      const weightMatch = b.quantity >= filters.weight;
      const searchLower = search.trim().toLowerCase();
      const searchMatch =
        searchLower === "" ||
        b.title.toLowerCase().includes(searchLower) ||
        b.seller.toLowerCase().includes(searchLower) ||
        b.location.toLowerCase().includes(searchLower) ||
        b.batchCode.toLowerCase().includes(searchLower);
      return catMatch && gradeMatch && weightMatch && searchMatch;
    });

    if (sortBy === "Newest") list = [...list].reverse();
    if (sortBy === "Price: Low to High")
      list = [...list].sort((a, b) => a.pricePerTonne - b.pricePerTonne);
    if (sortBy === "Price: High to Low")
      list = [...list].sort((a, b) => b.pricePerTonne - a.pricePerTonne);

    return list;
  }, [allBatches, activeCategoryId, filters, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visibleBatches.length / itemsPerPage));
  const paginated = visibleBatches.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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

  const handleAddProductClick = () => {
    if (activeRole === "farmer") {
      setShowFarmerBatchModal(true);
    } else if (activeRole === "processor") {
      setShowProcessorProductModal(true);
    } else if (activeRole === "service-provider") {
      setShowServiceMachineryModal(true);
    } else {
      setShowFarmerBatchModal(true);
    }
  };

  const handleNewListingCreated = (item: any) => {
    const normalized = normalizeListingToBatch(item, activeCategoryId === "all" ? "raw-cassava" : activeCategoryId);
    setAllBatches((prev) => [normalized, ...prev]);
    try {
      const stored = JSON.parse(localStorage.getItem("yuca_custom_listings") || "[]");
      localStorage.setItem("yuca_custom_listings", JSON.stringify([normalized, ...stored]));
    } catch {}
  };

  const panelOpen = selectedBatch !== null;

  return (
    <div className="flex h-screen flex-col font-sans bg-[#f9fafb] overflow-hidden">
      {/* Top Navbar */}
      <MarketplaceNavbar
        cartCount={totalItems}
        onCartClick={() => router.push("/marketplace/cart")}
        searchQuery={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onToggleMobileSidebar={() => setShowMobileSidebar((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sticky Left Sidebar (matches inspiration image) */}
        <div className="hidden lg:block h-full shrink-0">
          <MarketplaceSidebar
            activeCategoryId={activeCategoryId === "all" ? "raw-cassava" : activeCategoryId}
            onCategoryChange={handleCategoryChange}
            onApplyFilters={(f) => {
              setFilters(f);
              setPage(1);
            }}
            onOpenOrdersModal={() => {
              setOrdersModalTab("sales");
              setShowOrdersSalesModal(true);
            }}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="relative z-10 w-full max-w-[270px] bg-white h-full shadow-2xl">
              <MarketplaceSidebar
                activeCategoryId={activeCategoryId === "all" ? "raw-cassava" : activeCategoryId}
                onCategoryChange={handleCategoryChange}
                onApplyFilters={(f) => {
                  setFilters(f);
                  setPage(1);
                }}
                onCloseMobileDrawer={() => setShowMobileSidebar(false)}
                onOpenOrdersModal={() => {
                  setShowMobileSidebar(false);
                  setOrdersModalTab("sales");
                  setShowOrdersSalesModal(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area (Matches Inspiration Screen) */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 min-w-0">
          {/* Top Title Bar from inspiration: "Management Product" + "+ Add Product" */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-3 border-b border-gray-150/70">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Management Product
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage, source and trade verified agricultural products and listings
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddProductClick}
                className="inline-flex items-center gap-2 rounded-xl bg-[#226049] hover:bg-[#1a4336] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-98"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Sub-bar from inspiration: Horizontal Tabs & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            {/* Horizontal Tabs: All | Raw Cassava | Inputs & Seeds | Machinery Lease | Process Products */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {HORIZONTAL_TABS.map((tab) => {
                const isActive = activeCategoryId === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleCategoryChange(tab.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#226049] text-white shadow-2xs font-bold"
                        : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-gray-50"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Controls: View Toggle, Filter, Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* View Mode Toggle from inspiration */}
              <div className="flex items-center rounded-xl border border-gray-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Table View"
                >
                  <List size={14} />
                </button>
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilterDropdown((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <SlidersHorizontal size={13} className="text-amber-600" />
                  <span>Filter</span>
                  {filters.grades.length < 2 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-150 bg-white p-3 shadow-xl z-30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Filter Quality Grade
                    </p>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.grades.includes("A")}
                          onChange={(e) => {
                            const newGrades = e.target.checked
                              ? [...filters.grades, "A" as const]
                              : filters.grades.filter((g) => g !== "A");
                            if (newGrades.length > 0) {
                              setFilters({ ...filters, grades: newGrades });
                            }
                          }}
                          className="rounded text-[#226049] accent-[#226049]"
                        />
                        <span>Grade A (Premium)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.grades.includes("B")}
                          onChange={(e) => {
                            const newGrades = e.target.checked
                              ? [...filters.grades, "B" as const]
                              : filters.grades.filter((g) => g !== "B");
                            if (newGrades.length > 0) {
                              setFilters({ ...filters, grades: newGrades });
                            }
                          }}
                          className="rounded text-amber-600 accent-amber-600"
                        />
                        <span>Grade B (Standard)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative inline-block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-7 text-xs font-semibold text-gray-700 outline-none focus:border-[#226049] cursor-pointer shadow-2xs"
                >
                  {["Newest", "Price: Low to High", "Price: High to Low"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Listings State */}
          {loading ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-gray-150/70 bg-white p-16 text-center shadow-xs">
              <RefreshCw size={24} className="animate-spin text-[#226049] mb-3" />
              <p className="text-sm font-semibold text-gray-900">
                Loading Marketplace Products...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Fetching catalog inventory
              </p>
            </div>
          ) : (
            <>
              {/* Product Grid (4 columns from inspiration) */}
              <ProductGrid
                batches={paginated}
                selectedBatchId={selectedBatch?.id || null}
                onViewDetails={handleViewDetails}
                onAddToCart={handleAddToCart}
                onPlaceOrder={handlePlaceOrder}
                panelOpen={panelOpen}
              />

              {/* Bottom Pagination Bar (Matches inspiration bottom row) */}
              {visibleBatches.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs bg-white rounded-2xl px-5 py-3.5 border border-gray-150/70 shadow-2xs w-full">
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <span>Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-700 outline-none cursor-pointer"
                    >
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                      <option value={16}>16</option>
                    </select>
                    <span>per page</span>
                    <span className="text-gray-300 mx-1">|</span>
                    <span>
                      Total <strong className="text-gray-900">{visibleBatches.length}</strong> items
                    </span>
                  </div>

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={visibleBatches.length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* Product Detail Slide-Over Panel */}
        {selectedBatch && (
          <div
            ref={panelRef}
            className="hidden lg:block shrink-0 overflow-hidden border-l border-gray-150/80 transition-all duration-300 ease-in-out"
            style={{
              width: panelVisible ? "400px" : "0px",
              opacity: panelVisible ? 1 : 0,
            }}
          >
            <div className="w-[400px] h-full overflow-y-auto bg-white">
              <ProductDetailPanel
                batch={selectedBatch}
                onClose={handleClosePanel}
                onAddToCart={handleAddToCart}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </div>
        )}
      </div>

      {/* Role Creation Modals */}
      <CreateCassavaBatchModal
        isOpen={showFarmerBatchModal}
        onClose={() => setShowFarmerBatchModal(false)}
        onSuccess={handleNewListingCreated}
      />

      <ListProcessedProductModal
        isOpen={showProcessorProductModal}
        onClose={() => setShowProcessorProductModal(false)}
        onSuccess={handleNewListingCreated}
      />

      <ListServiceMachineryModal
        isOpen={showServiceMachineryModal}
        onClose={() => setShowServiceMachineryModal(false)}
        onSuccess={handleNewListingCreated}
      />

      <UserOrdersAndSalesModal
        isOpen={showOrdersSalesModal}
        onClose={() => setShowOrdersSalesModal(false)}
        initialTab={ordersModalTab}
      />
    </div>
  );
}