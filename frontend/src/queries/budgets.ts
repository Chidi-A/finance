import { BudgetsService, TransactionsService } from '@/client/sdk.gen';

export function getBudgetsQueryOptions() {
  return {
    queryFn: () => BudgetsService.readBudgets(),
    queryKey: ['budgets'],
  };
}

export function getSpendingByCategoryQueryOptions() {
  return {
    queryFn: () => TransactionsService.spendingByCategory(),
    queryKey: ['transactions', 'spending-by-category'],
  };
}
