// CartSummary — right-side summary card showing: Items subtotal, VAT, Total, and Checkout button
interface CartSummaryProps {
  totalItems: number;
  subtotal: number;
  vat: number;
  total: number;
}

export default function CartSummary({
  totalItems,
  subtotal,
  vat,
  total,
}: CartSummaryProps) {
  return (
    <div className="sticky top-24 w-full rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">

      {/* Heading */}
      <h2 className="mb-6 text-2xl font-semibold text-[#111827]">
        Summary
      </h2>

      {/* Items */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[#6B7280]">
          Items ({totalItems})
        </p>

        <p className="font-medium text-[#111827]">
          ₦{subtotal.toLocaleString()}
        </p>
      </div>

      {/* VAT */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[#6B7280]">
          VAT
        </p>

        <p className="font-medium text-[#111827]">
          ₦{vat.toLocaleString()}
        </p>
      </div>

      <hr className="my-5 border-[#E5E7EB]" />

      {/* Total */}
      <div className="mb-8 flex items-center justify-between">
        <p className="text-lg font-semibold text-[#111827]">
          Total
        </p>

        <p className="text-xl font-bold text-[#111827]">
          ₦{total.toLocaleString()}
        </p>
      </div>

      {/* Checkout Button */}
      <button
        className="w-full rounded-xl bg-[#0B6B46] py-4 text-base font-semibold text-white transition hover:bg-[#09573A]"
      >
         Checkout
      </button>

    </div>
  );
}