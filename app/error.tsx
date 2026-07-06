"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
        <div className="relative min-h-screen w-full bg-[#f8f9f8] overflow-hidden flex flex-col font-sans text-[#171717]">
            {/* Background Soft Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)] pointer-events-none" />
            
            <main className="relative z-10 flex flex-col items-center justify-center gap-8 text-center h-screen px-4">
                <div className="flex flex-col gap-2 items-center">
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight opacity-60">
                        OOPS! Something Went Wrong
                    </h1>
                    <p className="text-gray-600 font-medium md:text-lg opacity-80 max-w-md">
                        We encountered an unexpected error or a network interruption. Please check your connection and try again.
                    </p>
                </div>
                
                <img src="/images/Yucachain_Logo.png" className="w-56 md:w-80 opacity-50 my-2" alt="YucaChain Logo" />
                
                <div className="flex flex-col gap-4 w-full items-center">
                    <button
                        onClick={() => reset()}
                        className="w-full max-w-[320px] md:max-w-[400px] bg-[#215243] text-white py-4 rounded-xl text-lg font-semibold hover:bg-[#1a4336] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                    >
                        Try Again
                    </button>
                    
                    <Link
                        href="/"
                        className="w-full max-w-[320px] md:max-w-[400px] bg-gray-200 text-[#215243] py-4 rounded-xl text-lg font-semibold hover:bg-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                    >
                        Back To Homepage
                    </Link>
                </div>
            </main>
        </div>
  );
}
