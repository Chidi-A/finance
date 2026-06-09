import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useMemo, useState } from 'react';

import {
  getBudgetsQueryOptions,
  getSpendingByCategoryQueryOptions,
} from '@/queries/budgets';
import { getCategoriesQueryOptions } from '@/queries/categories';
import { SpendingSummaryCard } from '@/components/Budgets/SpendingSummaryCard';
import { getLatestTransactionsByCategoryQueryOptions } from '@/queries/transactions';
import { BudgetCard } from '@/components/Budgets/BudgetCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddBudgetDialog } from '@/components/Budgets/AddBudgetDialog';

export const Route = createFileRoute('/_layout/budgets')({
  component: Budgets,
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(getBudgetsQueryOptions()),
      queryClient.ensureQueryData(getCategoriesQueryOptions()),
      queryClient.ensureQueryData(getSpendingByCategoryQueryOptions()),
    ]).then(([budgets]) =>
      Promise.all(
        budgets.map((b) =>
          queryClient.ensureQueryData(
            getLatestTransactionsByCategoryQueryOptions(b.category_id),
          ),
        ),
      ),
    ),
  head: () => ({
    meta: [{ title: 'Budgets - Finance App' }],
  }),
});

function BudgetsContent() {
  const [addOpen, setAddOpen] = useState(false);

  const { data: budgets } = useSuspenseQuery(getBudgetsQueryOptions());
  const { data: categories } = useSuspenseQuery(getCategoriesQueryOptions());
  const { data: spendingByCategory } = useSuspenseQuery(
    getSpendingByCategoryQueryOptions(),
  );

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

  const usedThemes = budgets.map((b) => b.theme);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <Button
          className="h-13 bg-[#201F24] hover:bg-[#201F24]/90 "
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" />
          Add New Budget
        </Button>
      </div>
      <div className="grid grid-cols-[1fr_2fr] gap-6 items-start">
        <SpendingSummaryCard
          budgets={budgets}
          categoryMap={categoryMap}
          spentMap={spentMap}
        />
        <div className="flex flex-col gap-6">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              categoryName={categoryMap[b.category_id] ?? '—'}
              spent={spentMap[b.category_id] ?? 0}
              usedThemes={usedThemes}
            />
          ))}
        </div>
      </div>
      <AddBudgetDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        usedThemes={usedThemes}
      />
    </div>
  );
}

function Budgets() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BudgetsContent />
    </Suspense>
  );
}
