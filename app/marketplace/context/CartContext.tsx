"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { CassavaBatch } from "../components/types";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartEntry {
  id: string;
  batchCode: string;
  title: string;
  grade: string;
  quantity: number;         // number of units (tonnes / bags etc.)
  pricePerTonne: number;
  unit: string;
  currency: string;
  seller: string;
  location: string;
  image?: string;
}

type CartAction =
  | { type: "ADD"; entry: CartEntry }
  | { type: "REMOVE"; id: string }
  | { type: "INCREASE"; id: string }
  | { type: "DECREASE"; id: string }
  | { type: "INIT"; items: CartEntry[] };

// ─── Reducer ──────────────────────────────────────────────────────────────────
function cartReducer(state: CartEntry[], action: CartAction): CartEntry[] {
  switch (action.type) {
    case "INIT":
      return action.items;
    case "ADD": {
      const existing = state.find((i) => i.id === action.entry.id);
      if (existing) {
        return state.map((i) =>
          i.id === action.entry.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...state, action.entry];
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "INCREASE":
      return state.map((i) =>
        i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    case "DECREASE":
      return state.map((i) =>
        i.id === action.id && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface CartContextValue {
  cartItems: CartEntry[];
  totalItems: number;
  subtotal: number;
  logisticsFee: number;
  hasLogistics: boolean;
  setHasLogistics: (enabled: boolean) => void;
  vat: number;
  total: number;
  addToCart: (batch: CassavaBatch) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "yuca_cart_v1";

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, dispatch] = useReducer(cartReducer, []);
  const [hasLogistics, setHasLogistics] = React.useState<boolean>(true);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CartEntry[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dispatch({ type: "INIT", items: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore write errors
    }
  }, [cartItems]);

  const addToCart = useCallback((batch: CassavaBatch) => {
    const entry: CartEntry = {
      id: batch.id,
      batchCode: batch.batchCode,
      title: batch.title,
      grade: batch.grade,
      quantity: 1,
      pricePerTonne: batch.pricePerTonne,
      unit: batch.unit ?? "Tonnes",
      currency: batch.currency ?? "₦",
      seller: batch.seller,
      location: batch.location,
      image: batch.images?.[0],
    };
    dispatch({ type: "ADD", entry });
  }, []);

  const removeFromCart = useCallback(
    (id: string) => dispatch({ type: "REMOVE", id }),
    []
  );
  const increaseQty = useCallback(
    (id: string) => dispatch({ type: "INCREASE", id }),
    []
  );
  const decreaseQty = useCallback(
    (id: string) => dispatch({ type: "DECREASE", id }),
    []
  );

  const totalItems = cartItems.length;
  const subtotal = useMemo(
    () => cartItems.reduce((acc, i) => acc + i.pricePerTonne * i.quantity, 0),
    [cartItems]
  );
  const logisticsFee = useMemo(
    () => Math.round(subtotal * 0.05),
    [subtotal]
  );
  const vat = 0;
  const total = subtotal + (hasLogistics ? logisticsFee : 0) + vat;

  const value: CartContextValue = {
    cartItems,
    totalItems,
    subtotal,
    logisticsFee,
    hasLogistics,
    setHasLogistics,
    vat,
    total,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
