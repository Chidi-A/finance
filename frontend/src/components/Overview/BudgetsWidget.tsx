import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Pie, PieChart } from 'recharts';

import {
  getBudgetsQueryOptions,
  getSpendingByCategoryQueryOptions,
} from '@/queries/budgets';
import { getCategoriesQueryOptions } from '@/queries/categories';

export function BudgetsWidget() {
  const { data: budgets } = useSuspenseQuery(getBudgetsQueryOptions());
  const { data: spendingByCategory } = useSuspenseQuery(
    getSpendingByCategoryQueryOptions(),
  );
  const { data: categories } = useSuspenseQuery(getCategoriesQueryOptions());

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const spentMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(spendingByCategory).map(([id, amt]) => [
          id,
          Number(amt),
        ]),
      ),
    [spendingByCategory],
  );

  const totalSpent = budgets.reduce(
    (sum, b) => sum + (spentMap[b.category_id] ?? 0),
    0,
  );
  const totalMax = budgets.reduce((sum, b) => sum + Number(b.maximum), 0);

  const pieData = budgets.map((b) => ({
    value: spentMap[b.category_id] ?? 0,
    fill: b.theme,
  }));

  const displayed = budgets.slice(0, 4);

  return (
    <div className="rounded-xl bg-card p-6 lg:p-8 flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Budgets</h2>
        <Link
          to="/budgets"
          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          See Details{' '}
          <img
            src="/assets/images/icon-caret-right.svg"
            alt="See Details"
            className="size-2.5"
          />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Chart container — fills half the card */}
        <div className="relative shrink-0 ml-[-10px]">
          <PieChart width={280} height={280}>
            <Pie
              data={pieData}
              cx={140}
              cy={140}
              innerRadius={99}
              outerRadius={127}
              dataKey="value"
              strokeWidth={0}
            />
            <Pie
              data={pieData}
              cx={140}
              cy={140}
              innerRadius={83}
              outerRadius={99}
              dataKey="value"
              strokeWidth={0}
              opacity={0.75}
            />
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[32px] font-bold">
              ${totalSpent.toFixed(0)}
            </span>
            <span className="text-xs text-muted-foreground text-center leading-tight">
              of ${totalMax.toFixed(2)} limit
            </span>
          </div>
        </div>
        {/* 2×2 category grid */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 w-full ">
          {displayed.map((b) => (
            <div key={b.id} className="flex gap-3">
              <div
                className="w-1 rounded-full shrink-0"
                style={{ backgroundColor: b.theme }}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  {categoryMap[b.category_id] ?? '—'}
                </span>
                <span className="text-sm font-bold">
                  ${Number(b.maximum).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
