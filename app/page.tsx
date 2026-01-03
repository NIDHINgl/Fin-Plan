"use client";

import { useCallback, useMemo, useState } from "react";
import { SalaryInput } from "@/components/SalaryInput";
import { PercentageEditor } from "@/components/PercentageEditor";
import { AllocationCard } from "@/components/AllocationCard";
import { SummaryDonutChart } from "@/components/SummaryDonutChart";
import { InvestmentBreakdown } from "@/components/InvestmentBreakdown";
import { MutualFundBreakdown } from "@/components/MutualFundBreakdown";
import { DownloadButton } from "@/components/DownloadButton";
import {
  computePlanner,
  DEFAULT_CONFIG,
  INVESTMENT_BUCKET_LABELS,
  MUTUAL_FUND_BUCKET_LABELS,
  percentTotal,
  SALARY_BUCKET_LABELS,
  type InvestmentBucketId,
  type MutualFundBucketId,
  type PlannerConfig,
  type SalaryBucketId,
} from "@/lib/allocation";
import { formatPaiseINR, parseCurrencyToPaise, type Paise } from "@/lib/money";

const CURRENCY_SYMBOL = "₹";

const SALARY_COLORS: Record<SalaryBucketId, string> = {
  essentials: "#2563eb",
  savings: "#16a34a",
  investments: "#f59e0b",
  lifestyle: "#9333ea",
};

const INVESTMENT_COLORS: Record<InvestmentBucketId, string> = {
  mutualFunds: "#2563eb",
  stocks: "#16a34a",
  debt: "#f59e0b",
  gold: "#9333ea",
  reits: "#dc2626",
  crypto: "#0ea5e9",
};

const MF_COLORS: Record<MutualFundBucketId, string> = {
  indexFunds: "#2563eb",
  flexiCap: "#16a34a",
  midCap: "#f59e0b",
  sectorThematic: "#9333ea",
};

const SALARY_ITEMS: { id: SalaryBucketId; label: string }[] = [
  { id: "essentials", label: SALARY_BUCKET_LABELS.essentials },
  { id: "savings", label: SALARY_BUCKET_LABELS.savings },
  { id: "investments", label: SALARY_BUCKET_LABELS.investments },
  { id: "lifestyle", label: SALARY_BUCKET_LABELS.lifestyle },
];

const INVESTMENT_ITEMS: { id: InvestmentBucketId; label: string }[] = [
  { id: "mutualFunds", label: INVESTMENT_BUCKET_LABELS.mutualFunds },
  { id: "stocks", label: INVESTMENT_BUCKET_LABELS.stocks },
  { id: "debt", label: INVESTMENT_BUCKET_LABELS.debt },
  { id: "gold", label: INVESTMENT_BUCKET_LABELS.gold },
  { id: "reits", label: INVESTMENT_BUCKET_LABELS.reits },
  { id: "crypto", label: INVESTMENT_BUCKET_LABELS.crypto },
];

const MF_ITEMS: { id: MutualFundBucketId; label: string }[] = [
  { id: "indexFunds", label: MUTUAL_FUND_BUCKET_LABELS.indexFunds },
  { id: "flexiCap", label: MUTUAL_FUND_BUCKET_LABELS.flexiCap },
  { id: "midCap", label: MUTUAL_FUND_BUCKET_LABELS.midCap },
  { id: "sectorThematic", label: MUTUAL_FUND_BUCKET_LABELS.sectorThematic },
];

function sectionTotalError(total: number): string | null {
  return total === 100 ? null : `These numbers must add up to 100%. Current total: ${total}%.`;
}

function extractTotals(config: PlannerConfig) {
  return {
    salary: percentTotal(config.salaryAllocation),
    investments: percentTotal(config.investmentAllocation),
    mutualFunds: percentTotal(config.mutualFundAllocation),
  };
}

