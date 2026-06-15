import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { getPotsQueryOptions } from '@/queries/pots';

export function PotsWidget() {
  const { data: pots } = useSuspenseQuery(getPotsQueryOptions());

  const totalSaved = pots.reduce((sum, p) => sum + Number(p.total ?? 0), 0);
  const displayed = pots.slice(0, 4);

  return (
    <div className="rounded-xl bg-card p-8 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Pots</h2>
        <Link
          to="/pots"
          className="flex items-center gap- text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          See Details
          <img
            src="/assets/images/icon-caret-right.svg"
            alt="See Details"
            className="size-2.5"
          />
        </Link>
      </div>

      <div className="flex gap-5">
        {/* Total saved */}
        <div className="rounded-xl bg-[#F8F4F0] flex items-center gap-4 px-4 py-5 flex-1">
          <img
            src="/assets/images/icon-pot.svg"
            alt="Pots"
            className="w-8 h-8 shrink-0"
          />
          <div className="flex flex-col gap-3">
            <span className="text-sm text-muted-foreground">Total Saved</span>
            <span className="text-3xl font-bold">${totalSaved.toFixed(0)}</span>
          </div>
        </div>

        {/* Pot list — up to 4, 2-column grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 flex-1">
          {displayed.map((pot) => (
            <div key={pot.id} className="flex items-center gap-3">
              <div
                className="w-1 h-full min-h-12 rounded-full shrink-0"
                style={{ backgroundColor: pot.theme }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  {pot.name}
                </span>
                <span className="text-sm font-bold">
                  ${Number(pot.total ?? 0).toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
