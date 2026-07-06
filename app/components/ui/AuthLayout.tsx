import React from "react";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen font-sans flex-col  bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)]">
     
      <main className="flex flex-1 items-center justify-center px-4 py-16 lg:py-24">
        {children}
      </main>

    
    </div>
  );
}