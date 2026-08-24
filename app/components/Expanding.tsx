import Image from "next/image";

export default function Expanding() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
            Expanding The YucaChain Ecosystem
          </h2>

          <div className="w-20 h-1 bg-[#226049] rounded-full mx-auto mt-4"></div>
        </div>


        <div className="overflow-x-auto touch-scroll rounded-2xl shadow-lg bg-emerald-900/5">
          <div className="min-w-[600px] sm:min-w-full">
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
      </div>
    </section>
  );
}