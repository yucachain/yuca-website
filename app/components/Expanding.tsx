import Image from "next/image";

export default function Expanding() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#243B6B]">
            Expanding The YucaChain Ecosystem
          </h2>

          <div className="w-20 h-1 bg-cyan-400 rounded-full mx-auto mt-4"></div>
        </div>

        {/* Ecosystem Image */}
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="/images/ecosystem.png"
            alt="YucaChain Ecosystem"
            width={1621}
            height={253}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}