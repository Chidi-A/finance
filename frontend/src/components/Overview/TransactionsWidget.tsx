import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getTransactionsQueryOptions } from "@/queries/transactions"
import { formatAmount, formatDate, getInitials } from "@/utils"

export function TransactionsWidget() {
  const { data: transactions } = useSuspenseQuery(
    getTransactionsQueryOptions({
      page: 1,
      search: "",
      sortBy: "latest",
      categoryId: null,
    }),
  )

  const displayed = transactions.slice(0, 5)

  return (
    <div className="rounded-xl bg-card p-6 lg:p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Transactions</h2>
        <Link
          to="/transactions"
          search={{
            page: 1,
            search: "",
            sortBy: "latest",
            categoryId: null,
          }}
          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View All{" "}
          <img
            src="/assets/images/icon-caret-right.svg"
            alt="See Details"
            className="size-2.5"
          />
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {displayed.map((tx) => {
          const isPositive = Number(tx.amount) >= 0
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src={tx.avatar_url ?? undefined}
                    alt={tx.counterparty_name}
                  />
                  <AvatarFallback>
                    {getInitials(tx.counterparty_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {tx.counterparty_name}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : ""}`}
                >
                  {formatAmount(tx.amount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(tx.posted_at)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
