import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/admin")({
  component: () => null,
  beforeLoad: async () => {
    throw redirect({ to: "/" })
  },
})
