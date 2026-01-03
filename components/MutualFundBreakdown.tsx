"use client";

import { AllocationCard } from "@/components/AllocationCard";
import { PercentageEditor, type PercentageEditorItem } from "@/components/PercentageEditor";
import { formatPaiseINR, sum, type Paise } from "@/lib/money";

type Node = {
  id: string;
  label: string;
  percent: number;
  paise: Paise;
  color?: string;
};

type Props<Id extends string> = {
  mutualFundsTotalPaise: Paise;
  nodes: Node[];
  values: Record<Id, number>;
  items: PercentageEditorItem<Id>[];
  onChange: (next: Record<Id, number>) => void;
  currencySymbol?: string;
};

export function MutualFundBreakdown<Id extends string>({
  mutualFundsTotalPaise,
  nodes,
  values,
  items,
  onChange,
  currencySymbol,
}: Props<Id>) {
  const totalPct = sum(Object.values(values));
  const error = totalPct === 100 ? null : `These numbers must add up to 100%. Current total: ${totalPct}%.`;

  const fmtPct = (p: number) => (Number.isInteger(p) ? `${p}%` : `${p.toFixed(1)}%`);

  return (
    <div className="space-y-4">
      <PercentageEditor
        title="Mutual fund split"
        description="This further splits only the Mutual Funds amount (not your whole salary)."
        items={items}
        values={values}
        onChange={onChange}
        error={error}
      />

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">Visual breakdown</div>
        <div className="mt-1 text-sm text-zinc-600">
          Total for mutual funds: {formatPaiseINR(mutualFundsTotalPaise, currencySymbol)}
        </div>

        <div className="mt-4 space-y-3">
          {nodes.map((n) => (
            <div key={n.id} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {n.color ? (
                    <span className="shrink-0 text-[10px] leading-none" style={{ color: n.color }}>
                      ●
                    </span>
                  ) : null}
                  <div className="min-w-0 truncate text-sm font-medium text-zinc-900">{n.label}</div>
                </div>
                <div className="shrink-0 text-sm text-zinc-700">
                  {fmtPct(n.percent)} ({formatPaiseINR(n.paise, currencySymbol)})
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${n.percent}%`, backgroundColor: n.color ?? "#2563eb" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {nodes.map((n) => (
          <AllocationCard
            key={n.id}
            label={n.label}
            percent={n.percent}
            paise={n.paise}
            currencySymbol={currencySymbol}
            color={n.color}
          />
        ))}
      </div>
    </div>
  );
}
