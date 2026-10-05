"use client";

import React, { useState } from "react";
import {
  X,
  Sprout,
  Upload,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useMarketplaceRole } from "../context/MarketplaceRoleContext";

interface CreateCassavaBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBatch: any) => void;
}

export default function CreateCassavaBatchModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCassavaBatchModalProps) {
  const { currentUser, addListing } = useMarketplaceRole();

  const [formData, setFormData] = useState({
    batchCode: `YC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: "Fresh TME 419 High-Starch Cassava Roots",
    quantityTonnes: 20,
    qualityGrade: "A",
    pricePerTonne: 150000,
    harvestDate: new Date().toISOString().split("T")[0],
    farmLocation: currentUser.farmAddress || "Iseyin Agro Cluster, Oyo State",
    dryMatterPercent: 32,
    description: "Freshly harvested premium cassava roots with high starch extract and low fiber. Ideal for high-grade starch extraction, garri, and flour processing.",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newListing = {
        id: `batch-${Date.now()}`,
        batchCode: formData.batchCode,
        title: formData.title,
        grade: formData.qualityGrade,
        quantity: Number(formData.quantityTonnes),
        unit: "Tonnes",
        pricePerTonne: Number(formData.pricePerTonne),
        currency: "₦",
        category: "raw-cassava",
        location: formData.farmLocation,
        storageLocation: "Farm Gate / Direct Harvest",
        seller: currentUser.name,
        sellerRole: "farmer",
        storageTime: "Freshly Harvested",
        temperatureC: 26,
        humidityPercent: 60,
        isNew: true,
        description: formData.description,
        images: ["/images/batches/Batch1.png"],
      };

      addListing(newListing);
      onSuccess?.(newListing);

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#226049]">
            <Sprout size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Create &amp; List Cassava Batch
            </h3>
            <p className="text-xs text-gray-500">
              Publish your harvested roots directly to verified bulk buyers and millers
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="text-emerald-600 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-gray-900">Batch Listed Successfully!</h4>
            <p className="text-xs text-gray-500 mt-1">
              Your batch {formData.batchCode} is now live on the marketplace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Batch Code / Tag</label>
                <input
                  type="text"
                  required
                  value={formData.batchCode}
                  onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 font-mono text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Quality Grade</label>
                <select
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                >
                  <option value="A">Grade A (High Starch, Low Fiber)</option>
                  <option value="B">Grade B (Standard Commercial)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Batch Title / Cassava Variety</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Estimated Weight (Tonnes)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={formData.quantityTonnes}
                  onChange={(e) => setFormData({ ...formData, quantityTonnes: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Price per Tonne (₦)</label>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  required
                  value={formData.pricePerTonne}
                  onChange={(e) => setFormData({ ...formData, pricePerTonne: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Harvest Date</label>
                <input
                  type="date"
                  required
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Dry Matter Content (%)</label>
                <input
                  type="number"
                  min="15"
                  max="45"
                  value={formData.dryMatterPercent}
                  onChange={(e) => setFormData({ ...formData, dryMatterPercent: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Farm / Gate Location</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.farmLocation}
                  onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Description &amp; Processing Notes</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-gray-900 focus:border-[#226049] focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 flex items-start gap-2">
              <AlertCircle size={15} className="text-[#226049] shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-950 leading-relaxed">
                When a buyer orders this batch, payment is placed in secure YucaChain escrow. Once verified at intake or delivered, Admin disburses the money directly to your registered bank account: <span className="font-semibold">{currentUser.bankName} ({currentUser.accountNumber || "Provided"})</span>.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-[#226049] py-2.5 font-bold text-white hover:bg-[#1a4336] transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Publish Batch</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
