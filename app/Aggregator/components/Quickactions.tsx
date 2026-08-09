import type { QuickAction } from "./types";

export default function QuickActions({
  actions,
  onSelect,
}: {
  actions: QuickAction[];
  onSelect?: (action: QuickAction) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect?.(action)}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 py-6 text-center transition-colors hover:border-emerald-700 hover:bg-emerald-50/40"
          >
            <span className="text-gray-700">{action.icon}</span>
            <span className="text-sm font-medium text-gray-800">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
