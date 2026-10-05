import React from "react";

export default function AuthCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-sm sm:max-w-md rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-emerald-900/10 ${className}`}
      style={{
        background: "linear-gradient(to bottom, #ffffff 0%, #f0f5f2 100%)",
      }}
    >
      {title && (
        <h1 className="mb-6 text-center text-xl sm:text-2xl font-bold text-gray-900">
          {title}
        </h1>
      )}
      {children}
    </div>
  );
}
