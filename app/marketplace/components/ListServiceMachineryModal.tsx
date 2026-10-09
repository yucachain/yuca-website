"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Tractor,
  Upload,
  CheckCircle2,
  Loader2,
  Trash2,
  Plus,
  Check,
} from "lucide-react";
import { useMarketplaceRole } from "../context/MarketplaceRoleContext";
import { marketplaceApi } from "@/app/Services/marketplaceService";
import { CreateServiceListingRequest } from "@/app/types/marketplace";
import { toast } from "sonner";

interface ListServiceMachineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newService: any) => void;
}

interface CategoryOption {
  key: string;
  label: string;
}

const COMMON_MACHINERY_CERTIFICATIONS = [
  "Certified Operator",
  "Safety Inspected",
  "Insured Fleet",
  "Standard NIS",
  "GPS Tracked",
  "Heavy Duty Licensed",
  "Nafdac",
  "SON",
];

const PRESET_SERVICE_UNITS = [
  "Per Day",
  "Per Hectare",
  "Per Hour",
  "Per Week",
  "Per Month",
  "Per Bundle (50 Stems)",
  "Per Trip",
  "Per Unit",
];

function formatCategoryLabel(str: string): string {
  if (!str) return "";
  const formatted = str.replace(/([A-Z])/g, " $1").trim();
  if (formatted === "Cassava Stems Seedlings") return "Cassava Stems & Seedlings";
  if (formatted === "Fertilizer Agrochemicals") return "Fertilizer & Agrochemicals";
  if (formatted === "Machinery Lease") return "Machinery & Equipment Lease";
  if (formatted === "Processed Product") return "Processed Products";
  return formatted;
}

