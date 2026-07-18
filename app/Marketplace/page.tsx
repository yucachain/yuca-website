// Marketplace listing page — Raw Cassava Batches (default category)
"use client";

import { useMemo, useState } from "react";

import MarketplaceNavbar from "./components/MarketplaceNavbar";
import MarketplaceSidebar from "./components/MarketplaceSidebar";
import FilterPanel from "./components/FilterPanel";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";

interface CartProduct {
  id: number;
  image: string;
  name: string;
  quantity: number;
  price: number;
}

const initialCart: CartProduct[] = [
  {
    id: 1,
    image: "/images/product1.png",
    name: "TME 419 Stem",
    quantity: 4,
    price: 105,
  },
  {
    id: 2,
    image: "/images/product2.png",
    name: "Fresh Cassava",
    quantity: 2,
    price: 200,
  },
  {
    id: 3,
    image: "/images/product3.png",
    name: "Cassava Roots",
    quantity: 5,
    price: 100,
  },
  {
    id: 4,
    image: "/images/product4.png",
    name: " Quality Cassava",
    quantity: 1,
    price: 500,
  },
  
];

export default function CartPage() {
  const [cart, setCart] = useState(initialCart);

  const increaseQuantity = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
    );
  };
    const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cart]);

  const vat = useMemo(() => {
    return subtotal * 0.075;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + vat;
  }, [subtotal, vat]);

  return (
    <>
      <MarketplaceNavbar />

      <div className="flex min-h-screen bg-[#F9FAFB]">

        <MarketplaceSidebar />

        <main className="flex-1 p-8">

          <FilterPanel />

          <div className="mt-8 grid gap-8 lg:grid-cols-3">

            {/* Left Section */}

            <div className="lg:col-span-2">

              {/* Cart Header */}

              <div className="grid grid-cols-4 rounded-xl bg-[#0B6B46] px-8 py-5 text-white">

                <h3 className="font-semibold">
                  Items ({cart.length})
                </h3>

                <h3 className="text-center font-semibold">
                  Quantity
                </h3>

                <h3 className="text-center font-semibold">
                  Price
                </h3>

                <h3 className="text-right font-semibold">
                  Subtotal
                </h3>

              </div>

              <div className="rounded-b-xl border border-t-0 border-gray-200 bg-white">

                {/* Cart Items will go here */}
                                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    image={item.image}
                    name={item.name}
                    quantity={item.quantity}
                    price={item.price}
                    subtotal={item.price * item.quantity}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                  />
                ))}

              </div>

            </div>

            {/* Right Section */}

            <div>

              <CartSummary
                totalItems={cart.length}
                subtotal={subtotal}
                vat={vat}
                total={total}
              />

            </div>

          </div>

        </main>

      </div>

    </>
  );
}