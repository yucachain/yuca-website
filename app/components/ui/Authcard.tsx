import React from "react";

export default function AuthCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] sm:p-8">
      {title && (
        <h1 className="mb-6 text-center text-xl font-medium text-gray-900">{title}</h1>
      )}
      {children}
    </div>
  );
}