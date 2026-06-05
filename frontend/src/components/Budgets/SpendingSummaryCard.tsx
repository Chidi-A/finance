import { Pie, PieChart } from 'recharts';

import type { BudgetPublic } from '@/client/types.gen';

interface SpendingSummaryCardProps {
  budgets: BudgetPublic[];
  categoryMap: Record<string, string>;
  spentMap: Record<string, number>;
}

export function SpendingSummaryCard({
  budgets,
  categoryMap,
  spentMap,
}: SpendingSummaryCardProps) {
  const totalSpent = budgets.reduce(
    (sum, b) => sum + (spentMap[b.category_id] ?? 0),
    0,
  );
  const totalMax = budgets.reduce((sum, b) => sum + Number(b.maximum), 0);

  const pieData = budgets.map((b) => ({
    value: spentMap[b.category_id] ?? 0,
    fill: b.theme,
  }));

  return (
    <div className="rounded-xl bg-card p-6 flex flex-col gap-6 min-w-[260px]">
      <div className="relative flex items-center justify-center">
        <PieChart width={220} height={220}>
          {/* Outer ring — same data, lighter */}
          <Pie
            data={pieData}
            cx={105}
            cy={105}
            innerRadius={79}
            outerRadius={105}
            dataKey="value"
            strokeWidth={0}
          />
          {/* Inner ring — same data, solid */}
          <Pie
            data={pieData}
            cx={105}
            cy={105}
            innerRadius={65}
            outerRadius={79}
            dataKey="value"
            strokeWidth={0}
            opacity={0.75}
          />
        </PieChart>
        <div className="absolute flex flex-col items-center pointer-events-none">
          <span className="text-3xl font-bold">${totalSpent.toFixed(0)}</span>
          <span className="text-sm text-muted-foreground">
            of ${totalMax.toFixed(2)} limit
          </span>
        </div>
      </div>
      <div>
        <h2 className="font-bold mb-4">Spending Summary</h2>
        <div className="flex flex-col">
          {budgets.map((b) => {
            const spent = spentMap[b.category_id] ?? 0;
            return (
              <div
                key={b.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: b.theme }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {categoryMap[b.category_id] ?? '—'}
                  </span>
                </div>
                <div className="text-sm text-right">
                  <span className="font-semibold">${spent.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    of ${Number(b.maximum).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
