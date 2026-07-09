import Image from "next/image";

export default function HowItWorks() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black">
            How It Works
          </h2>

          <div className="w-20 h-1 bg-[#226049] rounded-full mx-auto mt-4"></div>
        </div>

        {/* Image */}
        <div className="overflow-hidden rounded-3xl">
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
    </section>
  );
}