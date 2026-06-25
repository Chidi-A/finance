import type { RecurringBillsSummary } from "@/client/types.gen"

function formatMoney(value: string) {
  return `$${Number(value).toFixed(2)}`
}

interface Props {
  summary: RecurringBillsSummary
  totalBills: string
}

export function BillsSummaryPanel({ summary, totalBills }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full lg:w-80 shrink-0">
      {/* Total Bills card */}
      <div className="rounded-xl bg-[#201F24] text-white p-6 flex flex-col gap-3">
        <div className="flex flex-col gap-8">
          <img
            src="/assets/images/icon-recurring-bills.svg"
            alt="Bills"
            className="w-6 h-6"
          />
          <span className="text-sm text-white/70">Total Bills</span>
        </div>
        <span className="text-3xl font-bold">{formatMoney(totalBills)}</span>
      </div>

      {/* Summary card */}
      <div className="rounded-xl bg-card p-5 flex flex-col gap-5">
        <h2 className="font-bold text-base">Summary</h2>
        <div className="flex flex-col divide-y divide-border">
          <div className="flex items-center justify-between py-4">
            <span className="text-xs text-muted-foreground">Paid Bills</span>
            <span className="text-xs font-semibold">
              {summary.paid_count} ({formatMoney(summary.paid_total)})
            </span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-xs text-muted-foreground">
              Total Upcoming
            </span>
            <span className="text-xs font-semibold">
              {summary.upcoming_count} ({formatMoney(summary.upcoming_total)})
            </span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-xs text-[#C94736] font-medium">Due Soon</span>
            <span className="text-xs font-semibold text-[#C94736]">
              {summary.due_soon_count} ({formatMoney(summary.due_soon_total)})
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
