import {
  Users,
  ShoppingBasket,
  Landmark,
  Handshake,
} from "lucide-react";

const trustedItems = [
  {
    icon: Users,
    title: "Farmers",
  },
  {
    icon: ShoppingBasket,
    title: "Processors & Buyers",
  },
  {
    icon: Landmark,
    title: "Financial Institutions",
  },
];

export default function Trusted() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-black">
          Trusted By The Cassava Ecosystem
        </h2>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto justify-items-center">
          {trustedItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="w-full max-w-[220px] h-48 bg-white border border-gray-200
                rounded-2xl shadow-sm flex flex-col items-center pt-6 pb-6 text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(34, 96, 73, 0.2)" }}>
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: "#226049" }} />
                </div>

                <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-800 px-2">
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}