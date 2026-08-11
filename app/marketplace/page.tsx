
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
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

const ALL_BATCHES: (CassavaBatch & { category: string })[] = [
  {
    id: "1", category: "raw-cassava", batchCode: "BCH-26-06-234560",
    title: "TME 419 Stems", grade: "A", quantity: 12000, pricePerTonne: 95,
    location: "Offa, Kwara State", seller: "Top Farmers Ltd.", storageTime: "16hrs",
    temperatureC: 29, humidityPercent: 65, isNew: true,
    description: "Premium grade TME 419 cassava, freshly harvested and stored in climate-controlled conditions. Clean and ready for processing.",
    images: ["/images/batches/Batch1.png"]
  },
  {
    id: "2", category: "raw-cassava", batchCode: "BCH-26-06-234561",
    title: "Fresh Cassava", grade: "A", quantity: 10000, pricePerTonne: 120,
    location: "Offa, Kwara State", seller: "Top Farmers Ltd.", storageTime: "16hrs",
    temperatureC: 29, humidityPercent: 65, isNew: true,
    description: "A freshly harvested cassava stored in a strict condition. Clean and ready for processing.",
    images: ["/images/batches/Batch2.png"]
  },
  {
    id: "3", category: "raw-cassava", batchCode: "BCH-26-06-234562",
    title: "TME 419 Stems", grade: "B", quantity: 10000, pricePerTonne: 120,
    location: "Offa, Kwara State", seller: "Top Farmers Ltd.", storageTime: "16hrs",
    temperatureC: 29, humidityPercent: 65,
    description: "Standard grade TME 419 stems, ideal for processing into garri and other products.",
    images: ["/images/batches/Batch3.png"]
  },
  {
    id: "4", category: "raw-cassava", batchCode: "BCH-26-06-234563",
    title: "TME 419 Stems", grade: "A", quantity: 10000, pricePerTonne: 120,
    location: "Offa, Kwara State", seller: "Top Farmers Ltd.", storageTime: "16hrs",
    temperatureC: 29, humidityPercent: 65, isNew: true,
    description: "High-quality A-grade TME 419 stems sourced directly from verified farms.",
    images: ["/images/batches/Batch4.png"]
  },
  {
    id: "5", category: "raw-cassava", batchCode: "BCH-26-06-234564",
    title: "Fresh Cassava", grade: "A", quantity: 10000, pricePerTonne: 120,
    location: "Offa, Kwara State", seller: "Top Farmers Ltd.", storageTime: "16hrs",
    temperatureC: 29, humidityPercent: 65,
    description: "A freshly harvested cassava stored in a strict condition. Clean and ready for processing.",
    images: ["/images/batches/Batch1.png"]
  },
  {
    id: "6", category: "raw-cassava", batchCode: "BCH-26-06-234565",
    title: "TME 419 Stems", grade: "B", quantity: 10000, pricePerTonne: 120,
    location: "Offa, Kwara State", seller: "Top Farmers Ltd.", storageTime: "16hrs",
    temperatureC: 29, humidityPercent: 65, isNew: true,
    description: "Grade B TME 419 stems in good condition for secondary processing needs.",
    images: ["/images/batches/Batch2.png"]
  },
  {
    id: "6b", category: "raw-cassava", batchCode: "BCH-26-06-234566",
    title: "TMS 30572 Stems", grade: "A", quantity: 15000, pricePerTonne: 110,
    location: "Iseyin, Oyo State", seller: "Green Valley Farms", storageTime: "12hrs",
    temperatureC: 28, humidityPercent: 60, isNew: true,
    description: "TMS 30572 stems, disease-resistant variety, high yield potential.",
    images: ["/images/batches/Batch3.png"]
  },
  {
    id: "6c", category: "raw-cassava", batchCode: "BCH-26-06-234567",
    title: "Fresh Cassava Tubers", grade: "B", quantity: 18000, pricePerTonne: 98,
    location: "Epe, Lagos State", seller: "Epe Farmers Coop", storageTime: "8hrs",
    temperatureC: 30, humidityPercent: 70,
    description: "Freshly harvested cassava tubers, ideal for starch and flour production.",
    images: ["/images/batches/Batch4.png"]
  },

  // Inputs & Seeds
  {
    id: "7", category: "inputs-seeds", batchCode: "BCH-26-06-234570",
    title: "TME 419 Stem Cuttings", grade: "A", quantity: 500, unit: "Bundles", pricePerTonne: 15000,
    location: "Ibadan, Oyo State", seller: "SeedLink Nigeria", storageTime: "48hrs",
    temperatureC: 20, humidityPercent: 55, isNew: true,
    description: "Certified disease-free stem cuttings for high-yield planting season.",
    images: ["/images/batches/Batch1.png"]
  },
  {
    id: "8", category: "inputs-seeds", batchCode: "BCH-26-06-234571",
    title: "Cassava Fertilizer Pack", grade: "A", quantity: 100, unit: "Bags", pricePerTonne: 22000,
    location: "Kano State", seller: "AgriChem Supplies", storageTime: "90days",
    temperatureC: 25, humidityPercent: 40,
    description: "Balanced NPK fertilizer pack formulated specifically for cassava cultivation.",
    images: ["/images/batches/Batch2.png"]
  },
  {
    id: "9", category: "inputs-seeds", batchCode: "BCH-26-06-234572",
    title: "Herbicide – Cassava Grade", grade: "B", quantity: 50, unit: "Litres", pricePerTonne: 8500,
    location: "Lagos State", seller: "CropCare Ltd.", storageTime: "180days",
    temperatureC: 23, humidityPercent: 45,
    description: "Effective pre-emergence herbicide safe for cassava farms.",
    images: ["/images/batches/Batch3.png"]
  },
  {
    id: "10", category: "inputs-seeds", batchCode: "BCH-26-06-234573",
    title: "NPK Fertilizer", grade: "A", quantity: 200, unit: "Bags", pricePerTonne: 18000,
    location: "Abuja, FCT", seller: "NutriSoil Nigeria", storageTime: "60days",
    temperatureC: 27, humidityPercent: 38,
    description: "Premium quality NPK fertilizer for healthy cassava root development.",
    images: ["/images/batches/Batch4.png"]
  },
  {
    id: "10b", category: "inputs-seeds", batchCode: "BCH-26-06-234574",
    title: "Organic Compost Bin", grade: "B", quantity: 150, unit: "Bags", pricePerTonne: 12000,
    location: "Benin City, Edo State", seller: "EcoGrow Org", storageTime: "30days",
    temperatureC: 26, humidityPercent: 50, isNew: true,
    description: "Rich organic compost ideal for nourishing sandy loam soils before planting.",
    images: ["/images/batches/Batch1.png"]
  },
  {
    id: "10c", category: "inputs-seeds", batchCode: "BCH-26-06-234575",
    title: "Fungicide Spray", grade: "A", quantity: 80, unit: "Litres", pricePerTonne: 9500,
    location: "Owerri, Imo State", seller: "AgroShield Co.", storageTime: "120days",
    temperatureC: 22, humidityPercent: 40,
    description: "Broad-spectrum fungicide targeting root rot and leaf spot diseases.",
    images: ["/images/batches/Batch2.png"]
  },
  {
    id: "10d", category: "inputs-seeds", batchCode: "BCH-26-06-234576",
    title: "TMS 980505 Stem Cuttings", grade: "A", quantity: 400, unit: "Bundles", pricePerTonne: 16000,
    location: "Abeokuta, Ogun State", seller: "Yewa Seeds", storageTime: "24hrs",
    temperatureC: 25, humidityPercent: 60, isNew: true,
    description: "High starch yield TMS 980505 cuttings, certified by agricultural extension services.",
    images: ["/images/batches/Batch3.png"]
  },
  {
    id: "10e", category: "inputs-seeds", batchCode: "BCH-26-06-234577",
    title: "Cassava Stem Protective Gel", grade: "B", quantity: 120, unit: "Tubes", pricePerTonne: 4000,
    location: "Enugu, Enugu State", seller: "BioGuard Labs", storageTime: "360days",
    temperatureC: 20, humidityPercent: 45,
    description: "Anti-termite stem coating gel to protect cuttings during the first weeks of planting.",
    images: ["/images/batches/Batch4.png"]
  },

  // Machinery Lease
  {
    id: "11", category: "machinery-lease", batchCode: "BCH-26-06-234580",
    title: "Cassava Harvester", grade: "A", quantity: 1, unit: "Unit", pricePerTonne: 250000,
    location: "Oyo State", seller: "AgriMach Rentals", storageTime: "N/A",
    temperatureC: 25, humidityPercent: 50, isNew: true,
    description: "High-capacity cassava harvester available for seasonal lease. Covers up to 50 hectares per day.",
    images: ["/images/batches/Batch1.png"]
  },
  {
    id: "12", category: "machinery-lease", batchCode: "BCH-26-06-234581",
    title: "Tractor (4WD)", grade: "B", quantity: 2, unit: "Units", pricePerTonne: 180000,
    location: "Kaduna State", seller: "Farm Tools Hub", storageTime: "N/A",
    temperatureC: 30, humidityPercent: 45,
    description: "Heavy-duty 4WD tractor for land preparation, suitable for large-scale cassava farms.",
    images: ["/images/batches/Batch2.png"]
  },
  {
    id: "13", category: "machinery-lease", batchCode: "BCH-26-06-234582",
    title: "Cassava Peeling Machine", grade: "A", quantity: 3, unit: "Units", pricePerTonne: 95000,
    location: "Rivers State", seller: "AgroEquip Nigeria", storageTime: "N/A",
    temperatureC: 28, humidityPercent: 55,
    description: "Industrial-grade cassava peeling machine, handles up to 2 tonnes per hour.",
    images: ["/images/batches/Batch3.png"]
  },
  {
    id: "14", category: "machinery-lease", batchCode: "BCH-26-06-234583",
    title: "Irrigation Pump", grade: "B", quantity: 5, unit: "Units", pricePerTonne: 45000,
    location: "Niger State", seller: "WaterFarm Ltd.", storageTime: "N/A",
    temperatureC: 26, humidityPercent: 60,
    description: "Diesel-powered irrigation pump for dry-season cassava production.",
    images: ["/images/batches/Batch4.png"]
  },
  {
    id: "14b", category: "machinery-lease", batchCode: "BCH-26-06-234584",
    title: "Cassava Grating Machine", grade: "A", quantity: 4, unit: "Units", pricePerTonne: 75000,
    location: "Akure, Ondo State", seller: "Akure Tech Foundry", storageTime: "N/A",
    temperatureC: 27, humidityPercent: 50, isNew: true,
    description: "Heavy-duty cassava grater with stainless steel drum. Driven by a 5HP petrol engine.",
    images: ["/images/batches/Batch1.png"]
  },
  {
    id: "14c", category: "machinery-lease", batchCode: "BCH-26-06-234585",
    title: "Hydraulic Dewatering Press", grade: "A", quantity: 2, unit: "Units", pricePerTonne: 60000,
    location: "Warri, Delta State", seller: "Niger Delta Tools", storageTime: "N/A",
    temperatureC: 25, humidityPercent: 55,
    description: "Hydraulic press for fast dewatering of grated cassava mash during garri processing.",
    images: ["/images/batches/Batch2.png"]
  },
  {
    id: "14d", category: "machinery-lease", batchCode: "BCH-26-06-234586",
    title: "Rotary Cassava Dryer", grade: "B", quantity: 1, unit: "Unit", pricePerTonne: 350000,
    location: "Makurdi, Benue State", seller: "Benue Agri-Systems", storageTime: "N/A",
    temperatureC: 29, humidityPercent: 48, isNew: true,
    description: "Large scale rotary dryer for continuous drying of cassava flour or starch.",
    images: ["/images/batches/Batch3.png"]
  },
  {
    id: "14e", category: "machinery-lease", batchCode: "BCH-26-06-234587",
    title: "Motorized Cassava Slicer", grade: "B", quantity: 3, unit: "Units", pricePerTonne: 50000,
    location: "Ilorin, Kwara State", seller: "Kwara Mech Works", storageTime: "N/A",
    temperatureC: 28, humidityPercent: 50,
    description: "Motorized chip cutter/slicer for producing high-quality cassava chips for export.",
    images: ["/images/batches/Batch4.png"]
  },

  // Process Products
  {
    id: "15", category: "process-products", batchCode: "BCH-26-06-234590",
    title: "Cassava Flour (Grade A)", grade: "A", quantity: 60, pricePerTonne: 130000,
    location: "Ondo State", seller: "CassavaMill Processors", storageTime: "30days",
    temperatureC: 20, humidityPercent: 40, isNew: true,
    description: "Finely milled cassava flour, ready for food-grade use.",
    images: ["/images/batches/Batch1.png"]
  },
  {
    id: "16", category: "process-products", batchCode: "BCH-26-06-234591",
    title: "Garri (White)", grade: "B", quantity: 40, pricePerTonne: 95000,
    location: "Cross River State", seller: "SouthFarm Processors", storageTime: "21days",
    temperatureC: 22, humidityPercent: 42,
    description: "Sun-dried white garri produced from fresh tubers, packaged in food-safe bags.",
    images: ["/images/batches/Batch2.png"]
  },
  {
    id: "17", category: "process-products", batchCode: "BCH-26-06-234592",
    title: "Cassava Starch", grade: "A", quantity: 90, pricePerTonne: 145000,
    location: "Anambra State", seller: "Starch Kings Ltd.", storageTime: "45days",
    temperatureC: 18, humidityPercent: 35,
    description: "Industrial cassava starch suitable for textile, paper, and food industries.",
    images: ["/images/batches/Batch3.png"]
  },
  {
    id: "18", category: "process-products", batchCode: "BCH-26-06-234593",
    title: "Fufu (Processed)", grade: "B", quantity: 20, pricePerTonne: 78000,
    location: "Delta State", seller: "Village Mills Co.", storageTime: "7days",
    temperatureC: 24, humidityPercent: 55,
    description: "Ready-to-cook processed fufu from certified cassava varieties.",
    images: ["/images/batches/Batch4.png"]
  },
  {
    id: "18b", category: "process-products", batchCode: "BCH-26-06-234594",
    title: "Yellow Garri", grade: "A", quantity: 50, pricePerTonne: 105000,
    location: "Abakaliki, Ebonyi State", seller: "Ebonyi Processing Hub", storageTime: "15days",
    temperatureC: 23, humidityPercent: 45, isNew: true,
    description: "Premium yellow garri fried with palm oil for rich color and traditional taste.",
    images: ["/images/batches/Batch1.png"]
  },
  {
    id: "18c", category: "process-products", batchCode: "BCH-26-06-234595",
    title: "High Quality Cassava Peel Mash", grade: "B", quantity: 150, pricePerTonne: 35000,
    location: "Abeokuta, Ogun State", seller: "Ogun Feed Mills", storageTime: "5days",
    temperatureC: 25, humidityPercent: 60,
    description: "Dried and processed cassava peel mash, excellent for livestock feed formulation.",
    images: ["/images/batches/Batch2.png"]
  },
  {
    id: "18d", category: "process-products", batchCode: "BCH-26-06-234596",
    title: "Tapioca Pearls", grade: "A", quantity: 30, pricePerTonne: 160000,
    location: "Uyo, Akwa Ibom State", seller: "Calabar Bakers Co.", storageTime: "60days",
    temperatureC: 20, humidityPercent: 38, isNew: true,
    description: "Tapioca flakes, perfect as a snack or cereal.",
    images: ["/images/batches/Batch3.png"]
  },
  {
    id: "18e", category: "process-products", batchCode: "BCH-26-06-234597",
    title: "Ethanol-Grade Cassava Chips", grade: "B", quantity: 200, pricePerTonne: 85000,
    location: "Lokoja, Kogi State", seller: "Kogi Distilleries Corp", storageTime: "25days",
    temperatureC: 24, humidityPercent: 44,
    description: "Dry cassava chips with minimum starch content of 70%, ideal for industrial ethanol production.",
    images: ["/images/batches/Batch4.png"]
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  "raw-cassava": "Raw Cassava Batches",
  "inputs-seeds": "Inputs & Seeds",
  "machinery-lease": "Machinery Lease",
  "process-products": "Process Products",
};

const ITEMS_PER_PAGE = 8;

export default function MarketplacePage() {
  const { addToCart, totalItems } = useCart();
  const router = useRouter();

  const [activeCategoryId, setActiveCategoryId] = useState("raw-cassava");
  const [selectedBatch, setSelectedBatch] = useState<CassavaBatch | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({ grades: ["A", "B"], weight: 1 });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [page, setPage] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBatch) {

      requestAnimationFrame(() => setPanelVisible(true));
    } else {
      setPanelVisible(false);
    }
  }, [selectedBatch]);

  const visibleBatches = useMemo(() => {
    let list = ALL_BATCHES.filter((b) => {
      const catMatch = b.category === activeCategoryId;
      const gradeMatch = filters.grades.length === 0 || filters.grades.includes(b.grade as "A" | "B");
      const searchMatch = search === "" || b.title.toLowerCase().includes(search.toLowerCase());
      return catMatch && gradeMatch && searchMatch;
    });

    if (sortBy === "Newest") list = [...list].reverse();
    if (sortBy === "Price: Low to High") list = [...list].sort((a, b) => a.pricePerTonne - b.pricePerTonne);
    if (sortBy === "Price: High to Low") list = [...list].sort((a, b) => b.pricePerTonne - a.pricePerTonne);

    return list;
  }, [activeCategoryId, filters, search, sortBy]);

  const totalPages = Math.ceil(visibleBatches.length / ITEMS_PER_PAGE);
  const paginated = visibleBatches.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCategoryChange = (id: string) => {
    setActiveCategoryId(id);
    setSelectedBatch(null);
    setPage(1);
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

  const panelOpen = selectedBatch !== null;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#F9FAFB]">
      <MarketplaceNavbar
        cartCount={totalItems}
        onCartClick={() => router.push("/marketplace/cart")}
      />

      <div className="flex flex-1 overflow-hidden">

        <MarketplaceSidebar
          activeCategoryId={activeCategoryId}
          onCategoryChange={handleCategoryChange}
          onApplyFilters={(f) => { setFilters(f); setPage(1); }}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 min-w-0 bg-[#F9FAFB]">

          <h2 className="text-xl font-bold text-gray-900">
            {CATEGORY_LABELS[activeCategoryId]}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Browse and search through all categories
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap bg-gray-100 rounded-full px-3 py-1">
              {visibleBatches.length} Batches found
            </span>

            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <Search
                size={13}
                strokeWidth={1.8}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div className="relative ml-auto">
              <label className="text-xs text-gray-500 mr-1">Sort By</label>
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
          <ProductGrid
            batches={paginated}
            selectedBatchId={selectedBatch?.id || null}
            onViewDetails={handleViewDetails}
            onAddToCart={handleAddToCart}
            onPlaceOrder={(b) => console.log("Place order", b.id)}
            panelOpen={panelOpen}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={visibleBatches.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </main>
        {selectedBatch && (
          <div
            ref={panelRef}
            className="shrink-0 overflow-hidden border-l border-gray-100 transition-all duration-300 ease-in-out"
            style={{
              width: panelVisible ? "400px" : "0px",
              opacity: panelVisible ? 1 : 0,
            }}
          >
            <div className="w-[400px] h-full overflow-y-auto bg-white">
              <ProductDetailPanel
                batch={selectedBatch}
                onClose={handleClosePanel}
                onContactSeller={(b) => console.log("Contact seller", b.id)}
                onPlaceOrder={(b) => console.log("Place order", b.id)}
              />
            </div>
          </div>
        )}
 
   
      </div>
       <Footer/>
    </div>
  );
}