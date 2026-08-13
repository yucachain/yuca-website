import type { QuickAction } from "./types";

export default function QuickActions({
  actions,
  onSelect,
}: {
  actions: QuickAction[];
  onSelect?: (action: QuickAction) => void;
}) {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-900">
        Quick Actions
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect?.(action)}
            className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-all hover:border-[#226049]/20 hover:bg-[#226049]/5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-[#226049]/10 group-hover:text-[#226049]">
              {action.icon}
            </span>
            <span className="text-xs font-semibold text-gray-700 transition-colors group-hover:text-[#226049]">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
