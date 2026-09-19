import React from "react";

export const metadata = {
  title: "Partner Access | YucaChain",
  description: "Secure partner portal access.",
  robots: { index: false, follow: false },
};

export default function PartnerAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(to bottom, #f0f5f2 0%, #e8f0eb 50%, #f0f5f2 100%)",
      }}
    >
      {children}
    </div>
  );
}
