import { CategoriesService } from "@/client/sdk.gen"

export function getCategoriesQueryOptions() {
  return {
    queryFn: () => CategoriesService.readCategories(),
    queryKey: ["categories"],
    staleTime: Infinity,
  }
}
