import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import type { BudgetPublic } from '@/client/types.gen';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getLatestTransactionsByCategoryQueryOptions } from '@/queries/transactions';
import { formatAmount, formatDate, getInitials } from '@/utils';

interface BudgetCardProps {
  budget: BudgetPublic;
  categoryName: string;
  spent: number;
}

export function BudgetCard({ budget, categoryName, spent }: BudgetCardProps) {
  const { data: latestTxs } = useSuspenseQuery(
    getLatestTransactionsByCategoryQueryOptions(budget.category_id),
  );

  const maximum = Number(budget.maximum);
  const remaining = Math.max(0, maximum - spent);
  const progress = Math.min(100, (spent / maximum) * 100);

  return (
    <div className="rounded-xl bg-card p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: budget.theme }}
          />
          <h3 className="font-bold text-lg">{categoryName}</h3>
        </div>
        {/* ... menu placeholder */}
      </div>

      {/* Maximum */}
      <p className="text-sm text-muted-foreground">
        Maximum of ${maximum.toFixed(2)}
      </p>

      {/* Progress bar */}
      <div className="w-full h-8 bg-muted rounded-md overflow-hidden p-1">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${progress}%`,
            backgroundColor: budget.theme,
          }}
        />
      </div>

      {/* Spent / Remaining */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-8 rounded-full"
            style={{ backgroundColor: budget.theme }}
          />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Spent</span>
            <span className="text-sm font-semibold">${spent.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 rounded-full bg-muted" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Remaining</span>
            <span className="text-sm font-semibold">
              ${remaining.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Latest Spending */}
      <div className="bg-muted/50 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Latest Spending</span>
          <Link
            to="/transactions"
            search={{
              categoryId: budget.category_id,
              page: 1,
              search: '',
              sortBy: 'latest',
            }}
            className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground"
          >
            See All
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {latestTxs.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage
                    src={tx.avatar_url ?? undefined}
                    alt={tx.counterparty_name}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(tx.counterparty_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {tx.counterparty_name}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-destructive">
                  {formatAmount(tx.amount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(tx.posted_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
