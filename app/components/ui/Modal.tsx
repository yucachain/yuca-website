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
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/40 px-3 py-4 sm:px-4 sm:py-10 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={[
          "relative w-full max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-2xl",
          maxWidthClassName,
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 sm:right-5 sm:top-5 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={20} strokeWidth={2} />
        </button>
        {children}
      </div>
    </div>
  );
}