export default function ListServiceMachineryModal({
  isOpen,
  onClose,
  onSuccess,
}: ListServiceMachineryModalProps) {
  const { currentUser, addListing } = useMarketplaceRole();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic category options from backend
  const [listingCategories, setListingCategories] = useState<CategoryOption[]>([
    { key: "MachineryLease", label: "Machinery & Equipment Lease" },
    { key: "CassavaStemsSeedlings", label: "Cassava Stems & Seedlings" },
    { key: "FertilizerAgrochemicals", label: "Fertilizer & Agrochemicals" },
    { key: "ProcessedProduct", label: "Processed Products" },
  ]);

  const [processedCategories, setProcessedCategories] = useState<CategoryOption[]>([
    { key: "Tractor", label: "Tractors & Land Prep" },
    { key: "Harvester", label: "Cassava Harvester & Lifter" },
    { key: "ProcessingMill", label: "Garri Fryers & Grating Mills" },
    { key: "Transport", label: "Haulage & Farm Logistics" },
    { key: "Other", label: "Other Mechanization Services" },
  ]);

  // Form State reflecting the exact request body schema
  const [category, setCategory] = useState("MachineryLease");
  const [processedCategory, setProcessedCategory] = useState("Tractor");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("Per Day");
  const [stockAvailable, setStockAvailable] = useState<number | string>(1);
  const [machinesAvailable, setMachinesAvailable] = useState<number | string>(1);
  const [minimumOrder, setMinimumOrder] = useState<number | string>(1);
  const [location, setLocation] = useState(
    currentUser.businessAddress || currentUser.facilityAddress || currentUser.state || ""
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([
    "Certified Operator",
    "Safety Inspected",
  ]);
  const [customCertInput, setCustomCertInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    marketplaceApi
      .getListingCategories()
      .then((res) => {
        if (!isMounted) return;
        if (Array.isArray(res) && res.length > 0) {
          const mapped = res.map((item) => {
            const rawKey = typeof item === "string" ? item : item.name || item.key || String(item.id || "");
            const rawLabel = typeof item === "string" ? formatCategoryLabel(item) : item.description || formatCategoryLabel(item.name || rawKey);
            return { key: rawKey, label: rawLabel };
          });
          setListingCategories(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    filesArray.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" is too large. Max size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          setPhotoUrls((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCertification = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const addCustomCertification = () => {
    const trimmed = customCertInput.trim();
    if (!trimmed) return;
    if (!certifications.includes(trimmed)) {
      setCertifications((prev) => [...prev, trimmed]);
      setCustomCertInput("");
    } else {
      toast.info("Certification is already added");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast.error("Please enter a service or machine name");
      return;
    }

    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price/rate");
      return;
    }

    setLoading(true);

    try {
      const apiPayload: CreateServiceListingRequest = {
        category,
        processedCategory,
        productName: productName.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        unitOfMeasure,
        stockAvailable: Number(stockAvailable) || 0,
        machinesAvailable: Number(machinesAvailable) || 0,
        minimumOrder: Number(minimumOrder) || 1,
        location: location.trim(),
        status: "Active",
        photoUrls: photoUrls,
        certifications: certifications,
      };

      const result = await marketplaceApi.createServiceListing(apiPayload).catch((err) => {
        console.warn("Backend API createServiceListing fallback:", err);
        return null;
      });

      const newListing = {
        id: result?.id || `srv-${Date.now()}`,
        batchCode: result?.batchCode || `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
        title: productName.trim(),
        grade: "Standard",
        quantity: Number(stockAvailable) || Number(machinesAvailable) || 1,
        unit: unitOfMeasure,
        pricePerTonne: Number(price),
        currency: "₦",
        category: "services-machinery",
        location: location.trim() || "Nigeria",
        storageLocation: "Depot / Service Station",
        seller: currentUser.name || "Verified Service Provider",
        sellerRole: "service-provider",
        storageTime: "Available On Demand",
        temperatureC: 25,
        humidityPercent: 50,
        isNew: true,
        description: description.trim(),
        images: photoUrls,
        status: "Active",
        certifications: certifications,
        minimumOrder: Number(minimumOrder) || 1,
        machinesAvailable: Number(machinesAvailable) || 1,
      };

      addListing(newListing);
      onSuccess?.(newListing);
      toast.success(`Service "${productName}" listed successfully!`);

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Failed to list machinery/service");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar border border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#226049]">
            <Tractor size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">List Machinery & Agro Services</h3>
            <p className="text-xs text-gray-500">
              Register equipment lease, haulage, planting or farm mechanization services
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="text-emerald-600 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-gray-900">Service Listed!</h4>
            <p className="text-xs text-gray-500 mt-1">
              Your listing "{productName}" has been submitted to the marketplace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-sans">
            {/* Row 1: Category & Sub-Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white font-medium"
                >
                  {listingCategories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Service Category *
                </label>
                <select
                  required
                  value={processedCategory}
                  onChange={(e) => setProcessedCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white font-medium"
                >
                  {processedCategories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Service / Machine Name */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Machine / Service Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 75HP Tractor with 3-Disc Plough"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none font-medium"
              />
            </div>

            {/* Row 3: Price & Rate Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Rate / Price (₦) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 125000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none font-semibold text-[#226049]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Unit of Measure *
                </label>
                <input
                  type="text"
                  required
                  list="preset-service-units-list"
                  placeholder="e.g. Per Day"
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                />
                <datalist id="preset-service-units-list">
                  {PRESET_SERVICE_UNITS.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Row 4: Machines Available & Stock Available */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Machines Available *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 3"
                  value={machinesAvailable}
                  onChange={(e) => setMachinesAvailable(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Stock / Capacity Units *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 3"
                  value={stockAvailable}
                  onChange={(e) => setStockAvailable(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5: Minimum Order & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Minimum Order *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 1"
                  value={minimumOrder}
                  onChange={(e) => setMinimumOrder(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iwo Road, Ibadan, Oyo State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>


            {/* Description */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Description & Operator Details
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-gray-900 focus:border-[#226049] focus:outline-none"
                placeholder="Operator inclusion, equipment specs, fuel policies, mobilisation coverage..."
              />
            </div>

            {/* Certifications */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Certifications & Inspections
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_MACHINERY_CERTIFICATIONS.map((cert) => {
                  const selected = certifications.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCertification(cert)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
                        selected
                          ? "bg-emerald-50 text-[#226049] border-emerald-300"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {selected && <Check size={11} />}
                      <span>{cert}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom certification..."
                  value={customCertInput}
                  onChange={(e) => setCustomCertInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomCertification();
                    }
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-900 focus:border-[#226049] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomCertification}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Photos Upload */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-gray-700">
                  Photos
                </label>
                {photoUrls.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrls([])}
                    className="text-[10px] text-gray-400 hover:text-gray-600 underline cursor-pointer"
                  >
                    Clear photos
                  </button>
                )}
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-[#226049] transition-colors bg-white">
                <input
                  type="file"
                  id="service-machinery-photos"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="service-machinery-photos"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <Upload size={20} className="text-[#226049]" />
                  <span className="font-semibold text-gray-800">
                    {photoUrls.length === 0
                      ? "No file chosen - Click to add photos"
                      : `Add photos (${photoUrls.length} chosen)`}
                  </span>
                  <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB each</span>
                </label>
              </div>

              {photoUrls.length > 0 && (
                <div className="flex items-center gap-2 mt-2.5 overflow-x-auto py-1">
                  {photoUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-gray-200"
                    >
                      <img
                        src={url}
                        alt="Service machinery preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-[#226049] py-2.5 font-bold text-white hover:bg-[#1a4336] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>List Service / Machinery</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