export default function Home() {
  const [salaryInput, setSalaryInput] = useState<string>("100000");
  const [config, setConfig] = useState<PlannerConfig>(DEFAULT_CONFIG);

  const salaryPaise: Paise = useMemo(() => {
    const parsed = parseCurrencyToPaise(salaryInput);
    return parsed && parsed > 0 ? parsed : 0;
  }, [salaryInput]);

  const totals = useMemo(() => extractTotals(config), [config]);

  const derived = useMemo(() => computePlanner(salaryPaise, config), [salaryPaise, config]);

  const salaryValid = salaryPaise > 0;

  const investmentTotalPaise =
    derived.salaryNodes.find((n) => n.id === "investments")?.paise ?? 0;
  const mutualFundsTotalPaise =
    derived.investmentNodes.find((n) => n.id === "mutualFunds")?.paise ?? 0;
  const saveAsPDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <div className="text-base font-semibold text-zinc-900">Personal Finance Planner</div>
            <div className="mt-1 text-sm text-zinc-600">
              Set your salary and percentages. Everything updates instantly.
            </div>
          </div>
          <div className="no-print flex items-center gap-3">
            <DownloadButton label="Save as PDF" onClick={saveAsPDF} variant="secondary" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="no-print">
            <SalaryInput value={salaryInput} onChange={setSalaryInput} currencySymbol={CURRENCY_SYMBOL} />
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-zinc-900">Your monthly snapshot</div>
            <div className="mt-1 text-sm text-zinc-600">
              A simple view of where your money goes.
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-xs font-medium text-zinc-700">Salary</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {formatPaiseINR(derived.salaryTotalPaise, CURRENCY_SYMBOL)}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-xs font-medium text-zinc-700">Investments</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {formatPaiseINR(investmentTotalPaise, CURRENCY_SYMBOL)}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-xs font-medium text-zinc-700">Mutual funds</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {formatPaiseINR(mutualFundsTotalPaise, CURRENCY_SYMBOL)}
                </div>
              </div>
            </div>

            {!salaryValid ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Salary must be greater than 0.
              </div>
            ) : null}
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <div className="text-base font-semibold text-zinc-900">Step 1: Split your salary</div>
            <div className="mt-1 text-sm text-zinc-600">
              Adjust the sliders. The total must be exactly 100%.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PercentageEditor
              title="Salary allocation"
              description="How you want to divide your monthly salary."
              items={SALARY_ITEMS}
              values={config.salaryAllocation}
              onChange={(next) => setConfig((prev) => ({ ...prev, salaryAllocation: next }))}
              error={sectionTotalError(totals.salary)}
            />

            <SummaryDonutChart
              title="Visual split"
              items={derived.salaryNodes.map((n) => ({
                label: n.label,
                percent: n.percent,
                paise: n.paise,
                color: SALARY_COLORS[n.id],
              }))}
              currencySymbol={CURRENCY_SYMBOL}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {derived.salaryNodes.map((n) => (
              <AllocationCard
                key={n.id}
                label={n.label}
                percent={n.percent}
                paise={n.paise}
                currencySymbol={CURRENCY_SYMBOL}
                color={SALARY_COLORS[n.id]}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <div className="text-base font-semibold text-zinc-900">Step 2: Split investments</div>
            <div className="mt-1 text-sm text-zinc-600">
              This section splits only the Investments amount from Step 1.
            </div>
          </div>

          <InvestmentBreakdown
            investmentTotalPaise={investmentTotalPaise}
            nodes={derived.investmentNodes.map((n) => ({
              id: n.id,
              label: n.label,
              percent: n.percent,
              paise: n.paise,
              color: INVESTMENT_COLORS[n.id],
            }))}
            values={config.investmentAllocation}
            items={INVESTMENT_ITEMS}
            onChange={(next) => setConfig((prev) => ({ ...prev, investmentAllocation: next }))}
            currencySymbol={CURRENCY_SYMBOL}
          />
        </section>

        <section className="space-y-4">
          <div>
            <div className="text-base font-semibold text-zinc-900">Step 3: Split mutual funds</div>
            <div className="mt-1 text-sm text-zinc-600">
              This section splits only the Mutual Funds amount from Step 2.
            </div>
          </div>

          <MutualFundBreakdown
            mutualFundsTotalPaise={mutualFundsTotalPaise}
            nodes={derived.mutualFundNodes.map((n) => ({
              id: n.id,
              label: n.label,
              percent: n.percent,
              paise: n.paise,
              color: MF_COLORS[n.id],
            }))}
            values={config.mutualFundAllocation}
            items={MF_ITEMS}
            onChange={(next) => setConfig((prev) => ({ ...prev, mutualFundAllocation: next }))}
            currencySymbol={CURRENCY_SYMBOL}
          />
        </section>

        <section className="no-print rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-zinc-900">Export</div>
          <div className="mt-1 text-sm text-zinc-600">
            Save the full page as a PDF.
          </div>
          <div className="mt-4 no-print flex flex-col gap-3 sm:flex-row sm:items-center">
            <DownloadButton label="Save as PDF" onClick={saveAsPDF} variant="secondary" />
          </div>
        </section>
      </main>
    </div>
  );
}
