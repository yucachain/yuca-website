"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ShoppingCart,
  Users,
  BarChart3,
  PlusSquare,
  FolderPlus,
  Eye,
} from "lucide-react";

const menuItems = [
  {
    name: "Overview",
    href: "/aggregator",
    icon: LayoutDashboard,
    active: true,
  },
  {
    name: "Batches",
    href: "/aggregator/batches",
    icon: Package,
  },
  {
    name: "Storage",
    href: "/aggregator/storage",
    icon: Warehouse,
  },
  {
    name: "Transfers & Dispatch",
    href: "/aggregator/transfers",
    icon: Truck,
  },
  {
    name: "Orders",
    href: "/aggregator/orders",
    icon: ShoppingCart,
  },
  {
    name: "Buyers & Sellers",
    href: "/aggregator/buyers",
    icon: Users,
  },
  {
    name: "Reports & Analytics",
    href: "/aggregator/reports",
    icon: BarChart3,
  },
];

const quickActions = [
  {
    name: "Create Aggregation",
    href: "/aggregator/create",
    icon: PlusSquare,
  },
  {
    name: "Assign Storage",
    href: "/aggregator/storage/assign",
    icon: FolderPlus,
  },
  {
    name: "View all Batches",
    href: "/aggregator/batches",
    icon: Eye,
  },
];

export default function AggregatorSidebar() {
  return (
    <aside className="w-72 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-8 py-8">
        <h1 className="text-2xl font-bold text-[#0F6B4F]">
          YucaChain
        </h1>
      </div>

      
      <nav className="px-4 flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  item.active
                    ? "bg-gray-100 text-[#0F6B4F] font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-[#226049]">
            Quick Actions
          </h2>

          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  <Icon size={18} />
                  <span>{action.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}