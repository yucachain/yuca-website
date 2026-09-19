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
import { cartApi } from "@/app/Services/cartService";

export interface CartEntry {
  id: string;
  batchCode: string;
  title: string;
  grade: string;
  quantity: number;
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
  replaceCart: (items: CartEntry[]) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "yuca_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, dispatch] = useReducer(cartReducer, []);
  const [hasLogistics, setHasLogistics] = React.useState<boolean>(true);

  // Hydrate cart from localStorage first, then sync with live server Cart API
  useEffect(() => {
    let cancelled = false;

    const hydrateCart = async () => {
      // 1. Instant local restore
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: CartEntry[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            dispatch({ type: "INIT", items: parsed });
          }
        }
      } catch {}

      // 2. Fetch server cart
      try {
        const serverCart = await cartApi.getCart();
        if (cancelled) return;
        if (serverCart?.items && serverCart.items.length > 0) {
          const formatted: CartEntry[] = serverCart.items.map((i: any) => ({
            id: i.id || i.listingId || `cart-${Math.random()}`,
            batchCode: i.batchCode || `BCH-${i.id?.slice(0, 6) || "2026"}`,
            title: i.title || i.productName || "Cassava Produce",
            grade: i.grade || "A",
            quantity: Number(i.quantity) || 1,
            pricePerTonne: Number(i.pricePerTonne ?? i.price ?? 0),
            unit: i.unit || i.unitOfMeasure || "Tonnes",
            currency: i.currency || "₦",
            seller: i.seller || i.sellerName || "Verified Seller",
            location: i.location || "Nigeria",
            image: i.image || i.imageUrl || i.photoUrls?.[0] || "/images/batches/Batch1.png",
          }));
          dispatch({ type: "INIT", items: formatted });
        }
      } catch {
        // If unauthenticated or guest, keep local cart without interruption
      }
    };

    hydrateCart();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {}
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

    // Sync to backend API in background
    cartApi
      .addItem({
        id: batch.id,
        listingId: batch.id,
        quantity: 1,
        title: batch.title,
        pricePerTonne: batch.pricePerTonne,
      })
      .catch(() => {
        // Operates in guest/offline mode without breaking UX
      });
  }, []);

  const replaceCart = useCallback(
    (items: CartEntry[]) => dispatch({ type: "INIT", items }),
    []
  );

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });

    // Sync removal to backend API
    cartApi.removeItem(id).catch(() => {
      // Guest/offline mode
    });
  }, []);

  const increaseQty = useCallback(
    (id: string) => {
      const item = cartItems.find((i) => i.id === id);
      const newQty = (item?.quantity ?? 1) + 1;
      dispatch({ type: "INCREASE", id });

      cartApi.updateItemQuantity(id, { quantity: newQty }).catch(() => {});
    },
    [cartItems]
  );

  const decreaseQty = useCallback(
    (id: string) => {
      const item = cartItems.find((i) => i.id === id);
      if (!item || item.quantity <= 1) return;
      const newQty = item.quantity - 1;
      dispatch({ type: "DECREASE", id });

      cartApi.updateItemQuantity(id, { quantity: newQty }).catch(() => {});
    },
    [cartItems]
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
    replaceCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
