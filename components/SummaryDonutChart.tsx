"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ColorLegend } from "@/components/ColorLegend";
import { formatPaiseINR, type Paise } from "@/lib/money";

type Item = {
  label: string;
  percent: number;
  paise: Paise;
  color: string;
};

type Props = {
  title: string;
  items: Item[];
  currencySymbol?: string;
};

export function SummaryDonutChart({ title, items, currencySymbol }: Props) {
  const data = items.map((i) => ({
    name: i.label,
    value: i.paise,
    percent: i.percent,
    color: i.color,
  }));

  const fmtPct = (p: number) => (Number.isInteger(p) ? `${p}%` : `${p.toFixed(1)}%`);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={data[idx]?.color} />
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

      <ColorLegend items={data.map((d) => ({ label: d.name, color: d.color }))} />
    </div>
  );
}
