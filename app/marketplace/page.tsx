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
import { batchService } from "@/app/Services/batchService";
import { useAuth } from "@/app/Context/AuthContext";
import { getAuthToken } from "@/app/Services/tokenHelper";
import CreateCassavaBatchModal from "./components/CreateCassavaBatchModal";
import ListProcessedProductModal from "./components/ListProcessedProductModal";
import ListServiceMachineryModal from "./components/ListServiceMachineryModal";
import UserOrdersAndSalesModal from "./components/UserOrdersAndSalesModal";
import AuthPromptModal from "./components/AuthPromptModal";

export function normalizeCategory(cat?: string | null): string {
  if (!cat) return "raw-cassava";
  const cleaned = String(cat).toLowerCase().replace(/[\s_-]+/g, "");
  if (
    cleaned.includes("raw") ||
    cleaned.includes("root") ||
    cleaned.includes("stem") ||
    cleaned.includes("seedling") ||
    cleaned.includes("farmer") ||
    cleaned.includes("tuber")
  ) {
    return "raw-cassava";
  }
  if (
    cleaned.includes("flour") ||
    cleaned.includes("starch") ||
    cleaned.includes("garri") ||
    cleaned.includes("gari") ||
    cleaned.includes("chip") ||
    cleaned.includes("process") ||
    cleaned.includes("proc") ||
    cleaned.includes("buyer")
  ) {
    return "process-products";
  }
  if (
    cleaned.includes("fertiliz") ||
    cleaned.includes("agro") ||
    cleaned.includes("chemical") ||
    cleaned.includes("input") ||
    cleaned.includes("seed")
  ) {
    return "inputs-seeds";
  }
  if (
    cleaned.includes("machin") ||
    cleaned.includes("lease") ||
    cleaned.includes("tractor") ||
    cleaned.includes("equipment") ||
    cleaned.includes("tool") ||
    cleaned.includes("service") ||
    cleaned.includes("logistic") ||
    cleaned.includes("transport") ||
    cleaned.includes("haulage")
  ) {
    return "machinery-lease";
  }
  if (cleaned.includes("cassava")) {
    return "raw-cassava";
  }
  return "raw-cassava";
}

