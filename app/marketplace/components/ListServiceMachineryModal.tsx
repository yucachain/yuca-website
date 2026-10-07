"use client";

import React, { useState } from "react";
import {
  X,
  Tractor,
  Sprout,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useMarketplaceRole } from "../context/MarketplaceRoleContext";
import { toast } from "sonner";

interface ListServiceMachineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newService: any) => void;
}

export default function ListServiceMachineryModal({
  isOpen,
  onClose,
  onSuccess,
}: ListServiceMachineryModalProps) {
  const { currentUser, addListing } = useMarketplaceRole();

  const [serviceType, setServiceType] = useState<"machinery" | "stems">("machinery");

  const [formData, setFormData] = useState({
    title: "Heavy-Duty Cassava Ridging & Ploughing Tractor",
    category: "machinery-lease",
    machineModel: "Massey Ferguson 375 (75 HP) + 4-Disc Ridger",
    rate: 125000,
    rateUnit: "Per Day",
    availableUnits: 3,
    location: currentUser.businessAddress || "Central Mechanization Hub, Iwo Road, Ibadan",
    operatorIncluded: true,
    fuelPolicy: "Client supplies diesel or pays fuel surcharge",
    description: "High-power tractor suitable for virgin farmland clearing, ploughing, and ridging for high-yield cassava tuber development. Serviced with professional operator.",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newListing = {
        id: `srv-${Date.now()}`,
        batchCode: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
        title: formData.title,
        grade: "A",
        quantity: Number(formData.availableUnits),
        unit: formData.rateUnit,
        pricePerTonne: Number(formData.rate),
        currency: "₦",
        category: serviceType === "machinery" ? "machinery-lease" : "inputs-seeds",
        location: formData.location,
        storageLocation: "Service Depot / Equipment Yard",
        seller: currentUser.name,
        sellerRole: "service-provider",
        storageTime: "Ready for Dispatch",
        temperatureC: 25,
        humidityPercent: 50,
        isNew: true,
        description: formData.description,
        images: ["/images/batches/Batch1.png"],
      };

      addListing(newListing);
      onSuccess?.(newListing);
      toast.success(`Service/Equipment "${formData.title}" listed successfully!`);

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
            <Tractor size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              List Service or Machinery
            </h3>
            <p className="text-xs text-gray-500">
              Lease machines to farmers/processors or supply certified stems &amp; equipment
            </p>
          </div>
        </div>

        {/* Toggle between Machinery Lease and Stems/Inputs */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 text-xs font-bold text-gray-600">
          <button
            type="button"
            onClick={() => {
              setServiceType("machinery");
              setFormData({
                ...formData,
                title: "Heavy-Duty Cassava Ridging & Ploughing Tractor",
                category: "machinery-lease",
                rate: 125000,
                rateUnit: "Per Day",
              });
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              serviceType === "machinery" ? "bg-white text-gray-900 shadow-xs" : "hover:text-gray-900"
            }`}
          >
            <Tractor size={14} />
            <span>Machinery / Equipment Lease</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setServiceType("stems");
              setFormData({
                ...formData,
                title: "Certified Pro-Vitamin A Cassava Stems (Bundles)",
                category: "inputs-seeds",
                rate: 4500,
                rateUnit: "Per Bundle (50 Stems)",
              });
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              serviceType === "stems" ? "bg-white text-gray-900 shadow-xs" : "hover:text-gray-900"
            }`}
          >
            <Sprout size={14} />
            <span>Cassava Stems &amp; Cuttings</span>
          </button>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="text-emerald-600 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-gray-900">Service Listed Successfully!</h4>
            <p className="text-xs text-gray-500 mt-1">
              Your service is now published for farmers and processors across YucaChain.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {serviceType === "machinery" ? "Machinery Service Title" : "Stem / Seedling Title"}
              </label>
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
                <label className="block font-bold text-gray-700 mb-1">
                  {serviceType === "machinery" ? "Units Available" : "Bundles Stock"}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.availableUnits}
                  onChange={(e) => setFormData({ ...formData, availableUnits: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Pricing Rate (₦)</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Billing Interval</label>
                <select
                  value={formData.rateUnit}
                  onChange={(e) => setFormData({ ...formData, rateUnit: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                >
                  {serviceType === "machinery" ? (
                    <>
                      <option value="Per Day">Per Day (8 Hours)</option>
                      <option value="Per Hectare">Per Hectare</option>
                      <option value="Per Week">Per Week</option>
                      <option value="Per Month">Per Month</option>
                    </>
                  ) : (
                    <>
                      <option value="Per Bundle (50 Stems)">Per Bundle (50 Stems)</option>
                      <option value="Per 100 Bundles">Per 100 Bundles</option>
                      <option value="Per Hectare Pack">Per Hectare Pack</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {serviceType === "machinery" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Make / Model / Capacity</label>
                  <input
                    type="text"
                    value={formData.machineModel}
                    onChange={(e) => setFormData({ ...formData, machineModel: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Operator &amp; Crew</label>
                  <select
                    value={formData.operatorIncluded ? "yes" : "no"}
                    onChange={(e) => setFormData({ ...formData, operatorIncluded: e.target.value === "yes" })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none bg-white"
                  >
                    <option value="yes">Experienced Certified Operator Included</option>
                    <option value="no">Machine Only (Client Provides Operator)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-700 mb-1">Base / Mobilization Location</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-gray-900 focus:border-[#226049] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Service Terms &amp; Scope</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-gray-900 focus:border-[#226049] focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 flex items-start gap-2">
              <AlertCircle size={15} className="text-amber-800 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-950 leading-relaxed">
                When a farmer or buyer books your machinery/stems, payment is confirmed via YucaChain bank transfer. Once the booking is completed, Admin disburses payment to: <span className="font-semibold">{currentUser.bankName} ({currentUser.accountNumber || "Provided"})</span>.
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
                <span>List Service</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
