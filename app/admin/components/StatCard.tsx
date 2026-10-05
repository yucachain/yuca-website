
import type { StatCardData } from "./types";

export default function StatCard({ data }: { data: StatCardData }) {
  const isUp = data.trendDirection === "up";
  const hasTrendPercent = typeof data.trendPercent === "number";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          {data.icon}
        </span>
        <p className="text-sm font-medium text-gray-500">{data.label}</p>
      </div>

      <p className="mt-3 text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
        {data.value}
      </p>

      {hasTrendPercent ? (
        <p
          className={[
            "mt-1 text-xs font-semibold",
            isUp ? "text-emerald-600" : "text-red-500",
          ].join(" ")}
        >
          {isUp ? "↑" : "↓"} {data.trendPercent}% {data.trendLabel}
        </p>
      ) : data.trendLabel ? (
        <p className="mt-1 text-xs text-gray-400">
          {data.trendLabel}
        </p>
      ) : null}
    </div>
  );
}
