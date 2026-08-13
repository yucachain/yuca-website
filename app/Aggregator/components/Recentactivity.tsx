import React from "react";
import type { ActivityItem } from "./types";

export default function RecentActivity({
  items,
  onViewAll,
}: {
  items: ActivityItem[];
  onViewAll?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-medium text-emerald-800 hover:underline"
        >
          View all
        </button>
      </div>

      <div className="mt-4 divide-y divide-gray-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 py-3.5"
          >
            <p className="text-sm text-gray-800">{item.description}</p>
            <span className="shrink-0 text-xs text-gray-400">{item.time}</span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-3.5 text-sm text-gray-500">No recent activity.</p>
        )}
      </div>
    </div>
  );
}
