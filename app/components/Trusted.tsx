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
    title: "Farmers",
  },
  {
    icon: Handshake,
    title: "Developing Partners",
  },
];

export default function Trusted() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">
          Trusted By The Cassava Ecosystem
        </h2>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          {trustedItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="w-52 h-48 bg-white border border-gray-200
                rounded-2xl shadow-sm flex flex-col items-center pt-6 pb-6 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[#EAF8F7] border border-[#D5F2EF] flex items-center justify-center">
                  <Icon className="w-8 h-8 text-teal-600" />
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