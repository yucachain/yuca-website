
import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="relative min-h-screen w-full bg-[#f8f9f8] overflow-hidden flex flex-col font-sans text-[#171717]">
            {/* Background Soft Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_#d9ead9_0%,_transparent_60%)] pointer-events-none" />
            <main className="relative z-10 flex flex-col items-center justify-center gap-10 text-center h-screen">
                <h1 className="text-xl md:text-3xl font-bold tracking-tight opacity-50">
                    OOPS! Page Not Found
                </h1>
                <img src="/images/Yucachain_Logo.png" className="w-80 opacity-50" />
                {/* Return Button */}
                <Link
                    href="/"
                    className="w-full max-w-[320px] md:max-w-[500px] bg-[#215243] text-white py-4 rounded-xl text-lg font-semibold hover:bg-[#1a4336] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                >
                    Back To Homepage
                </Link>
            </main>
        </div>
    );
}
