import React from "react";
import Navbar from "../Navbar";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen font-sans flex-col  bg-[#f8f9f8]">
     <Navbar/>
      <main className="flex flex-1 items-center justify-center px-4 py-16 lg:py-24">
        {children}
      </main>

    
    </div>
  );
}