
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#fcfcfc] flex flex-col font-sans text-[#171717] overflow-y-auto">
      <header className="relative z-10 flex items-center justify-between px-8 md:px-10 py-4 w-full max-w-[90rem] mx-auto">
        <div className="flex items-center">
          <img src="/images/Yucachain_Logo.png" className="w-40 h-20 md:h-20" />
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="text-sm font-semibold text-gray-600 hover:bg-[#226049] hover:rounded-full hover:text-white px-5 py-2 transition-colors">
            Home
          </Link>
          <Link href="#" className="text-sm font-semibold text-gray-600 hover:bg-[#226049] hover:rounded-full hover:text-white px-5 py-2 transition-colors">
            About Us
          </Link>
          <Link href="#" className="text-sm font-semibold text-gray-600 hover:bg-[#226049] hover:rounded-full hover:text-white px-5 py-2 transition-colors">
            Our Services
          </Link>
          <Link href="#" className="text-sm font-semibold text-gray-600 hover:bg-[#226049] hover:rounded-full hover:text-white px-5 py-2 transition-colors">
            Contacts
          </Link>
        </nav>

        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/login" className="hidden sm:block text-sm font-semibold text-gray-700 hover:opacity-80 transition-opacity">
            Log In
          </Link>
          <Link href="/register" className="bg-[#215243] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a4336] transition-all shadow-sm">
            Sign up
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-col px-8 md:px-16 py-10 w-full max-w-[90rem] mx-auto flex-grow">
        {/* Top Text Section */}
        <div className="max-w-4xl pt-4">
          <h1 className="text-4xl md:text-[4rem] font-bold tracking-tight text-black leading-[1.1] mb-10">
            Value Proposition For
            <br />
            Industrial Buyers
          </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full mb-10">
          <ul className="flex flex-col gap-4 font-semibold text-black text-base md:text-lg">
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-black rounded-full shadow-[0_0_1px_rgba(0,0,0,0.5)]"></span>
              EU-Backed via FS4Africa
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-black rounded-full shadow-[0_0_1px_rgba(0,0,0,0.5)]"></span>
              Verified Nigerian Cassava Supply
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-black rounded-full shadow-[0_0_1px_rgba(0,0,0,0.5)]"></span>
              ISO-traceable Batches
            </li>
          </ul>

          <Link href="#" className="mt-8 md:mt-0 bg-black text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] hidden md:block">
            Explore Now
          </Link>
        </div>

        {/* Mobile Explore button */}
        <Link href="#" className="bg-black text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-all shadow-lg md:hidden w-fit mb-8">
          Explore Now
        </Link>

        <div className="w-full relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] lg:aspect-[22/8] bg-gray-200 mt-2">
          <img src="/images/hero_farm_image.png" alt="YucaChain Value" className="w-full h-full object-cover" />
        </div>
      </main>
    </div>
  )
}