
"use client";

import React from "react";
import MarketplaceNavbar from "../components/MarketplaceNavbar";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import Footer from "@/app/components/Footer";

export default function CartPage() {
  const {
    cartItems,
    totalItems,
    subtotal,
    vat,
    total,
    increaseQty,
    decreaseQty,
    removeFromCart,
  } = useCart();

  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <MarketplaceNavbar
        cartCount={totalItems}
        onCartClick={() => router.push("/marketplace/cart")}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-6 py-6 min-w-0">

          <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px]">

            <div>
              <div className="hidden sm:grid grid-cols-[2.5fr_1fr_1fr_1fr] gap-4 rounded-t-xl bg-[#0B6B46] px-6 py-4 text-white">
                <span className="text-xs font-semibold">Items ({totalItems})</span>
                <span className="text-center text-xs font-semibold">Quantity</span>
                <span className="text-center text-xs font-semibold">Price</span>
                <span className="text-right text-xs font-semibold">Subtotal</span>
              </div>

              <div className="rounded-b-xl border border-t-0 border-gray-100 bg-white shadow-sm">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400">
                    <ShoppingCart size={48} strokeWidth={1} className="text-gray-200" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500">Your cart is empty</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Browse the marketplace and add products
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/marketplace")}
                      className="mt-2 rounded-xl bg-[#0B6B46] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#09573A] transition-colors"
                    >
                      Go to Marketplace
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onIncrease={increaseQty}
                      onDecrease={decreaseQty}
                      onRemove={removeFromCart}
                    />
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => router.push("/marketplace")}
                  className="mt-4 text-xs text-emerald-700 hover:underline font-medium"
                >
                  ← Continue shopping
                </button>
              )}
            </div>
            <div>
              <CartSummary
                totalItems={totalItems}
                subtotal={subtotal}
                vat={vat}
                total={total}
              />
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}