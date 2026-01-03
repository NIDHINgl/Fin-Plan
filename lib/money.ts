export type Paise = number;

export function parseCurrencyToPaise(input: string): Paise | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/,/g, "");
  if (!/^[0-9]*\.?[0-9]*$/.test(normalized)) return null;

  const [wholeRaw, fracRaw = ""] = normalized.split(".");
  const whole = wholeRaw ? Number(wholeRaw) : 0;
  if (!Number.isFinite(whole) || whole < 0) return null;

  const frac2 = fracRaw.padEnd(2, "0").slice(0, 2);
  const frac = frac2 ? Number(frac2) : 0;
  if (!Number.isFinite(frac) || frac < 0) return null;

  return whole * 100 + frac;
}

export function formatPaiseINR(paise: Paise, currencySymbol: string = "₹"): string {
  const sign = paise < 0 ? "-" : "";
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const cents = abs % 100;

  const formattedRupees = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(rupees);

  return `${sign}${currencySymbol}${formattedRupees}.${String(cents).padStart(2, "0")}`;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

export type SplitInputItem<Id extends string> = {
  id: Id;
  percent: number;
};

export type SplitOutputItem<Id extends string> = {
  id: Id;
  percent: number;
  paise: Paise;
};

export function splitPaiseByWeights<Id extends string>(
  totalPaise: Paise,
  items: SplitInputItem<Id>[],
  totalWeight: number,
): SplitOutputItem<Id>[] {
  if (totalPaise <= 0) {
    return items.map((item) => ({ id: item.id, percent: 0, paise: 0 }));
  }
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    return items.map((item) => ({ id: item.id, percent: 0, paise: 0 }));
  }

  const denom = Math.round(totalWeight);

  const bases = items.map((item) => {
    const weight = Math.round(item.percent);
    const numerator = totalPaise * weight;
    const floored = Math.floor(numerator / denom);
    const remainder = numerator % denom;
    const fractional = remainder / denom;
    const effectivePercent = (weight * 100) / denom;

    return {
      id: item.id,
      percent: effectivePercent,
      floored,
      fractional,
    };
  });

  const sumFloored = bases.reduce((acc, b) => acc + b.floored, 0);
  let remainder = totalPaise - sumFloored;

  const remainderOrder = bases
    .map((b, index) => ({ ...b, index }))
    .sort((a, b) => {
      if (b.fractional !== a.fractional) return b.fractional - a.fractional;
      return a.index - b.index;
    });

  const bump: Record<string, number> = {};
  for (const b of remainderOrder) {
    bump[b.id] = 0;
  }

  if (remainderOrder.length > 0) {
    if (remainder > 0) {
      let i = 0;
      while (remainder > 0) {
        const b = remainderOrder[i % remainderOrder.length];
        bump[b.id] = (bump[b.id] ?? 0) + 1;
        remainder -= 1;
        i += 1;
      }
    }

    if (remainder < 0) {
      const takeOrder = [...remainderOrder].reverse();
      let i = 0;
      while (remainder < 0) {
        const b = takeOrder[i % takeOrder.length];
        bump[b.id] = (bump[b.id] ?? 0) - 1;
        remainder += 1;
        i += 1;
      }
    }
  }

  return bases.map((b) => ({
    id: b.id,
    percent: b.percent,
    paise: b.floored + (bump[b.id] ?? 0),
  }));
}

export function splitPaiseByPercent<Id extends string>(
  totalPaise: Paise,
  items: SplitInputItem<Id>[],
): SplitOutputItem<Id>[] {
  return splitPaiseByWeights(totalPaise, items, 100);
}
