import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

import { getAccountQueryOptions } from '@/queries/account';
import { getPotsQueryOptions } from '@/queries/pots';
import {
  getBudgetsQueryOptions,
  getSpendingByCategoryQueryOptions,
} from '@/queries/budgets';
import {
  getRecurringBillsSummaryQueryOptions,
  getTransactionsQueryOptions,
} from '@/queries/transactions';

import { BalanceCards } from '@/components/Overview/BalanceCards';
import { PotsWidget } from '@/components/Overview/PotsWidget';
import { TransactionsWidget } from '@/components/Overview/TransactionsWidget';

export const Route = createFileRoute('/_layout/')({
  component: Overview,
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(getAccountQueryOptions()),
      queryClient.ensureQueryData(getPotsQueryOptions()),
      queryClient.ensureQueryData(
        getTransactionsQueryOptions({
          page: 1,
          search: '',
          sortBy: 'latest',
          categoryId: null,
        }),
      ),
      queryClient.ensureQueryData(getBudgetsQueryOptions()),
      queryClient.ensureQueryData(getSpendingByCategoryQueryOptions()),
      queryClient.ensureQueryData(getRecurringBillsSummaryQueryOptions()),
    ]),
  head: () => ({
    meta: [{ title: 'Overview - Finance App' }],
  }),
});

function OverviewContent() {
  const { data: account } = useSuspenseQuery(getAccountQueryOptions());

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>

      <BalanceCards account={account} />

      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* PotsWidget goes here */}
          <PotsWidget />
          {/* TransactionsWidget goes here */}
          <TransactionsWidget />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* BudgetsWidget goes here */}
          {/* RecurringBillsWidget goes here */}
        </div>
      </div>
    </div>
  );
}

function Overview() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OverviewContent />
    </Suspense>
  );
}
