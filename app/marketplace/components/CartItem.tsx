
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
    <div className="flex flex-col sm:grid sm:grid-cols-[2.5fr_1fr_1fr_1fr] items-start sm:items-center gap-4 border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5 last:border-0 hover:bg-gray-50/50 transition-colors">

      <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
        <div className="flex-shrink-0 w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl sm:text-2xl font-bold text-emerald-300 select-none">
              {item.title.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
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

      <div className="flex items-center justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
        <span className="sm:hidden text-xs text-gray-500 font-medium">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onDecrease(item.id)}
            disabled={item.quantity <= 1}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-center w-full sm:w-auto">
        <span className="sm:hidden text-xs text-gray-500 font-medium">Price</span>
        <div className="text-right sm:text-center">
          <span className="text-sm font-semibold text-gray-700">
            {item.currency}{item.pricePerTonne.toLocaleString()}
          </span>
          <p className="text-[9px] text-gray-400">per {item.unit}</p>
        </div>
      </div>

      {/* Column 4: Subtotal */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        <span className="sm:hidden text-xs font-semibold text-gray-900">Subtotal</span>
        <span className="text-sm font-bold text-emerald-800 sm:text-gray-900">
          {item.currency}{subtotal.toLocaleString()}
        </span>
      </div>
    </div>
  );
}