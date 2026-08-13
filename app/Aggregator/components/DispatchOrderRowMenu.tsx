"use client";

import React, { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import type { DispatchOrderRecord } from "./types";

export interface DispatchOrderRowMenuProps {
  order: DispatchOrderRecord;
  onAssignStorage: (order: DispatchOrderRecord) => void;
  onAssignVault: (order: DispatchOrderRecord) => void;
  onViewReceipt: (order: DispatchOrderRecord) => void;
  onViewDetails: (order: DispatchOrderRecord) => void;
}

export default function DispatchOrderRowMenu({
  order,
  onAssignStorage,
  onAssignVault,
  onViewReceipt,
  onViewDetails,
}: DispatchOrderRowMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const items: { label: string; onSelect: () => void }[] = [
    { label: "Assign to Storage", onSelect: () => onAssignStorage(order) },
    { label: "Assign to Vault", onSelect: () => onAssignVault(order) },
    { label: "View Receipt", onSelect: () => onViewReceipt(order) },
    { label: "View Details", onSelect: () => onViewDetails(order) },
  ];

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Row actions"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
      >
        <MoreHorizontal size={18} strokeWidth={1.8} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}