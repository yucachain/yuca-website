//  CartItimport Image from "next/image";
"use client";
import Image from "next/image";
interface CartItemProps {
  id: number;
  image: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
}

export default function CartItem({
  id,
  image,
  name,
  quantity,
  price,
  subtotal,
  onIncrease,
  onDecrease,
}: CartItemProps) {
  return (
    <div className="grid grid-cols-[2.8fr_1fr_1fr_1fr] items-center border-b border-gray-200 py-6">

      {/* Product */}
      <div className="flex items-center gap-4">
        <Image
          src={image}
          alt={name}
          width={78}
          height={78}
          className="rounded-md object-cover"
        />

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {name}
          </h3>

          <p className="text-sm text-gray-500">
            Drevo farms
          </p>

          <p className="text-sm text-gray-500">
            Top Farmers Ltd.
          </p>

          <button className="mt-2 rounded-md border border-red-200 px-3 py-1 text-xs text-red-500">
            🗑 Remove
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={() => onDecrease(id)}
          className="text-3xl font-bold"
        >
          −
        </button>

        <span className="text-2xl font-semibold">
          {quantity}
        </span>

        <button
          onClick={() => onIncrease(id)}
          className="text-3xl font-bold"
        >
          +
        </button>
      </div>

      {/* Price */}
      <div className="text-center text-lg font-semibold">
        ₦{price.toLocaleString()}
      </div>

      {/* Subtotal */}
      <div className="text-center text-lg font-semibold">
        ₦{subtotal.toLocaleString()}
      </div>
    </div>
  );
}