// CartItem — single row in the cart table. Matches the reference image:
// [Image + Name/Seller + Remove] | [Qty stepper] | [Price] | [Subtotal]
"use client";

import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartEntry } from "../context/CartContext";

interface CartItemProps {
  item: CartEntry;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  const subtotal = item.pricePerTonne * item.quantity;

  return (
    <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr] items-center gap-4 border-b border-gray-100 px-6 py-5 last:border-0 hover:bg-gray-50/50 transition-colors">

      {/* Column 1: Product info */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Image or placeholder */}
        <div className="flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-emerald-300 select-none">
              {item.title.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
          <p className="mt-0.5 text-xs text-gray-400">{item.seller}</p>
          <p className="text-xs text-gray-400">{item.location}</p>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="mt-2 inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-medium text-red-500 hover:bg-red-100 hover:border-red-200 transition-colors"
          >
            <Trash2 size={10} strokeWidth={2} />
            Remove
          </button>
        </div>
      </div>

      {/* Column 2: Quantity stepper */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onDecrease(item.id)}
          disabled={item.quantity <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus size={12} strokeWidth={2.5} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-gray-900">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onIncrease(item.id)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* Column 3: Unit price */}
      <div className="text-center">
        <span className="text-sm font-semibold text-gray-700">
          {item.currency}{item.pricePerTonne.toLocaleString()}
        </span>
        <p className="text-[9px] text-gray-400 mt-0.5">per {item.unit}</p>
      </div>

      {/* Column 4: Subtotal */}
      <div className="text-right">
        <span className="text-sm font-bold text-gray-900">
          {item.currency}{subtotal.toLocaleString()}
        </span>
      </div>
    </div>
  );
}