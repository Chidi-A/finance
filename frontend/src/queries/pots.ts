import { PotsService } from "@/client/sdk.gen"

export function getPotsQueryOptions() {
  return {
    queryFn: () => PotsService.readPots(),
    queryKey: ["pots"],
  }
}