export function deduplicateBatches(batches: CassavaBatch[]): CassavaBatch[] {
  const seenIds = new Set<string>();
  const seenCodes = new Set<string>();
  const seenComposites = new Set<string>();
  const result: CassavaBatch[] = [];

  for (const b of batches) {
    if (!b) continue;
    const idKey = b.id ? String(b.id).trim().toLowerCase() : "";
    const codeKey =
      b.batchCode && b.batchCode !== "BCH-UNKNOWN"
        ? String(b.batchCode).trim().toLowerCase()
        : "";
    const titleKey = (b.title || "").trim().toLowerCase();
    const sellerKey = (b.seller || "").trim().toLowerCase();
    const compositeKey = `${titleKey}|${sellerKey}|${b.quantity}|${b.pricePerTonne}`;

    if (idKey && seenIds.has(idKey)) continue;
    if (codeKey && seenCodes.has(codeKey)) continue;
    if (compositeKey && seenComposites.has(compositeKey)) continue;

    if (idKey) seenIds.add(idKey);
    if (codeKey) seenCodes.add(codeKey);
    if (compositeKey) seenComposites.add(compositeKey);

    result.push(b);
  }

  return result;
}

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
  const category = normalizeCategory(listing.category ?? fallbackCategory);
  const gradeValue = String(listing.grade ?? listing.qualityGrade ?? "A").toUpperCase();
  const grade = gradeValue.includes("B") ? "B" : "A";
  const rawQuantity =
    listing.availableQuantity ??
    listing.stockAvailable ??
    listing.quantity ??
    listing.quantityAvailable ??
    listing.machinesAvailable ??
    (listing.weightKg ? listing.weightKg / 1000 : null);
  const quantity = Number(rawQuantity ?? 0);

  const unit = String(listing.unit ?? listing.unitOfMeasure ?? "Tonnes");

  const rawPrice =
    listing.price ??
    listing.pricePerTonne ??
    listing.unitPrice ??
    (listing.pricePerKg ? listing.pricePerKg * 1000 : null);
  const price = Number(rawPrice ?? 0);
  const title = String(
    listing.title ?? listing.productName ?? listing.name ?? "Cassava Product"
  );

  const rawImages =
    listing.imageUrl
      ? [listing.imageUrl]
      : Array.isArray(listing.photoUrls) && listing.photoUrls.length > 0
      ? listing.photoUrls
      : Array.isArray(listing.images) && listing.images.length > 0
      ? listing.images
      : Array.isArray(listing.photos) && listing.photos.length > 0
      ? listing.photos
      : listing.primaryPhotoUrl
      ? [listing.primaryPhotoUrl]
      : [];

  const images = rawImages.filter(
    (img: string) => typeof img === "string" && img.trim() !== "" && !img.includes("Batch1.png")
  );

  let sellerName = "Verified Supplier";
  if (typeof listing.sellerName === "string" && listing.sellerName.trim()) {
    sellerName = listing.sellerName.trim();
  } else if (typeof listing.seller === "string" && listing.seller.trim()) {
    sellerName = listing.seller.trim();
  } else if (listing.seller && typeof listing.seller === "object") {
    const fn = listing.seller.firstName || listing.seller.name || "";
    const ln = listing.seller.lastName || "";
    const full = `${fn} ${ln}`.trim();
    sellerName = full || listing.seller.companyName || listing.seller.businessName || "Verified Supplier";
  } else if (listing.farmerName) {
    sellerName = String(listing.farmerName);
  }

  const sellerRole =
    listing.sellerRole ||
    listing.role ||
    (category === "process-products"
      ? "processor"
      : category === "machinery-lease"
      ? "service-provider"
      : "farmer");

  return {
    id: String(listing.id ?? listing.batchCode ?? `${category}-${Date.now()}-${Math.random()}`),
    batchCode: String(listing.batchCode ?? listing.code ?? listing.id ?? "BCH-UNKNOWN"),
    title,
    grade,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 10,
    unit,
    pricePerTonne: Number.isFinite(price) && price > 0 ? price : 150000,
    currency: String(listing.currency ?? "₦"),
    category,
    location: String(listing.location ?? listing.farmLocation ?? listing.origin ?? "Nigeria"),
    storageLocation: String(listing.badge ?? listing.storageLocation ?? listing.storageDestination ?? listing.location ?? "Central Hub"),
    seller: sellerName,
    sellerRole,
    storageTime: String(listing.storageTime ?? listing.storageDuration ?? listing.status ?? "Available"),
    temperatureC: Number(listing.temperatureC ?? listing.temperature ?? 24),
    humidityPercent: Number(listing.humidityPercent ?? listing.humidity ?? 52),
    isNew: Boolean(listing.isNew ?? true),
    description: String(
      listing.description ?? listing.notes ?? "Freshly harvested and verified produce available on YucaChain."
    ),
    images,
  };
};

