import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { z } from 'zod';

import type { TransactionPublic } from '@/client/types.gen';
import PendingTransactions from '@/components/Pending/PendingTransactions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatAmount, getInitials } from '@/utils';
import { getCategoriesQueryOptions } from '@/queries/categories';

import {
  getTransactionsQueryOptions,
  getTransactionsCountQueryOptions,
  LIMIT,
} from '@/queries/transactions';
import { cn } from '@/lib/utils';

const transactionsSearchSchema = z.object({
  search: z.string().catch(''),
  sortBy: z
    .enum(['latest', 'oldest', 'a-z', 'z-a', 'highest', 'lowest'])
    .catch('latest'),
  categoryId: z.uuid().nullable().catch(null),
  page: z.number().int().min(1).catch(1),
});

export const Route = createFileRoute('/_layout/transactions')({
  component: Transactions,
  validateSearch: transactionsSearchSchema,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getCategoriesQueryOptions()),
  head: () => ({
    meta: [
      {
        title: 'Transactions - Finance App',
      },
    ],
  }),
});

function TransactionRow({
  tx,
  categoryName,
}: {
  tx: TransactionPublic;
  categoryName: string;
}) {
  const isPositive = Number(tx.amount) >= 0;
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={tx.avatar_url ?? undefined}
              alt={tx.counterparty_name}
            />
            <AvatarFallback>{getInitials(tx.counterparty_name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{tx.counterparty_name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{categoryName}</TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(tx.posted_at)}
      </TableCell>
      <TableCell
        className={`text-right font-semibold ${isPositive ? 'text-emerald-600' : ''}`}
      >
        {formatAmount(tx.amount)}
      </TableCell>
    </TableRow>
  );
}

function TransactionsTableContent({
  categoryMap,
}: {
  categoryMap: Record<string, string>;
}) {
  const { search, sortBy, categoryId, page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: transactions } = useSuspenseQuery(
    getTransactionsQueryOptions({ page, search, sortBy, categoryId }),
  );
  const { data: totalCount } = useSuspenseQuery(
    getTransactionsCountQueryOptions({ search, categoryId }),
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));
  const setPage = (value: number) =>
    navigate({ search: (prev) => ({ ...prev, page: value }) });
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Search className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No transactions found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Recipient / Sender</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Transaction Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                categoryName={categoryMap[tx.category_id] ?? '—'}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col divide-y sm:hidden">
        {transactions.map((tx) => {
          const isPositive = Number(tx.amount) >= 0;
          return (
            <div key={tx.id} className="flex items-center gap-3 py-4">
              <Avatar>
                <AvatarImage
                  src={tx.avatar_url ?? undefined}
                  alt={tx.counterparty_name}
                />
                <AvatarFallback>
                  {getInitials(tx.counterparty_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{tx.counterparty_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {categoryMap[tx.category_id] ?? '—'}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`font-semibold ${isPositive ? 'text-emerald-600' : ''}`}
                  >
                    {formatAmount(tx.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(tx.posted_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) setPage(page - 1);
            }}
            className={cn(
              'border border-[#98908B] rounded-md',
              page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer',
            )}
          />

          <PaginationContent>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p);
                  }}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>

          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) setPage(page + 1);
            }}
            className={cn(
              'border border-[#98908B] rounded-md',
              page === totalPages
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer',
            )}
          />
        </Pagination>
      )}
    </>
  );
}

function TransactionsTable({
  categoryMap,
}: {
  categoryMap: Record<string, string>;
}) {
  return (
    <Suspense fallback={<PendingTransactions />}>
      <TransactionsTableContent categoryMap={categoryMap} />
    </Suspense>
  );
}

function Transactions() {
  const { search, sortBy, categoryId, page } = Route.useSearch();
  const { data: categories } = useSuspenseQuery(getCategoriesQueryOptions());
  const navigate = useNavigate({ from: Route.fullPath });

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const setSearch = (value: string) =>
    navigate({ search: (prev) => ({ ...prev, search: value, page: 1 }) });
  const setSortBy = (value: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        sortBy: value as
          | 'latest'
          | 'oldest'
          | 'a-z'
          | 'z-a'
          | 'highest'
          | 'lowest',
        page: 1,
      }),
    });
  const setCategoryId = (value: string | null) =>
    navigate({ search: (prev) => ({ ...prev, categoryId: value, page: 1 }) });
  const setPage = (value: number) =>
    navigate({ search: (prev) => ({ ...prev, page: value }) });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      <div className="flex flex-col gap-6 rounded-xl  bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-[70%] sm:w-full sm:max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transaction"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Desktop controls */}
          <div className="hidden sm:flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Sort by</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="a-z">A to Z</SelectItem>
                <SelectItem value="z-a">Z to A</SelectItem>
                <SelectItem value="highest">Highest</SelectItem>
                <SelectItem value="lowest">Lowest</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Category</span>
            <Select
              value={categoryId ?? 'all'}
              onValueChange={(v) => setCategoryId(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile controls — icon buttons */}
          <div className="flex sm:hidden items-center gap-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1">
                  <img src="/assets/images/icon-sort-mobile.svg" alt="Sort" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(
                  [
                    { value: 'latest', label: 'Latest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'a-z', label: 'A to Z' },
                    { value: 'z-a', label: 'Z to A' },
                    { value: 'highest', label: 'Highest' },
                    { value: 'lowest', label: 'Lowest' },
                  ] as const
                ).map(({ value, label }) => (
                  <DropdownMenuItem
                    key={value}
                    onSelect={() => setSortBy(value)}
                    className={sortBy === value ? 'font-semibold' : ''}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1">
                  <img
                    src="/assets/images/icon-filter-mobile.svg"
                    alt="Filter"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => setCategoryId(null)}
                  className={categoryId === null ? 'font-semibold' : ''}
                >
                  All Transactions
                </DropdownMenuItem>
                {categories.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onSelect={() => setCategoryId(c.id)}
                    className={categoryId === c.id ? 'font-semibold' : ''}
                  >
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <TransactionsTable categoryMap={categoryMap} />
      </div>
    </div>
  );
}
