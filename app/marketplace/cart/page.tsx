"use client";

import React, { useEffect, useState } from "react";
import MarketplaceNavbar from "../components/MarketplaceNavbar";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import { useCart } from "../context/CartContext";
import { useAuth } from "@/app/Context/AuthContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Lock, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import Footer from "@/app/components/Footer";
import { cartApi } from "@/app/Services/cartService";
import AuthPromptModal from "../components/AuthPromptModal";
import Link from "next/link";

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
    replaceCart,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const hasToken =
    typeof window !== "undefined" &&
    Boolean(
      localStorage.getItem("accessToken") ||
      localStorage.getItem("yuca_access_token") ||
      localStorage.getItem("token")
    );

  const isUserAuthenticated = isAuthenticated || hasToken;

  useEffect(() => {
    if (!isUserAuthenticated) {
      setShowAuthModal(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCart = async () => {
      try {
        setLoading(true);

        const localCart = (() => {
          try {
            const raw = localStorage.getItem("yuca_cart_v1");
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })();

        const cart = await cartApi.getCart();
        if (cancelled) return;

        if (cart?.items?.length) {
          replaceCart(
            cart.items.map((item) => ({
              ...item,
              unit: item.unit || "Tonnes",
              currency: item.currency || "₦",
              pricePerTonne: item.pricePerTonne || item.price || 0,
              quantity: item.quantity || 1,
            }))
          );
          return;
        }

        if (localCart.length > 0) {
          replaceCart(localCart);
          return;
        }

        replaceCart([]);
      } catch (err: any) {
        if (!cancelled) {
          if (!String(err?.message || "").includes("401")) {
            console.error("Failed to load cart:", err);
          }

          const fallbackCart = (() => {
            try {
              const raw = localStorage.getItem("yuca_cart_v1");
              const parsed = raw ? JSON.parse(raw) : [];
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })();

          if (fallbackCart.length > 0) {
            replaceCart(fallbackCart);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCart();

    return () => {
      cancelled = true;
    };
  }, [isUserAuthenticated, replaceCart]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <MarketplaceNavbar
        cartCount={totalItems}
        onCartClick={() => {
          if (!isUserAuthenticated) {
            setShowAuthModal(true);
          } else {
            router.push("/marketplace/cart");
          }
        }}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {isUserAuthenticated
              ? `${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart`
              : "Authentication required to view your cart"}
          </p>

          {!isUserAuthenticated ? (
            /* Protected unauthenticated state — user does not see the cart page */
            <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white p-8 sm:p-12 text-center shadow-xs max-w-xl mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 mb-4 shadow-2xs">
                <Lock size={32} strokeWidth={2} />
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                Please Sign In to View Your Cart
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-md leading-relaxed">
                You must have an active YucaChain account to view your cart, add products, and checkout. Please sign in or register as a new user to continue.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/login?redirect=/marketplace/cart"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#226049] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#1a4336] transition-all w-full sm:w-auto"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </Link>

                <Link
                  href="/register?redirect=/marketplace/cart"
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-100 transition-all w-full sm:w-auto"
                >
                  <UserPlus size={16} className="text-gray-600" />
                  <span>Register as New User</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => router.push("/marketplace")}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Return to Marketplace</span>
              </button>
            </div>
          ) : (
            <>
              {loading && cartItems.length === 0 && (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
                  Loading your cart...
                </div>
              )}

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
                      className="mt-4 text-xs text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <ArrowLeft size={13} />
                      <span>Continue shopping</span>
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
            </>
          )}
        </main>

        <Footer />
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          if (!isUserAuthenticated) {
            router.push("/marketplace");
          }
        }}
        title="Sign In Required"
        message="You need to sign in or register as a new user to access your cart and place orders."
        redirectUrl="/marketplace/cart"
      />
    </div>
  );
}