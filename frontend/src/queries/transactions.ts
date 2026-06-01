import { TransactionsService } from '@/client/sdk.gen';

const LIMIT = 10;

interface TransactionParams {
  page: number;
  search: string;
  sortBy: string;
  categoryId: string | null;
}

export function getTransactionsQueryOptions(params: TransactionParams) {
  const { page, search, sortBy, categoryId } = params;
  return {
    queryFn: () =>
      TransactionsService.readTransactions({
        skip: (page - 1) * LIMIT,
        limit: LIMIT,
        search: search || undefined,
        sortBy: sortBy,
        categoryId: categoryId ?? undefined,
      }),
    queryKey: ['transactions', params],
  };
}

export function getTransactionsCountQueryOptions(
  params: Omit<TransactionParams, 'page' | 'sortBy'>,
) {
  const { search, categoryId } = params;
  return {
    queryFn: () =>
      TransactionsService.countTransactions({
        search: search || undefined,
        categoryId: categoryId ?? undefined,
      }),
    queryKey: ['transactions', 'count', params],
  };
}
export { LIMIT };
