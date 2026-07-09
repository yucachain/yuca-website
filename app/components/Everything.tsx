import {
  Store,
  Archive,
  Sprout,
  Truck,
} from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Digital Marketplace",
    description:
      "Connect directly with verified buyers, sellers, and processors.",
    color: "text-blue-600",
  },
  {
    icon: Archive,
    title: "YucaVault Storage",
    description:
      "Preserve harvest quality and reduce post-harvest losses with smart storage solutions.",
    color: "text-purple-500",
  },
  {
    icon: Sprout,
    title: "Smart Farm Management",
    description:
      "Plan, monitor and manage cassava production with technology insights.",
    color: "text-pink-500",
  },
  {
    icon: Truck,
    title: "Supply Chain Tracking",
    description:
      "Track product movement from farm to processing and export.",
    color: "text-green-500",
  },
];

export default function Everything() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#243B6B]">
            Everything You Need In One Platform
          </h2>

          <div className="w-20 h-1 bg-cyan-400 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition duration-300"
              >
                {/* Circle Icon */}
                <div className="w-16 h-16 rounded-full bg-[#EAF8FB] flex items-center justify-center mb-6">
                  <Icon
                    className={feature.color}
                    size={30}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[#243B6B] mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 leading-7 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}