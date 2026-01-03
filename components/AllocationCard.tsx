import { formatPaiseINR, type Paise } from "@/lib/money";

type Props = {
  label: string;
  percent: number;
  paise: Paise;
  currencySymbol?: string;
  color?: string;
};

export function AllocationCard({ label, percent, paise, currencySymbol, color }: Props) {
  const percentLabel = Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(1)}%`;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {color ? (
              <span className="shrink-0 text-[10px] leading-none" style={{ color }}>
                ●
              </span>
            ) : null}
            <div className="truncate text-sm font-medium text-zinc-900">{label}</div>
          </div>
          <div className="mt-1 text-xs text-zinc-600">{percentLabel}</div>
        </div>
        <div className="shrink-0 text-sm font-semibold text-zinc-900">
          {formatPaiseINR(paise, currencySymbol)}
        </div>
      </div>
    </div>
  );
}
