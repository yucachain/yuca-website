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
  const { currentUser, addListing } = useMarketplaceRole();

  const [varieties, setVarieties] = useState<VarietyItem[]>([
    { id: 1, name: "Tme419", description: "TME 419" },
    { id: 2, name: "Tms30572", description: "TMS 30572" },
    { id: 3, name: "OkoIyawo", description: "Oko Iyawo" },
    { id: 4, name: "Other", description: "Other" },
  ]);

  const [qualityGrades, setQualityGrades] = useState<QualityGradeItem[]>([
    { id: 1, name: "A", description: "Grade A — Premium" },
    { id: 2, name: "B", description: "Grade B — Standard" },
    { id: 3, name: "C", description: "Grade C" },
    { id: 4, name: "Rejected", description: "Rejected" },
  ]);

  const [formData, setFormData] = useState({
    variety: "Tme419",
    estimatedWeightKg: "20000",
    pricePerTonneNgn: "150000",
    totalPrice: "3000000",
    harvestDate: new Date().toISOString().split("T")[0],
    harvestLatitude: "7.3775",
    harvestLongitude: "3.9470",
    harvestState: currentUser.state || "Oyo",
    harvestLga: currentUser.lga || "Iseyin",
    intendedDestination: "Storage",
    qualityGrade: "A",
    notes: "Freshly harvested premium cassava roots with high starch extract and low fiber.",
  });

  const handleWeightChange = (weightVal: string) => {
    const w = Number(weightVal);
    const p = Number(formData.pricePerTonneNgn);
    const tonnes = w > 0 ? w / 1000 : 0;
    const newTotal = tonnes > 0 && p > 0 ? String(Math.round(tonnes * p)) : formData.totalPrice;
    setFormData((prev) => ({
      ...prev,
      estimatedWeightKg: weightVal,
      totalPrice: newTotal,
    }));
  };

  const handlePricePerTonneChange = (priceVal: string) => {
    const p = Number(priceVal);
    const w = Number(formData.estimatedWeightKg);
    const tonnes = w > 0 ? w / 1000 : 0;
    const newTotal = tonnes > 0 && p > 0 ? String(Math.round(tonnes * p)) : "";
    setFormData((prev) => ({
      ...prev,
      pricePerTonneNgn: priceVal,
      totalPrice: newTotal || prev.totalPrice,
    }));
  };

  const handleTotalPriceChange = (totalVal: string) => {
    const tot = Number(totalVal);
    const w = Number(formData.estimatedWeightKg);
    const tonnes = w > 0 ? w / 1000 : 0;
    const newPricePerTonne =
      tonnes > 0 && tot > 0 ? String(Math.round(tot / tonnes)) : formData.pricePerTonneNgn;
    setFormData((prev) => ({
      ...prev,
      totalPrice: totalVal,
      pricePerTonneNgn: newPricePerTonne,
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
    setLoading(true);

    try {
      // Build multipart/form-data payload as defined by the backend
      const multipart = new FormData();
      multipart.append("Variety", formData.variety);
      multipart.append("HarvestDate", formData.harvestDate);

      if (
        formData.estimatedWeightKg !== "" &&
        formData.estimatedWeightKg !== undefined &&
        !isNaN(Number(formData.estimatedWeightKg))
      ) {
        multipart.append("EstimatedWeightKg", String(Number(formData.estimatedWeightKg)));
      }

      if (
        formData.harvestLatitude !== "" &&
        formData.harvestLatitude !== undefined &&
        !isNaN(Number(formData.harvestLatitude))
      ) {
        multipart.append("HarvestLatitude", String(Number(formData.harvestLatitude)));
      }

      if (
        formData.harvestLongitude !== "" &&
        formData.harvestLongitude !== undefined &&
        !isNaN(Number(formData.harvestLongitude))
      ) {
        multipart.append("HarvestLongitude", String(Number(formData.harvestLongitude)));
      }

      if (formData.harvestState && formData.harvestState.trim() !== "") {
        multipart.append("HarvestState", formData.harvestState.trim());
      }

      if (formData.harvestLga && formData.harvestLga.trim() !== "") {
        multipart.append("HarvestLga", formData.harvestLga.trim());
      }

      if (formData.intendedDestination && formData.intendedDestination.trim() !== "") {
        multipart.append("IntendedDestination", formData.intendedDestination.trim());
      }

      if (formData.notes && formData.notes.trim() !== "") {
        multipart.append("Notes", formData.notes.trim().slice(0, 200));
      }

      // Add photos items
      selectedPhotos.forEach((file) => {
        multipart.append("photos", file);
      });

      const result = await marketplaceApi.createFarmerBatch(multipart).catch((err) => {
        console.warn("Backend createFarmerBatch fallback:", err);
        return null;
      });

      const batchId = result?.id || result?.batchId;
      const weightTonnes =
        formData.estimatedWeightKg && Number(formData.estimatedWeightKg) > 0
          ? Number(formData.estimatedWeightKg) / 1000
          : 20;

      const pricePerTonneNgn =
        Number(formData.pricePerTonneNgn) ||
        (Number(formData.totalPrice) && weightTonnes > 0
          ? Math.round(Number(formData.totalPrice) / weightTonnes)
          : 150000);

      const totalBatchPrice =
        Number(formData.totalPrice) || Math.round(weightTonnes * pricePerTonneNgn);

      // Attach pricing via POST /api/v1/batches/{id}/pricing
      if (batchId) {
        try {
          await marketplaceApi.setBatchPricing(batchId, {
            pricePerTonneNgn: pricePerTonneNgn,
            intendedDestination: formData.intendedDestination || "Storage",
          });
        } catch (err: any) {
          console.warn("Pricing attachment notice:", err);
        }
      }

      const gradeShort = formData.qualityGrade?.includes("B") ? "B" : "A";
      const quantityTonnesFormatted = Math.round(weightTonnes * 10) / 10;

      const newListing = {
        id: batchId || `batch-${Date.now()}`,
        batchCode:
          result?.batchCode ||
          `YC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Fresh ${formData.variety} Cassava Roots (${quantityTonnesFormatted}T)`,
        grade: gradeShort,
        quantity: quantityTonnesFormatted,
        unit: "Tonnes",
        pricePerTonne: totalBatchPrice,
        currency: "₦",
        category: "raw-cassava",
        location:
          formData.harvestState && formData.harvestLga
            ? `${formData.harvestLga}, ${formData.harvestState}`
            : formData.harvestState || "Nigeria",
        storageLocation:
          formData.intendedDestination === "Storage"
            ? "YucaVault Agro Hub"
            : "Farm Gate Direct",
        seller: currentUser.name || "Verified Farmer",
        sellerRole: "farmer",
        storageTime: "Freshly Harvested",
        temperatureC: 25,
        humidityPercent: 55,
        isNew: true,
        description:
          formData.notes ||
          `Freshly harvested ${formData.variety} cassava roots ready for off-take.`,
        images: photoPreviews.length > 0 ? photoPreviews : [],
      };

      addListing(newListing);
      onSuccess?.(newListing);
      toast.success(`Batch for ${formData.variety} created successfully!`);

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Failed to create cassava batch");
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

            {/* Row 2: Weight & Price per Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Estimated Weight (Kg) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  placeholder="e.g. 20000"
                  value={formData.estimatedWeightKg}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  {formData.estimatedWeightKg && Number(formData.estimatedWeightKg) > 0
                    ? `≈ ${(Number(formData.estimatedWeightKg) / 1000).toFixed(2)} Tonnes`
                    : "Weight in Kg"}
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Price per Weight (₦) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 150000"
                  value={formData.pricePerTonneNgn}
                  onChange={(e) => handlePricePerTonneChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none font-semibold text-[#226049]"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Price per Tonne / unit weight
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
                  Marketplace whole batch price: ₦{Number(formData.totalPrice || 0).toLocaleString()}
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
                    placeholder="0 or empty"
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
                    placeholder="0 or empty"
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

            {/* IntendedDestination */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-gray-700">
                  IntendedDestination
                </label>
              </div>
              <select
                value={formData.intendedDestination}
                onChange={(e) =>
                  setFormData({ ...formData, intendedDestination: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white font-medium"
              >
                <option value="Storage">Storage (YucaHub)</option>
                <option value="Marketplace">Marketplace </option>
              </select>
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
                placeholder="Produce remarks..."
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