export default function MarketplacePage() {
  const { addToCart, totalItems } = useCart();
  const { activeRole, currentUser } = useMarketplaceRole();
  const { isAuthenticated, user: authUser } = useAuth();
  const router = useRouter();

  const [allBatches, setAllBatches] = useState<CassavaBatch[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState<CassavaBatch | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({ grades: ["A", "B"], weight: 0 });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Role Action Modals
  const [showFarmerBatchModal, setShowFarmerBatchModal] = useState(false);
  const [showProcessorProductModal, setShowProcessorProductModal] = useState(false);
  const [showServiceMachineryModal, setShowServiceMachineryModal] = useState(false);
  const [showOrdersSalesModal, setShowOrdersSalesModal] = useState(false);
  const [ordersModalTab, setOrdersModalTab] = useState<"purchases" | "sales">("sales");

  const panelRef = useRef<HTMLDivElement>(null);

  const isUserAuthenticated = Boolean(isAuthenticated && authUser && authUser.id);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      // 1. Fetch from Public Marketplace Products endpoint (all live products on backend)
      const products = await marketplaceApi.getProducts({
        page: 1,
        limit: 100,
      }).catch(() => []);

      const list = Array.isArray(products) ? products : [];
      const normalizedApi = list.map((item) => normalizeListingToBatch(item, "raw-cassava"));

      // 2. If authenticated, also fetch from /marketplace/listings (seller's own listings / additional items)
      let normalizedListings: CassavaBatch[] = [];
      if (isUserAuthenticated && token) {
        try {
          const rawListings = await marketplaceApi.getListings().catch(() => []);
          if (Array.isArray(rawListings)) {
            normalizedListings = rawListings.map((item) => normalizeListingToBatch(item, "raw-cassava"));
          }
        } catch {}
      }

      // 3. If authenticated, fetch from Batches endpoint for any live farmer batches
      let normalizedBatches: CassavaBatch[] = [];
      if (isUserAuthenticated && token) {
        try {
          const rawBatches = await batchService.getBatches().catch(() => []);
          if (Array.isArray(rawBatches)) {
            normalizedBatches = rawBatches.map((b: any) => {
              let farmerDisplayName = "Verified Farmer";
              if (typeof b.farmerName === "string" && b.farmerName.trim()) {
                farmerDisplayName = b.farmerName.trim();
              } else if (b.farmer && typeof b.farmer === "object") {
                const fn = b.farmer.firstName || "";
                const ln = b.farmer.lastName || "";
                farmerDisplayName = `${fn} ${ln}`.trim() || "Verified Farmer";
              } else if (typeof b.farmer === "string" && b.farmer.trim()) {
                farmerDisplayName = b.farmer.trim();
              }

              const batchLocation = b.harvestState
                ? `${b.harvestLga ? b.harvestLga + ", " : ""}${b.harvestState}`
                : b.hubState
                ? `${b.hubLga ? b.hubLga + ", " : ""}${b.hubState}`
                : "Nigeria";

              const weightKg = Number(b.weightKg || b.estimatedWeightKg || b.estWeightKg || 20000);
              const weightTonnes = Math.round((weightKg / 1000) * 10) / 10;

              const pricePerTonne =
                Number(b.pricePerTonne) ||
                Number(b.pricePerTonneNgn) ||
                (Number(b.pricePerKgNgn) ? Number(b.pricePerKgNgn) * 1000 : 0) ||
                (Number(b.totalPriceNgn) && weightTonnes > 0
                  ? Math.round(Number(b.totalPriceNgn) / weightTonnes)
                  : 150000);

              return {
                id: String(b.id || b.batchCode),
                batchCode: String(b.batchCode || b.code || "BCH-UNKNOWN"),
                title: b.title || `Fresh Cassava Roots (${b.variety || b.batchCode || "TME 419"})`,
                grade: (String(b.qualityGrade || "A").includes("B") ? "B" : "A") as "A" | "B",
                quantity: weightTonnes > 0 ? weightTonnes : 20,
                unit: "Tonnes",
                pricePerTonne: pricePerTonne > 0 ? pricePerTonne : 150000,
                currency: "₦",
                category: "raw-cassava",
                location: batchLocation,
                storageLocation: b.vaultLotId ? `Vault Lot: ${b.vaultLotId}` : "YucaVault Agro Hub",
                seller: farmerDisplayName,
                sellerRole: "farmer",
                storageTime: b.status || "Harvested",
                temperatureC: 24,
                humidityPercent: 54,
                isNew: true,
                description: b.notes || `Freshly harvested cassava batch verified in YucaVault.`,
                images: Array.isArray(b.photos) && b.photos.length > 0 ? b.photos : [],
              };
            });
          }
        } catch {}
      }

      // 4. Combine all live backend items and deduplicate
      const combined = deduplicateBatches([
        ...normalizedApi,
        ...normalizedListings,
        ...normalizedBatches,
      ]);
      setAllBatches(combined);
    } catch (err: any) {
      console.error("Failed to load marketplace listings:", err);
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

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allBatches.length,
      "raw-cassava": 0,
      "inputs-seeds": 0,
      "machinery-lease": 0,
      "process-products": 0,
    };
    for (const b of allBatches) {
      const cat = b.category || "raw-cassava";
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      } else {
        counts["raw-cassava"] += 1;
      }
    }
    return counts;
  }, [allBatches]);

  const visibleBatches = useMemo(() => {
    let list = allBatches.filter((b) => {
      const catMatch = activeCategoryId === "all" || b.category === activeCategoryId;
      const gradeMatch =
        filters.grades.length === 0 ||
        filters.grades.length >= 2 ||
        filters.grades.includes(b.grade as "A" | "B");
      const weightMatch =
        filters.weight <= 0 ||
        b.category !== "raw-cassava" ||
        b.quantity >= filters.weight;
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

    return deduplicateBatches(list);
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

  const handleAddToCart = (batch: CassavaBatch): boolean => {
    if (!isUserAuthenticated) {
      setShowAuthModal(true);
      return false;
    }
    addToCart(batch);
    return true;
  };

  const handlePlaceOrder = (batch: CassavaBatch): boolean => {
    if (!isUserAuthenticated) {
      setShowAuthModal(true);
      return false;
    }
    addToCart(batch);
    router.push("/marketplace/shipping");
    return true;
  };

  const handleAddProductClick = () => {
    if (!isUserAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (activeRole === "consumer") {
      return;
    }
    if (activeRole === "farmer") {
      setShowFarmerBatchModal(true);
    } else if (activeRole === "processor") {
      setShowProcessorProductModal(true);
    } else if (activeRole === "service-provider") {
      setShowServiceMachineryModal(true);
    }
  };

  const handleNewListingCreated = async (item: any) => {
    if (item && typeof item === "object") {
      const normalized = normalizeListingToBatch(item, "raw-cassava");
      setAllBatches((prev) => deduplicateBatches([normalized, ...prev]));
    }
    await fetchMarketplaceData();
  };

  const hasActiveFilters =
    activeCategoryId !== "all" ||
    filters.grades.length === 1 ||
    filters.weight > 0 ||
    search.trim() !== "";

  const handleClearAllFilters = () => {
    setActiveCategoryId("all");
    setFilters({ grades: ["A", "B"], weight: 0 });
    setSearch("");
    setPage(1);
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
        {/* Desktop Sticky Left Sidebar */}
        <div className="hidden lg:block h-full shrink-0">
          <MarketplaceSidebar
            activeCategoryId={activeCategoryId}
            onCategoryChange={handleCategoryChange}
            currentFilters={filters}
            categoryCounts={categoryCounts}
            onApplyFilters={(f) => {
              setFilters(f);
              setPage(1);
            }}
            onOpenOrdersModal={() => {
              if (!isUserAuthenticated) {
                setShowAuthModal(true);
                return;
              }
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
                activeCategoryId={activeCategoryId}
                onCategoryChange={handleCategoryChange}
                currentFilters={filters}
                categoryCounts={categoryCounts}
                onApplyFilters={(f) => {
                  setFilters(f);
                  setPage(1);
                }}
                onCloseMobileDrawer={() => setShowMobileSidebar(false)}
                onOpenOrdersModal={() => {
                  setShowMobileSidebar(false);
                  if (!isUserAuthenticated) {
                    setShowAuthModal(true);
                    return;
                  }
                  setOrdersModalTab("sales");
                  setShowOrdersSalesModal(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 min-w-0">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-3 border-b border-gray-150/70">
            <div>
              {isUserAuthenticated ? (
                <>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    {activeRole === "farmer"
                      ? "Farmer Marketplace"
                      : activeRole === "processor"
                      ? "Processor Marketplace"
                      : activeRole === "service-provider"
                      ? "Agro-Services Marketplace"
                      : "Consumer Marketplace"}
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activeRole === "farmer"
                      ? "Register harvest cassava batches and trade with verified processors and off-takers"
                      : activeRole === "processor"
                      ? "Source raw cassava and supply premium processed food products to commercial off-takers"
                      : activeRole === "service-provider"
                      ? "List machinery, logistics and services for farmers and processors"
                      : "Browse and order verified cassava produce, premium flour, and agro products"}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    What are you buying from us today?
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Discover verified fresh cassava harvests, premium processed flour, garri, and agro-equipment direct from trusted producers.
                  </p>
                </>
              )}
            </div>

            {isUserAuthenticated && activeRole !== "consumer" && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddProductClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#226049] hover:bg-[#1a4336] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-98"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>
                    {activeRole === "farmer"
                      ? "Create Batch"
                      : activeRole === "processor"
                      ? "Add Processed Product"
                      : "List Machinery / Service"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Sub-bar: Horizontal Tabs & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            {/* Horizontal Tabs with dynamic counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {HORIZONTAL_TABS.map((tab) => {
                const isActive = activeCategoryId === tab.id;
                const count = categoryCounts[tab.id] ?? 0;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleCategoryChange(tab.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#226049] text-white shadow-2xs font-bold"
                        : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-gray-50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Controls: View Toggle, Filter, Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* View Mode Toggle */}
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
                  className={`inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
                    filters.grades.length === 1 || filters.weight > 0
                      ? "border-emerald-500 text-[#226049] bg-emerald-50/50"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <SlidersHorizontal size={13} className="text-amber-600" />
                  <span>Filter</span>
                  {(filters.grades.length === 1 || filters.weight > 0) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#226049]" />
                  )}
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-150 bg-white p-4 shadow-xl z-30 space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                        Filter Products
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFilters({ grades: ["A", "B"], weight: 0 });
                          setShowFilterDropdown(false);
                        }}
                        className="text-[11px] text-[#226049] hover:underline font-semibold cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Grade Filter */}
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                        Quality Grade
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setFilters({ ...filters, grades: ["A", "B"] })}
                          className={`py-1.5 rounded-lg border text-center font-medium cursor-pointer transition-colors ${
                            filters.grades.length !== 1
                              ? "bg-emerald-50 border-emerald-300 text-[#226049] font-bold"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilters({ ...filters, grades: ["A"] })}
                          className={`py-1.5 rounded-lg border text-center font-medium cursor-pointer transition-colors ${
                            filters.grades.length === 1 && filters.grades.includes("A")
                              ? "bg-emerald-50 border-emerald-300 text-[#226049] font-bold"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          Grade A
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilters({ ...filters, grades: ["B"] })}
                          className={`py-1.5 rounded-lg border text-center font-medium cursor-pointer transition-colors ${
                            filters.grades.length === 1 && filters.grades.includes("B")
                              ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          Grade B
                        </button>
                      </div>
                    </div>

                    {/* Min Batch Size Slider */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-gray-500 uppercase text-[10px]">
                          Min Batch Size
                        </span>
                        <span className="font-bold text-[#226049]">
                          {filters.weight === 0 ? "Any Volume" : `${filters.weight} Tonnes`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={filters.weight}
                        onChange={(e) => setFilters({ ...filters, weight: Number(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#226049]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFilterDropdown(false)}
                      className="w-full py-1.5 rounded-xl bg-[#226049] text-white text-xs font-bold hover:bg-[#1a4336] transition-colors cursor-pointer"
                    >
                      Done
                    </button>
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

          {/* Active Filters Pill Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 bg-white rounded-xl border border-gray-150 text-xs">
              <span className="text-gray-400 font-medium text-[11px]">Filtered by:</span>

              {activeCategoryId !== "all" && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#226049] border border-emerald-200 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
                  Category: {HORIZONTAL_TABS.find((t) => t.id === activeCategoryId)?.label || activeCategoryId}
                  <button
                    type="button"
                    onClick={() => setActiveCategoryId("all")}
                    className="hover:text-red-600 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {search.trim() !== "" && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
                  Search: "{search.trim()}"
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="hover:text-red-600 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.grades.length === 1 && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
                  Grade {filters.grades[0]}
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, grades: ["A", "B"] })}
                    className="hover:text-red-600 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.weight > 0 && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#226049] border border-emerald-200 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
                  Min {filters.weight} Tonnes
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, weight: 0 })}
                    className="hover:text-red-600 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-[11px] text-gray-500 hover:text-red-600 underline font-semibold ml-auto cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

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
                onResetFilters={handleClearAllFilters}
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

      {/* Authentication Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In to Add to Cart"
        message="Please sign in or register as a new user to add items to your cart and place marketplace orders."
        redirectUrl="/marketplace"
      />
    </div>
  );
}