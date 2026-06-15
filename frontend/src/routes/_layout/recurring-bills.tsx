import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { BillsSummaryPanel } from '@/components/RecurringBills/BillsSummaryPanel';
import { BillsTable } from '@/components/RecurringBills/BillsTable';
import {
  getRecurringBillsQueryOptions,
  getRecurringBillsSummaryQueryOptions,
} from '@/queries/transactions';

const recurringBillsSearchSchema = z.object({
  search: z.string().catch(''),
  sortBy: z
    .enum(['latest', 'oldest', 'a-z', 'z-a', 'highest', 'lowest'])
    .catch('latest'),
});

type SortBy = 'latest' | 'oldest' | 'a-z' | 'z-a' | 'highest' | 'lowest';

export const Route = createFileRoute('/_layout/recurring-bills')({
  component: RecurringBills,
  validateSearch: recurringBillsSearchSchema,
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(getRecurringBillsSummaryQueryOptions()),
      queryClient.ensureQueryData(
        getRecurringBillsQueryOptions({ search: '', sortBy: 'latest' }),
      ),
    ]),
  head: () => ({
    meta: [{ title: 'Recurring Bills - Finance App' }],
  }),
});

function RecurringBills() {
  const { search, sortBy } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: summary } = useSuspenseQuery(
    getRecurringBillsSummaryQueryOptions(),
  );
  const { data: bills = [], isFetching } = useQuery(
    getRecurringBillsQueryOptions({ search, sortBy }),
  );

  const setSearch = (value: string) =>
    navigate({ search: (prev) => ({ ...prev, search: value }) });
  const setSortBy = (value: string) =>
    navigate({
      search: (prev) => ({ ...prev, sortBy: value as SortBy }),
    });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Recurring Bills</h1>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <BillsSummaryPanel summary={summary} totalBills={summary.total_bills} />
        <div
          className={
            isFetching ? 'opacity-60 transition-opacity flex-1' : 'flex-1'
          }
        >
          <BillsTable
            bills={bills}
            search={search}
            sortBy={sortBy}
            onSearch={setSearch}
            onSortBy={setSortBy}
          />
        </div>
      </div>
    </div>
  );
}
