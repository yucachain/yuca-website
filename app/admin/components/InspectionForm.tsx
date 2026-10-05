"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Scale,
  Check,
  Loader2,
} from "lucide-react";
import type { BatchRecord, BatchIntakeRequest } from "@/app/types/batchVaultDispatch";

export interface InspectionFormProps {
  batch: BatchRecord | null;
  onSubmit: (payload: BatchIntakeRequest) => Promise<void>;
  loading?: boolean;
}

const GRADE_OPTIONS: Array<{ value: "A" | "B" | "C"; label: string; desc: string }> = [
  { value: "A", label: "Grade A", desc: "Premium high-starch, zero rot" },
  { value: "B", label: "Grade B", desc: "Good quality, standard starch" },
  { value: "C", label: "Grade C", desc: "Acceptable for industrial starch" },
];

export default function InspectionForm({
  batch,
  onSubmit,
  loading = false,
}: InspectionFormProps) {
  const [verifiedWeight, setVerifiedWeight] = useState<number>(
    batch?.verifiedWeightKg ?? batch?.weightKg ?? 0
  );
  const [qualityGrade, setQualityGrade] = useState<"A" | "B" | "C">(
    (batch?.qualityGrade as any) || "A"
  );
  const [moistureContent, setMoistureContent] = useState<number>(
    batch?.moistureContent ?? 0
  );
  const [urgentStorageFlag, setUrgentStorageFlag] = useState<boolean>(
    batch?.urgentStorageFlag || false
  );
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync when batch changes
  React.useEffect(() => {
    if (batch) {
      if (batch.verifiedWeightKg || batch.weightKg) {
        setVerifiedWeight(batch.verifiedWeightKg || batch.weightKg);
      }
      if (batch.qualityGrade && batch.qualityGrade !== "reject") {
        setQualityGrade(batch.qualityGrade);
      }
      if (batch.moistureContent) {
        setMoistureContent(batch.moistureContent);
      }
      if (batch.urgentStorageFlag !== undefined) {
        setUrgentStorageFlag(batch.urgentStorageFlag);
      }
    }
  }, [batch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    if (verifiedWeight <= 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        verifiedWeight: Number(verifiedWeight),
        qualityGrade,
        moistureContent: Number(moistureContent),
        urgentStorageFlag,
        notes: notes.trim(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Intake submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Intake &amp; Inspection</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Record verified weighbridge data, quality grade, and moisture
          </p>
        </div>
        {batch && (
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-mono font-bold text-[#226049]">
            {batch.batchCode}
          </span>
        )}
      </div>

      {success && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2.5 text-xs font-medium text-emerald-800 animate-in fade-in">
          <Check size={16} className="text-emerald-700 shrink-0" />
          <span>Intake record saved successfully! Produce ready for storage allocation.</span>
        </div>
      )}

      {!batch ? (
        <div className="py-16 text-center text-xs text-gray-400">
          <Scale size={28} className="mx-auto mb-2 text-gray-300" />
          Please scan or look up a batch on the left to begin inspection.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Confirmed Weight */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Verified Weight (kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Scale size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="1"
                min="1"
                value={verifiedWeight}
                onChange={(e) => setVerifiedWeight(Number(e.target.value))}
                placeholder="Enter weighed quantity"
                className="w-full rounded-xl border border-gray-300 pl-9 pr-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                required
              />
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">
              Farmer declared: {(batch.weightKg || batch.estWeightKg || 0).toLocaleString()} kg
            </span>
          </div>

          {/* Quality Grade Selector */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Quality Grade <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {GRADE_OPTIONS.map((opt) => {
                const isSelected = qualityGrade === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setQualityGrade(opt.value)}
                    className={[
                      "flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all text-center cursor-pointer",
                      isSelected
                        ? "border-[#226049] bg-emerald-50/70 text-[#226049] font-bold shadow-2xs"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-gray-500 mt-0.5 font-normal leading-tight">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Moisture Content & Urgent Storage Flag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Moisture Content (%)
              </label>
              <div className="relative">
                <Droplets size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={moistureContent}
                  onChange={(e) => setMoistureContent(Number(e.target.value))}
                  placeholder="e.g. 12.5"
                  className="w-full rounded-xl border border-gray-300 pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 rounded-xl border border-gray-200 p-2 text-xs text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={urgentStorageFlag}
                  onChange={(e) => setUrgentStorageFlag(e.target.checked)}
                  className="rounded text-[#226049] focus:ring-[#226049]"
                />
                <span className="flex items-center gap-1 font-semibold text-red-600">
                  <AlertTriangle size={13} />
                  Urgent Storage Flag
                </span>
              </label>
            </div>
          </div>

          {/* Quality Notes */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Quality Inspection Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record tuber condition, cleanliness, harvest age..."
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-700 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#226049] py-3 text-xs font-bold text-white hover:bg-[#1a4336] transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCircle2 size={15} />
            )}
            Confirm Intake &amp; Issue Receipt
          </button>
        </form>
      )}
    </div>
  );
}
