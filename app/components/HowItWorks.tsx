import Image from "next/image";

export default function HowItWorks() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
            How It Works
          </h2>

          <div className="w-20 h-1 bg-[#226049] rounded-full mx-auto mt-4"></div>
        </div>

        {/* Image */}
        <div className="overflow-x-auto touch-scroll rounded-2xl sm:rounded-3xl bg-emerald-900/5">
          <div className="min-w-[600px] sm:min-w-full">
            <Image
              src="/images/how-it-works.png"
              alt="How It Works"
              width={1621}
              height={222}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}