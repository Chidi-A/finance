import type { AccountPublic } from '@/client/types.gen';

function formatMoney(value: string | undefined) {
  return `$${Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

interface Props {
  account: AccountPublic;
}

export function BalanceCards({ account }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
      <div className="rounded-xl bg-[#201F24] text-white p-6 flex flex-col gap-3 col-span-1">
        <span className="text-sm text-white/70">Current Balance</span>
        <span className="text-3xl font-bold">
          {formatMoney(account.current_balance)}
        </span>
      </div>

      <div className="rounded-xl bg-card p-6 flex flex-col gap-3">
        <span className="text-sm text-muted-foreground">Income</span>
        <span className="text-3xl font-bold">
          {formatMoney(account.income)}
        </span>
      </div>

      <div className="rounded-xl bg-card p-6 flex flex-col gap-3">
        <span className="text-sm text-muted-foreground">Expenses</span>
        <span className="text-3xl font-bold">
          {formatMoney(account.expenses)}
        </span>
      </div>
    </div>
  );
}
