// Checkout — Step 4: Order Confirmation (Thank You screen, order number, delivery address, order summary table, New Arrivals section)
export default function OrderConfirmationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Order Confirmed! 🎉</h1>
        <p className="mt-2 text-sm text-gray-500">Thank you for your order. We&apos;ll be in touch shortly.</p>
      </div>
    </div>
  );
}
