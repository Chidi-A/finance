import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/items')({
  component: () => null,
  beforeLoad: async () => {
    throw redirect({ to: '/' });
  },
});
