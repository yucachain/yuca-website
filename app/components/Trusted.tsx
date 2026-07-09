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
    title: "Aggregators",
  },
  {
    icon: Landmark,
    title: "Financial Institutions",
  },
];

export default function Trusted() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-center text-3xl font-bold text-black">
          Trusted By The Cassava Ecosystem
        </h2>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          {trustedItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="w-52 h-48 bg-white border border-gray-200
                rounded-2xl shadow-sm flex flex-col items-center pt-6 pb-6 text-center"
              >
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(34, 96, 73, 0.2)" }}>
                  <Icon className="w-8 h-8" style={{ color: "#226049" }} />
                </div>

                <h3 className="mt-5 text-lg font-medium text-gray-800">
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