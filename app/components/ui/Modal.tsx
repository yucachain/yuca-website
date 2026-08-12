"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Tailwind max-width class for the dialog, e.g. "max-w-3xl" */
  maxWidthClassName?: string;
}

export default function Modal({ open, onClose, children, maxWidthClassName = "max-w-2xl" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-10"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={[
          "relative w-full rounded-3xl bg-white p-6 shadow-2xl sm:p-8",
          maxWidthClassName,
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-gray-500 transition-colors hover:text-gray-900"
        >
          <X size={22} strokeWidth={2} />
        </button>
        {children}
      </div>
    </div>
  );
}