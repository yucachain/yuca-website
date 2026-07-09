import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen font-sans flex-col"
      style={{
        background: "linear-gradient(to bottom, #f0f5f2 100%, rgba(34,96,73,0.5) 70%, #f0f5f2 100%)",
      }}
    >
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16 lg:py-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}