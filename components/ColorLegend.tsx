type LegendItem = {
  label: string;
  color: string;
};

type Props = {
  items: LegendItem[];
};

export function ColorLegend({ items }: Props) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-zinc-700 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="shrink-0 text-[10px] leading-none" style={{ color: item.color }}>
            ●
          </span>
          <span className="truncate">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
