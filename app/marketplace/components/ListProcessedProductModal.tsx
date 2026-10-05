"use client";

import React, { useState } from "react";
import {
  X,
  Factory,
  Package,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useMarketplaceRole } from "../context/MarketplaceRoleContext";

interface ListProcessedProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newProduct: any) => void;
}

export default function ListProcessedProductModal({
  isOpen,
  onClose,
  onSuccess,
}: ListProcessedProductModalProps) {
  const { currentUser, addListing } = useMarketplaceRole();

  const [formData, setFormData] = useState({
    title: "High Quality Cassava Flour (HQCF) - 50kg Bags",
    productType: "High Quality Cassava Flour (HQCF)",
    quantityAvailable: 50,
    unit: "Bags",
    pricePerUnit: 48000,
    moisturePercent: 10,
    packaging: "50kg Woven Polypropylene with Inner Liner",
    facilityLocation: currentUser.facilityAddress || "Plot 14 Industrial Layout, Agbara, Ogun State",
    description: "Premium food-grade HQCF, unfermented, odorless, high-purity cassava flour. Meets SON and NAFDAC export specifications. Suitable for bakery, confectionery, and industrial food applications.",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newListing = {
        id: `proc-${Date.now()}`,
        batchCode: `PROC-${Math.floor(1000 + Math.random() * 9000)}`,
        title: formData.title,
        grade: "A",
        quantity: Number(formData.quantityAvailable),
        unit: formData.unit,
        pricePerTonne: Number(formData.pricePerUnit),
        currency: "₦",
        category: "process-products",
        location: formData.facilityLocation,
        storageLocation: "Processing Warehouse / Mill Facility",
        seller: currentUser.name,
        sellerRole: "processor",
        storageTime: "Freshly Processed",
        temperatureC: 22,
        humidityPercent: 45,
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
            <Factory size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              List Processed Cassava Product
            </h3>
            <p className="text-xs text-gray-500">
              Offer Garri, Cassava Starch, HQCF, or Chips to bulk buyers &amp; consumers
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="text-emerald-600 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-gray-900">Product Listed Successfully!</h4>
            <p className="text-xs text-gray-500 mt-1">
              Your processed cassava goods are now active on the marketplace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Product Category</label>
              <select
                value={formData.productType}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    productType: val,
                    title: `${val} - 50kg Bags`,
                  });
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
              >
                <option value="High Quality Cassava Flour (HQCF)">High Quality Cassava Flour (HQCF)</option>
                <option value="Premium Yellow Garri (Fortified)">Premium Yellow Garri (Fortified)</option>
                <option value="Ijebu White Garri">Ijebu White Garri</option>
                <option value="Industrial Native Cassava Starch">Industrial Native Cassava Starch</option>
                <option value="Dried Cassava Chips (Alcohol & Feed Grade)">Dried Cassava Chips (Alcohol & Feed Grade)</option>
                <option value="Cassava Feed Pellets">Cassava Feed Pellets</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Listing Display Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Quantity Stock</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantityAvailable}
                  onChange={(e) => setFormData({ ...formData, quantityAvailable: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Unit of Measure</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                >
                  <option value="Bags">50kg Bags</option>
                  <option value="Tonnes">Tonnes (MT)</option>
                  <option value="Kilograms">Kilograms (Kg)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Price per Unit (₦)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Packaging Specification</label>
                <input
                  type="text"
                  value={formData.packaging}
                  onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Moisture Level (%)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.moisturePercent}
                  onChange={(e) => setFormData({ ...formData, moisturePercent: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Facility / Warehouse Address</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.facilityLocation}
                  onChange={(e) => setFormData({ ...formData, facilityLocation: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Detailed Description &amp; Certifications</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-gray-900 focus:border-[#226049] focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 flex items-start gap-2">
              <AlertCircle size={15} className="text-blue-800 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-950 leading-relaxed">
                When buyers or consumers purchase your processed goods, funds are held in YucaChain escrow. Once delivered, Admin sends your money directly to: <span className="font-semibold">{currentUser.bankName} ({currentUser.accountNumber || "Provided"})</span>.
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
                <span>List Product</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
