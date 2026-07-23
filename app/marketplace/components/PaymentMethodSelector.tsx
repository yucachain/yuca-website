import React from "react";
import { CreditCard, Landmark, Wallet } from "lucide-react";

export type PaymentMethodId = "card" | "bank-transfer" | "yuca-wallet";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "card",
    label: "Card Payment",
    description: "Pay securely with your credit or debit card",
    icon: <CreditCard size={20} strokeWidth={1.7} />,
  },
  {
    id: "bank-transfer",
    label: "Bank Transfer",
    description: "Make payment directly to our Yucachain Account",
    icon: <Landmark size={20} strokeWidth={1.7} />,
  },
  {
    id: "yuca-wallet",
    label: "Yuca Wallet (coming soon)",
    description: "Pay with your Yuca wallet balance",
    icon: <Wallet size={20} strokeWidth={1.7} />,
    disabled: true,
  },
];

export interface PaymentMethodSelectorProps {
  value: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
  options?: PaymentMethodOption[];
}

export default function PaymentMethodSelector({
  value,
  onChange,
  options = PAYMENT_METHODS,
}: PaymentMethodSelectorProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Select a payment method</h2>
      <p className="mt-1 text-sm text-gray-500">
        Choose your preferred payment method for your order.
      </p>

      <div className="mt-6 space-y-4">
        {options.map((option) => {
          const isSelected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              disabled={option.disabled}
              onClick={() => onChange(option.id)}
              className={[
                "flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-colors",
                isSelected ? "border-emerald-800 bg-emerald-50/60" : "border-gray-200 bg-white",
                option.disabled ? "cursor-not-allowed opacity-50" : "hover:border-gray-300",
              ].join(" ")}
            >
              <span className="flex items-center gap-3">
                <span className="text-gray-700">{option.icon}</span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    {option.label}
                  </span>
                  <span className="block text-xs text-gray-500">{option.description}</span>
                </span>
              </span>

              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  isSelected ? "border-emerald-800" : "border-gray-300",
                ].join(" ")}
              >
                {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-emerald-800" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}