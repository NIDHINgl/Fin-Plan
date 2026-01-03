import { splitPaiseByWeights, type Paise, type SplitInputItem, sum } from "@/lib/money";

export type SalaryBucketId =
  | "essentials"
  | "savings"
  | "investments"
  | "lifestyle";

export type InvestmentBucketId =
  | "mutualFunds"
  | "stocks"
  | "debt"
  | "gold"
  | "reits"
  | "crypto";

export type MutualFundBucketId =
  | "indexFunds"
  | "flexiCap"
  | "midCap"
  | "sectorThematic";

export type PercentConfig<Id extends string> = Record<Id, number>;

export type AllocationNode<Id extends string> = {
  id: Id;
  label: string;
  percent: number;
  paise: Paise;
  children?: AllocationNode<string>[];
};

export type PlannerConfig = {
  salaryAllocation: PercentConfig<SalaryBucketId>;
  investmentAllocation: PercentConfig<InvestmentBucketId>;
  mutualFundAllocation: PercentConfig<MutualFundBucketId>;
};

export const DEFAULT_CONFIG: PlannerConfig = {
  salaryAllocation: {
    essentials: 50,
    savings: 10,
    investments: 30,
    lifestyle: 10,
  },
  investmentAllocation: {
    mutualFunds: 40,
    stocks: 20,
    debt: 20,
    gold: 10,
    reits: 5,
    crypto: 5,
  },
  mutualFundAllocation: {
    indexFunds: 40,
    flexiCap: 30,
    midCap: 20,
    sectorThematic: 10,
  },
};

export const SALARY_BUCKET_LABELS: Record<SalaryBucketId, string> = {
  essentials: "Essentials",
  savings: "Savings & Emergency Fund",
  investments: "Investments",
  lifestyle: "Lifestyle & Miscellaneous",
};

export const INVESTMENT_BUCKET_LABELS: Record<InvestmentBucketId, string> = {
  mutualFunds: "Mutual Funds",
  stocks: "Stocks",
  debt: "Debt",
  gold: "Gold",
  reits: "REITs",
  crypto: "Crypto",
};

export const MUTUAL_FUND_BUCKET_LABELS: Record<MutualFundBucketId, string> = {
  indexFunds: "Index Funds",
  flexiCap: "Flexi-Cap Funds",
  midCap: "Mid-Cap Funds",
  sectorThematic: "Sector/Thematic Funds",
};

export function percentTotal<Id extends string>(config: PercentConfig<Id>): number {
  return sum(Object.values(config));
}

export function isValidPercentTotal<Id extends string>(config: PercentConfig<Id>): boolean {
  return percentTotal(config) === 100;
}

export function toSplitItems<Id extends string>(config: PercentConfig<Id>): SplitInputItem<Id>[] {
  return (Object.keys(config) as Id[]).map((id) => ({
    id,
    percent: config[id],
  }));
}

export type PlannerDerived = {
  salaryTotalPaise: Paise;
  salaryNodes: AllocationNode<SalaryBucketId>[];
  investmentNodes: AllocationNode<InvestmentBucketId>[];
  mutualFundNodes: AllocationNode<MutualFundBucketId>[];
  fullTree: AllocationNode<"salary">;
};

export function computePlanner(
  salaryTotalPaise: Paise,
  config: PlannerConfig,
): PlannerDerived {
  const salaryTotal = percentTotal(config.salaryAllocation);
  const investmentTotal = percentTotal(config.investmentAllocation);
  const mutualFundTotal = percentTotal(config.mutualFundAllocation);

  const salarySplits = splitPaiseByWeights(
    salaryTotalPaise,
    toSplitItems(config.salaryAllocation),
    salaryTotal,
  );

  const salaryNodes: AllocationNode<SalaryBucketId>[] = salarySplits.map((s) => ({
    id: s.id,
    label: SALARY_BUCKET_LABELS[s.id],
    percent: s.percent,
    paise: s.paise,
  }));

  const investmentsPaise = salaryNodes.find((n) => n.id === "investments")?.paise ?? 0;

  const investmentSplits = splitPaiseByWeights(
    investmentsPaise,
    toSplitItems(config.investmentAllocation),
    investmentTotal,
  );

  const investmentNodes: AllocationNode<InvestmentBucketId>[] = investmentSplits.map((s) => ({
    id: s.id,
    label: INVESTMENT_BUCKET_LABELS[s.id],
    percent: s.percent,
    paise: s.paise,
  }));

  const mutualFundsPaise = investmentNodes.find((n) => n.id === "mutualFunds")?.paise ?? 0;

  const mutualFundSplits = splitPaiseByWeights(
    mutualFundsPaise,
    toSplitItems(config.mutualFundAllocation),
    mutualFundTotal,
  );

  const mutualFundNodes: AllocationNode<MutualFundBucketId>[] = mutualFundSplits.map((s) => ({
    id: s.id,
    label: MUTUAL_FUND_BUCKET_LABELS[s.id],
    percent: s.percent,
    paise: s.paise,
  }));

  const investmentNodeWithChildren: AllocationNode<InvestmentBucketId>[] = investmentNodes.map(
    (n) =>
      n.id === "mutualFunds"
        ? ({
            ...n,
            children: mutualFundNodes as AllocationNode<string>[],
          } satisfies AllocationNode<InvestmentBucketId>)
        : n,
  );

  const salaryNodeWithChildren: AllocationNode<SalaryBucketId>[] = salaryNodes.map((n) =>
    n.id === "investments"
      ? ({
          ...n,
          children: investmentNodeWithChildren as AllocationNode<string>[],
        } satisfies AllocationNode<SalaryBucketId>)
      : n,
  );

  const fullTree: AllocationNode<"salary"> = {
    id: "salary",
    label: "Monthly Salary",
    percent: 100,
    paise: salaryTotalPaise,
    children: salaryNodeWithChildren as AllocationNode<string>[],
  };

  return {
    salaryTotalPaise,
    salaryNodes: salaryNodeWithChildren,
    investmentNodes: investmentNodeWithChildren,
    mutualFundNodes,
    fullTree,
  };
}

export type ExportRow = {
  path: string;
  category: string;
  percentage: number;
  amountPaise: Paise;
};

export function flattenForExport(root: AllocationNode<string>): ExportRow[] {
  const rows: ExportRow[] = [];

  const walk = (node: AllocationNode<string>, path: string[]) => {
    const nextPath = [...path, node.label];
    rows.push({
      path: nextPath.join(" > "),
      category: node.label,
      percentage: node.percent,
      amountPaise: node.paise,
    });

    if (node.children) {
      for (const child of node.children) {
        walk(child, nextPath);
      }
    }
  };

  walk(root, []);
  return rows;
}

export function rowsToCSV(rows: ExportRow[]): string {
  const escape = (value: string) => {
    if (/[\",\n]/.test(value)) return `"${value.replace(/\"/g, '""')}"`;
    return value;
  };

  const paiseToRupees = (paise: Paise) => {
    const sign = paise < 0 ? "-" : "";
    const abs = Math.abs(paise);
    const rupees = Math.floor(abs / 100);
    const cents = abs % 100;
    return `${sign}${rupees}.${String(cents).padStart(2, "0")}`;
  };

  const header = ["Path", "Category", "Percentage", "Amount"].join(",");
  const lines = rows.map((r) =>
    [
      escape(r.path),
      escape(r.category),
      String(r.percentage),
      paiseToRupees(r.amountPaise),
    ].join(","),
  );

  return [header, ...lines].join("\n");
}
