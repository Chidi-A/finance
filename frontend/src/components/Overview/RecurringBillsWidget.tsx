import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { getRecurringBillsSummaryQueryOptions } from '@/queries/transactions';

function formatMoney(value: string) {
  return `$${Number(value).toFixed(2)}`;
}

const ROWS = [
  { key: 'paid', label: 'Paid Bills', color: '#277C78' },
  { key: 'upcoming', label: 'Total Upcoming', color: '#F2CDAC' },
  { key: 'due_soon', label: 'Due Soon', color: '#82C9D7' },
] as const;

export function RecurringBillsWidget() {
  const { data: summary } = useSuspenseQuery(
    getRecurringBillsSummaryQueryOptions(),
  );
  const amounts = {
    paid: summary.paid_total,
    upcoming: summary.upcoming_total,
    due_soon: summary.due_soon_total,
  };
  return (
    <div className="rounded-xl bg-card p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Recurring Bills</h2>
        <Link
          to="/recurring-bills"
          search={{ search: '', sortBy: 'latest' }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          See Details{' '}
          <img
            src="/assets/images/icon-caret-right.svg"
            alt=""
            className="size-2.5"
          />
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {ROWS.map(({ key, label, color }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg bg-[#F8F4F0] px-4 py-4 border-l-4"
            style={{ borderLeftColor: color }}
          >
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-bold">
              {formatMoney(amounts[key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
