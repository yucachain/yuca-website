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
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
            Everything You Need In One Platform
          </h2>

          <div className="w-20 h-1 bg-[#226049] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center
                  transition-all duration-300 ease-out
                  hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl hover:border-[#226049]/30 cursor-pointer"
              >
                {/* Circle Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EAF8FB] flex items-center justify-center mb-5 sm:mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Icon
                    className={feature.color}
                    size={28}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 leading-relaxed text-xs sm:text-sm">
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