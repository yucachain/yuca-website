import Image from "next/image";

export default function TradeCassava() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="overflow-hidden rounded-3xl shadow-lg">
          <Image
            src="/images/trade-cassava.png"
            alt="Trade Cassava With Confidence"
            width={1621}
            height={450}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}