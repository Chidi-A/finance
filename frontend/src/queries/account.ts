import { AccountService } from '@/client/sdk.gen';

export function getAccountQueryOptions() {
  return {
    queryFn: () => AccountService.readAccountMe(),
    queryKey: ['account'],
  };
}
