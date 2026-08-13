import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-65px)] flex items-center justify-center overflow-hidden bg-[#f0f4ec]">

      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-bottom bg-no-repeat"
        style={{ backgroundImage: "url('/images/Hero-section image.png')" }}
        aria-hidden="true"
      />

      {/* Subtle top gradient overlay to blend image into background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#eef2e8]/60 via-transparent to-transparent" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-3xl mx-auto py-12 sm:py-20">

        {/* Pill Tag */}
        <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#d4e8c2]/80 text-[#2d6a4f] text-xs font-semibold tracking-wide mb-4 sm:mb-6 border border-[#b5d99c]/60">
          Africa &amp; Cassava
        </span>

        {/* Heading */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-[#1a3a2a] leading-[1.2] sm:leading-[1.15] mb-4 sm:mb-5 tracking-tight">
          Connecting Farmers,
          <br className="hidden sm:inline" />{" "}
          Aggregators, Processors &amp; Buyers
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl leading-relaxed mb-8 sm:mb-10">
          Manage production, preserve harvests, access markets, and unlock
          opportunities across the entire cassava value chain with one
          integrated platform.
        </p>

        {/* CTA Button */}
        <Link
          href="/marketplace"
          className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border-2 border-[#1a3a2a] text-[#1a3a2a] bg-white/80 backdrop-blur-sm text-xs sm:text-sm font-semibold hover:bg-[#1a3a2a] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Explore Marketplace
        </Link>

      </div>
    </section>
  );
}