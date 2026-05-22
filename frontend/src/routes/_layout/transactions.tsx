import { CategoriesService } from '@/client/sdk.gen';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Route = createFileRoute('/_layout/transactions')({
  component: Transactions,
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

function getCategoriesQueryOptions() {
  return {
    queryFn: () => CategoriesService.readCategories(),
    queryKey: ['categories'],
    staleTime: Infinity, // categories rarely change — cache forever in this session
  };
}

function Transactions() {
  const { data: categories } = useSuspenseQuery(getCategoriesQueryOptions());

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  return (
    <div>
      <h1>Transactions</h1>
    </div>
  );
}
