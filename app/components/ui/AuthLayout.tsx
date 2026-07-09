import React from "react";
import Navbar from "../Navbar";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen font-sans flex-col bg-[linear-gradient(to_bottom,#f8f9f8_50%,#ffffff_50%)]">
     <Navbar/>
      <main className="flex flex-1 items-center justify-center px-4 py-16 lg:py-24">
        {children}
      </main>

    
    </div>
  );
}