

export interface ReviewSectionProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export default function ReviewSection({
  title,
  actionLabel,
  onAction,
  children,
}: ReviewSectionProps) {
  return (
    <div className="rounded-2xl bg-gray-50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="rounded-lg bg-[#215243] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1a4336]"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}