import { clampNumber } from "@/lib/money";

export type PercentageEditorItem<Id extends string> = {
  id: Id;
  label: string;
};

type Props<Id extends string> = {
  title: string;
  description: string;
  items: PercentageEditorItem<Id>[];
  values: Record<Id, number>;
  onChange: (next: Record<Id, number>) => void;
  error?: string | null;
};

export function PercentageEditor<Id extends string>({
  title,
  description,
  items,
  values,
  onChange,
  error,
}: Props<Id>) {
  const update = (id: Id, nextValue: number) => {
    const safe = clampNumber(Math.round(nextValue), 0, 100);
    onChange({
      ...values,
      [id]: safe,
    });
  };

  return (
    <div className="no-print rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <div className="mt-1 text-sm text-zinc-600">{description}</div>

      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_96px] sm:items-center">
            <div className="min-w-0 text-sm font-medium text-zinc-900">{item.label}</div>

            <input
              type="range"
              min={0}
              max={100}
              value={values[item.id]}
              onChange={(e) => update(item.id, Number(e.target.value))}
              className="w-full"
              aria-label={`${item.label} percentage`}
            />

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={values[item.id]}
                onChange={(e) => update(item.id, Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-300 focus:ring-2"
                aria-label={`${item.label} percentage value`}
              />
              <div className="text-sm text-zinc-600">%</div>
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
