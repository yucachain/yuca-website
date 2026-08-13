"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { VaultOption } from "./types";

export interface VaultAssignmentSelectorProps {
  vaults: VaultOption[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function VaultAssignmentSelector({
  vaults,
  selectedId,
  onChange,
}: VaultAssignmentSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = vaults.find((v) => v.id === selectedId);

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-900">
        Assign consolidated group
      </p>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-5 py-4 text-left transition-colors hover:bg-gray-50"
        >
          <span>
            <span className="block text-sm font-semibold text-gray-900">
              {selected
                ? `${selected.name} - ${selected.location}`
                : "Select a vault"}
            </span>
            {selected && (
              <span className="block text-sm text-gray-500">
                {selected.availableTonnes} / {selected.capacityTonnes} t
                available
              </span>
            )}
          </span>
          <ChevronDown
            size={18}
            strokeWidth={1.8}
            className={[
              "text-gray-400 transition-transform",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {open && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            {vaults.map((vault) => (
              <button
                key={vault.id}
                type="button"
                onClick={() => {
                  onChange(vault.id);
                  setOpen(false);
                }}
                className={[
                  "flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors",
                  vault.id === selectedId
                    ? "bg-emerald-50"
                    : "hover:bg-gray-50",
                ].join(" ")}
              >
                <span className="text-sm font-semibold text-gray-900">
                  {vault.name} - {vault.location}
                </span>
                <span className="text-xs text-gray-500">
                  {vault.availableTonnes} / {vault.capacityTonnes} t available
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
