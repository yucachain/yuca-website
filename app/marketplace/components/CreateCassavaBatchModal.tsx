"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Sprout,
  Upload,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Navigation,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { useMarketplaceRole } from "../context/MarketplaceRoleContext";
import { marketplaceApi } from "@/app/Services/marketplaceService";
import type { CreateFarmerBatchRequest } from "@/app/types/marketplace";
import {
  NIGERIAN_STATES,
  getLgasForState,
} from "@/app/marketplace/components/locationOptions";
import { toast } from "sonner";

interface CreateCassavaBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBatch: any) => void;
}

interface VarietyItem {
  id?: number | string;
  name: string;
  description?: string;
}

interface QualityGradeItem {
  id?: number | string;
  name: string;
  description?: string;
}

export default function CreateCassavaBatchModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCassavaBatchModalProps) {
  const { currentUser } = useMarketplaceRole();

  const [varieties, setVarieties] = useState<VarietyItem[]>([
    { id: 1, name: "TME 419 (High Yield)", description: "TME 419 (High Yield)" },
    { id: 2, name: "TMS 30572", description: "TMS 30572" },
    { id: 3, name: "Oko Iyawo", description: "Oko Iyawo" },
    { id: 4, name: "Other Variety", description: "Other Variety" },
  ]);

  const [qualityGrades, setQualityGrades] = useState<QualityGradeItem[]>([
    { id: 1, name: "A", description: "Grade A — Premium" },
    { id: 2, name: "B", description: "Grade B — Standard" },
    { id: 3, name: "C", description: "Grade C" },
    { id: 4, name: "Rejected", description: "Rejected" },
  ]);

  const [formData, setFormData] = useState({
    variety: "TME 419 (High Yield)",
    estimatedWeightKg: "",
    pricePerKg: "185",
    pricePerTonneNgn: "185000",
    totalPrice: "",
    harvestDate: new Date().toISOString().split("T")[0],
    harvestLatitude: "",
    harvestLongitude: "",
    harvestState: currentUser.state || "Oyo State",
    harvestLga: currentUser.lga || "Iseyin",
    intendedDestination: "Storage",
    storageDestination: "YucaVault-Iseyin-Hub",
    qualityGrade: "A",
    notes: "",
  });

  const handleWeightChange = (weightVal: string) => {
    const w = Number(weightVal);
    const pkg = Number(formData.pricePerKg) || 185;
    const newTotal = w > 0 && pkg > 0 ? String(Math.round(w * pkg)) : "";
    setFormData((prev) => ({
      ...prev,
      estimatedWeightKg: weightVal,
      totalPrice: newTotal || (weightVal ? prev.totalPrice : ""),
    }));
  };

  const handlePricePerKgChange = (pkgVal: string) => {
    const pkg = Number(pkgVal);
    const pTonne = pkg > 0 ? String(pkg * 1000) : "";
    const w = Number(formData.estimatedWeightKg);
    const newTotal = w > 0 && pkg > 0 ? String(Math.round(w * pkg)) : "";
    setFormData((prev) => ({
      ...prev,
      pricePerKg: pkgVal,
      pricePerTonneNgn: pTonne || prev.pricePerTonneNgn,
      totalPrice: newTotal || prev.totalPrice,
    }));
  };

  const handlePricePerTonneChange = (priceVal: string) => {
    const p = Number(priceVal);
    const pkg = p > 0 ? String(Math.round(p / 1000)) : "";
    const w = Number(formData.estimatedWeightKg);
    const tonnes = w > 0 ? w / 1000 : 0;
    const newTotal = tonnes > 0 && p > 0 ? String(Math.round(tonnes * p)) : "";
    setFormData((prev) => ({
      ...prev,
      pricePerTonneNgn: priceVal,
      pricePerKg: pkg || prev.pricePerKg,
      totalPrice: newTotal || (priceVal ? prev.totalPrice : ""),
    }));
  };

  const handleTotalPriceChange = (totalVal: string) => {
    const tot = Number(totalVal);
    const w = Number(formData.estimatedWeightKg);
    const tonnes = w > 0 ? w / 1000 : 0;
    const newPricePerTonne =
      tonnes > 0 && tot > 0 ? String(Math.round(tot / tonnes)) : "";
    const newPricePerKg =
      w > 0 && tot > 0 ? String(Math.round(tot / w)) : "";
    setFormData((prev) => ({
      ...prev,
      totalPrice: totalVal,
      pricePerTonneNgn: newPricePerTonne || (totalVal ? prev.pricePerTonneNgn : ""),
      pricePerKg: newPricePerKg || (totalVal ? prev.pricePerKg : ""),
    }));
  };

  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Load varieties and quality grades from backend endpoints
  useEffect(() => {
    if (!isOpen) return;

    // GET /api/v1/Miscellaneous/cassava-varieties
    marketplaceApi
      .getCassavaVarieties()
      .then((res: any[]) => {
        if (Array.isArray(res) && res.length > 0) {
          const list = res.map((v) =>
            typeof v === "string"
              ? { name: v, description: v }
              : { name: v.name || v.variety || String(v), description: v.description || v.name }
          );
          setVarieties(list);
          if (list.length > 0 && !list.some((item) => item.name === formData.variety)) {
            setFormData((prev) => ({ ...prev, variety: list[0].name }));
          }
        }
      })
      .catch(() => { });

    // GET /api/v1/Miscellaneous/quality-grades
    marketplaceApi
      .getQualityGrades()
      .then((res: any[]) => {
        if (Array.isArray(res) && res.length > 0) {
          const list = res.map((g) =>
            typeof g === "string"
              ? { name: g, description: g }
              : { name: g.name || g.grade || String(g), description: g.description || `Grade ${g.name}` }
          );
          setQualityGrades(list);
        }
      })
      .catch(() => { });
  }, [isOpen]);

  const lgaOptions = useMemo(
    () => getLgasForState(formData.harvestState),
    [formData.harvestState]
  );

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedPhotos((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === "string") {
            setPhotoPreviews((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          harvestLatitude: String(pos.coords.latitude.toFixed(6)),
          harvestLongitude: String(pos.coords.longitude.toFixed(6)),
        }));
        setGettingLocation(false);
        toast.success("Current GPS coordinates detected!");
      },
      () => {
        setGettingLocation(false);
        toast.error("Could not retrieve GPS coordinates. Please input manually.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const weightKg = Number(formData.estimatedWeightKg);
    if (!weightKg || weightKg <= 0) {
      toast.error("Please enter a valid estimated weight in Kg");
      return;
    }

    const pricePerKg =
      Number(formData.pricePerKg) ||
      (Number(formData.pricePerTonneNgn)
        ? Math.round(Number(formData.pricePerTonneNgn) / 1000)
        : Number(formData.totalPrice) && weightKg
        ? Math.round(Number(formData.totalPrice) / weightKg)
        : 185);

    const farmLocation = (
      formData.harvestLga && formData.harvestState
        ? `${formData.harvestLga}, ${formData.harvestState}`
        : formData.harvestState || currentUser.farmAddress || currentUser.address || "Iseyin, Oyo State"
    ).trim();

    const selectedVarietyObj = varieties.find((v) => v.name === formData.variety);
    const varietyName = selectedVarietyObj?.description || formData.variety;

    const storageDestination =
      formData.storageDestination ||
      (formData.intendedDestination === "Storage"
        ? "YucaVault-Iseyin-Hub"
        : "YucaVault-Logistics-Hub");

    setLoading(true);

    try {
      // Endpoint 4.1: POST /marketplace/farmer/batches
      const apiPayload: CreateFarmerBatchRequest = {
        variety: varietyName,
        weightKg: weightKg,
        pricePerKg: pricePerKg,
        farmLocation: farmLocation,
        harvestDate: formData.harvestDate || new Date().toISOString().split("T")[0],
        storageDestination: storageDestination,
        // Complementary fields for backend compatibility
        qualityGrade: formData.qualityGrade || "A",
        pricePerTonne: Number(formData.pricePerTonneNgn) || (pricePerKg * 1000),
        notes: formData.notes?.trim() || undefined,
        harvestState: formData.harvestState?.trim() || undefined,
        harvestLga: formData.harvestLga?.trim() || undefined,
        harvestLatitude:
          formData.harvestLatitude && !isNaN(Number(formData.harvestLatitude))
            ? Number(formData.harvestLatitude)
            : undefined,
        harvestLongitude:
          formData.harvestLongitude && !isNaN(Number(formData.harvestLongitude))
            ? Number(formData.harvestLongitude)
            : undefined,
        photoUrls: photoPreviews.length > 0 ? photoPreviews : undefined,
      };

      const result = await marketplaceApi.createFarmerBatch(apiPayload);

      toast.success(result?.message || `Cassava batch registered successfully!`);
      onSuccess?.(result);

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Failed to create cassava batch on backend");
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
            <Sprout size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Create Cassava Batch</h3>
            <p className="text-xs text-gray-500">
              Register harvest produce with variety, weight, GPS coordinates and photos
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="text-emerald-600 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-gray-900">Cassava Batch Created!</h4>
            <p className="text-xs text-gray-500 mt-1">
              Your batch for {formData.variety} has been submitted to the marketplace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-sans">
            {/* Variety * & Quality Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Variety *
                </label>
                <select
                  required
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white font-medium"
                >
                  {varieties.map((v, idx) => (
                    <option key={v.name || idx} value={v.name}>
                      {v.description && v.description !== v.name
                        ? `${v.description} (${v.name})`
                        : v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">Quality Grade</label>
                </div>
                <select
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                >
                  <option value="">(None / Empty)</option>
                  {qualityGrades.map((g, idx) => (
                    <option key={g.name || idx} value={g.name}>
                      {g.description || `Grade ${g.name}`}
                    </option>
                  ))}
                </select>

              </div>
            </div>

            {/* Row 2: Weight & Price per Kg / Tonne */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Estimated Weight (Kg) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 15000"
                  value={formData.estimatedWeightKg}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  {formData.estimatedWeightKg && Number(formData.estimatedWeightKg) > 0
                    ? `≈ ${(Number(formData.estimatedWeightKg) / 1000).toFixed(2)} Tonnes`
                    : "Enter weight in Kg"}
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Price per Kg (₦) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 185"
                  value={formData.pricePerKg}
                  onChange={(e) => handlePricePerKgChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none font-semibold text-[#226049]"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  e.g. ₦185 per Kg
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Price per Tonne (₦)
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 185000"
                  value={formData.pricePerTonneNgn}
                  onChange={(e) => handlePricePerTonneChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none font-semibold text-[#226049]"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  1 Tonne = 1,000 Kg
                </span>
              </div>
            </div>

            {/* Row 3: Total Price for Selected Weight & Harvest Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Total Price for Selected Weight (₦) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 3000000"
                  value={formData.totalPrice}
                  onChange={(e) => handleTotalPriceChange(e.target.value)}
                  className="w-full rounded-xl border border-emerald-300 bg-emerald-50/30 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none font-bold text-sm text-[#226049]"
                />
                <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
                  {formData.totalPrice && Number(formData.totalPrice) > 0
                    ? `Marketplace whole batch price: ₦${Number(formData.totalPrice).toLocaleString()}`
                    : "Calculated automatically from weight & price"}
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Harvest Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            {/* Harvest Coordinates (HarvestLatitude & HarvestLongitude) */}
            <div className="rounded-2xl border border-gray-200/80 p-3 bg-gray-50/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800">Harvest Coordinates (GPS)</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#226049] font-bold text-[11px] hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Navigation size={12} className={gettingLocation ? "animate-spin" : ""} />
                    <span>{gettingLocation ? "Detecting..." : "Detect Current GPS"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">
                    HarvestLatitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.harvestLatitude}
                    onChange={(e) =>
                      setFormData({ ...formData, harvestLatitude: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-gray-900 focus:border-[#226049] focus:outline-none"
                    placeholder="e.g. 7.3775"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">
                    HarvestLongitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.harvestLongitude}
                    onChange={(e) =>
                      setFormData({ ...formData, harvestLongitude: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-gray-900 focus:border-[#226049] focus:outline-none"
                    placeholder="e.g. 3.9470"
                  />
                </div>
              </div>
            </div>

            {/* HarvestState & HarvestLga */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">HarvestState </label>

                </div>
                <select
                  value={formData.harvestState}
                  onChange={(e) =>
                    setFormData({ ...formData, harvestState: e.target.value, harvestLga: "" })
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                >
                  <option value="">Select State </option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">HarvestLga </label>
                </div>
                <select
                  value={formData.harvestLga}
                  onChange={(e) => setFormData({ ...formData, harvestLga: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                >
                  <option value="">Select LGA </option>
                  {lgaOptions.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Storage Destination & Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Intended Destination
                </label>
                <select
                  value={formData.intendedDestination}
                  onChange={(e) =>
                    setFormData({ ...formData, intendedDestination: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white font-medium"
                >
                  <option value="Storage">Storage (YucaVault Hub)</option>
                  <option value="Marketplace">Marketplace Direct</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Storage Destination Hub *
                </label>
                <select
                  value={formData.storageDestination}
                  onChange={(e) =>
                    setFormData({ ...formData, storageDestination: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white font-medium"
                >
                  <option value="YucaVault-Iseyin-Hub">YucaVault-Iseyin-Hub (Oyo State)</option>
                  <option value="YucaVault-Ibadan-Central-Hub">YucaVault-Ibadan-Central-Hub</option>
                  <option value="YucaVault-Ogun-Agro-Hub">YucaVault-Ogun-Agro-Hub</option>
                  <option value="YucaVault-Ondo-Hub">YucaVault-Ondo-Hub</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-gray-700">
                  Notes <span className="text-[10px] text-gray-400 font-normal">(max 200)</span>
                </label>
              </div>
              <textarea
                rows={2}
                maxLength={200}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-gray-900 focus:border-[#226049] focus:outline-none"
                placeholder="e.g. Freshly harvested cassava roots with high starch content..."
              />
            </div>

            {/* photos (multipart/form-data) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-gray-700">
                  photos{" "}
                </label>
                {selectedPhotos.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
                      setSelectedPhotos([]);
                      setPhotoPreviews([]);
                    }}
                    className="text-[10px] text-gray-400 hover:text-gray-600 underline cursor-pointer"
                  >
                    Send empty value (Clear photos)
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400">Send empty value</span>
                )}
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-[#226049] transition-colors bg-white">
                <input
                  type="file"
                  id="batch-photos-input"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="batch-photos-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <Upload size={20} className="text-[#226049]" />
                  <span className="font-semibold text-gray-800">
                    {selectedPhotos.length === 0
                      ? "No file chosen - Click to add photos"
                      : `Add string item / files (${selectedPhotos.length} chosen)`}
                  </span>
                  <span className="text-[10px] text-gray-400">PNG, JPG up to 10MB each</span>
                </label>
              </div>

              {photoPreviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2.5 overflow-x-auto py-1">
                  {photoPreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-gray-200"
                    >

                      <img
                        src={preview}
                        alt="Upload preview"
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
                <span>Create Batch</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
