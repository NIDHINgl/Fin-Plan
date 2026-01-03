"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AllocationCard } from "@/components/AllocationCard";
import { ColorLegend } from "@/components/ColorLegend";
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
  investmentTotalPaise: Paise;
  nodes: Node[];
  values: Record<Id, number>;
  items: PercentageEditorItem<Id>[];
  onChange: (next: Record<Id, number>) => void;
  currencySymbol?: string;
};

export function InvestmentBreakdown<Id extends string>({
  investmentTotalPaise,
  nodes,
  values,
  items,
  onChange,
  currencySymbol,
}: Props<Id>) {
  const totalPct = sum(Object.values(values));
  const error = totalPct === 100 ? null : `These numbers must add up to 100%. Current total: ${totalPct}%.`;

  const fmtPct = (p: number) => (Number.isInteger(p) ? `${p}%` : `${p.toFixed(1)}%`);

  const data = nodes.map((n) => ({
    name: n.label,
    value: n.paise,
    percent: n.percent,
    color: n.color,
  }));

  return (
    <div className="space-y-4">
      <PercentageEditor
        title="Investment split"
        description="This is how your investment amount is divided. (It uses the Investments slice above.)"
        items={items}
        values={values}
        onChange={onChange}
        error={error}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-zinc-900">Visual breakdown</div>
          <div className="mt-1 text-sm text-zinc-600">
            Total to invest: {formatPaiseINR(investmentTotalPaise, currencySymbol)}
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} paddingAngle={2}>
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={data[idx]?.color ?? "#2563eb"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown, name: string, props: unknown) => {
                    const p = props as { payload?: { percent?: number } };
                    const pct = p.payload?.percent ?? 0;
                    const paiseRaw = typeof value === "number" ? value : Number(value);
                    const paise = Number.isFinite(paiseRaw) ? paiseRaw : 0;
                    return [
                      `${fmtPct(pct)} (${formatPaiseINR(paise, currencySymbol)})`,
                      name,
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ColorLegend
            items={data.map((d) => ({ label: d.name, color: d.color ?? "#2563eb" }))}
          />
        </div>

        <div className="space-y-3">
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
    </div>
  );
}
