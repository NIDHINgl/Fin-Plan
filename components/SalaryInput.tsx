import { formatPaiseINR, parseCurrencyToPaise, type Paise } from "@/lib/money";

type Props = {
  value: string;
  onChange: (next: string) => void;
  currencySymbol?: string;
};

export function SalaryInput({ value, onChange, currencySymbol }: Props) {
  const paise: Paise | null = parseCurrencyToPaise(value);
  const valid = paise !== null && paise > 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-zinc-900">Monthly salary</div>
      <div className="mt-1 text-sm text-zinc-600">Enter what you get each month. We’ll split it instantly.</div>

      <div className="mt-4 flex flex-col gap-2">
        <label className="text-xs font-medium text-zinc-700" htmlFor="salary">
          Amount
        </label>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            {currencySymbol ?? "₹"}
          </div>
          <input
            id="salary"
            inputMode="decimal"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-300 focus:ring-2"
            placeholder="e.g. 100000"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!valid}
          />
        </div>

        <div className="text-xs">
          {valid ? (
            <span className="text-zinc-600">Using {formatPaiseINR(paise, currencySymbol)} per month</span>
          ) : (
            <span className="text-red-600">Enter a valid amount greater than 0</span>
          )}
        </div>
      </div>
    </div>
  );
}
