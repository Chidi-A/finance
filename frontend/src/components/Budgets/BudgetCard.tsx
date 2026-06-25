import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Ellipsis, X } from "lucide-react"
import { useState } from "react"
import { BudgetsService } from "@/client/sdk.gen"
import type { BudgetPublic } from "@/client/types.gen"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getLatestTransactionsByCategoryQueryOptions } from "@/queries/transactions"
import { formatAmount, formatDate, getInitials } from "@/utils"
import { Button } from "../ui/button"
import { EditBudgetDialog } from "./EditBudgetDialog"

interface BudgetCardProps {
  budget: BudgetPublic
  categoryName: string
  spent: number
  usedThemes: string[]
}

export function BudgetCard({
  budget,
  categoryName,
  spent,
  usedThemes,
}: BudgetCardProps) {
  const queryClient = useQueryClient()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: latestTxs } = useSuspenseQuery(
    getLatestTransactionsByCategoryQueryOptions(budget.category_id),
  )

  const maximum = Number(budget.maximum)
  const remaining = Math.max(0, maximum - spent)
  const progress = Math.min(100, (spent / maximum) * 100)

  const { mutate: deleteBudget, isPending: isDeleting } = useMutation({
    mutationFn: () => BudgetsService.deleteBudget({ budgetId: budget.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({
        queryKey: ["transactions", "spending-by-category"],
      })
    },
  })

  return (
    <div className="rounded-xl bg-card p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: budget.theme }}
          />
          <h3 className="font-bold text-lg">{categoryName}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground outline-none">
            <Ellipsis className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              Edit Budget
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              Delete Budget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Maximum */}
      <p className="text-sm text-muted-foreground">
        Maximum of ${maximum.toFixed(2)}
      </p>

      {/* Progress bar */}
      <div className="w-full h-8 bg-[#F8F4F0] rounded-md overflow-hidden p-1">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${progress}%`,
            backgroundColor: budget.theme,
          }}
        />
      </div>

      {/* Spent / Remaining */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-1 h-11 rounded-full"
            style={{ backgroundColor: budget.theme }}
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Spent</span>
            <span className="text-sm font-bold">${spent.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-1 h-11 rounded-full bg-muted" />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Remaining</span>
            <span className="text-sm font-bold">${remaining.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Latest Spending */}
      <div className="bg-[#F8F4F0] rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Latest Spending</span>
          <div className="flex items-center gap-2">
            <Link
              to="/transactions"
              search={{
                categoryId: budget.category_id,
                page: 1,
                search: "",
                sortBy: "latest",
              }}
              className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground"
            >
              See All
            </Link>
            <span className="text-[10px]">►</span>
          </div>
        </div>
        <div className="flex flex-col divide-y divide-[#696868]/15">
          {latestTxs.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage
                    src={tx.avatar_url ?? undefined}
                    alt={tx.counterparty_name}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(tx.counterparty_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {tx.counterparty_name}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold ">
                  {formatAmount(tx.amount)}
                </span>
                <span className="text-xs text-[#696868]">
                  {formatDate(tx.posted_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <EditBudgetDialog
        budget={budget}
        categoryName={categoryName}
        open={editOpen}
        onOpenChange={setEditOpen}
        usedThemes={usedThemes}
      />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          className="sm:max-w-md bg-white md:max-w-xl p-8"
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="flex items-start justify-between mb-5">
              <div className="flex flex-col gap-5">
                <DialogTitle className="text-3xl font-bold">
                  Delete '{categoryName}'?
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Are you sure you want to delete this budget? This action
                  cannot be reversed, and all the data inside it will be removed
                  forever.
                </DialogDescription>
              </div>
              <DialogClose className="rounded-full border border-[#696868] p-1.5 hover:border-[#201F24] transition-colors">
                <X className="size-4" />
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full h-13 bg-[#C94736] hover:bg-[#C94736]/90"
              disabled={isDeleting}
              onClick={() => deleteBudget()}
            >
              {isDeleting ? "Deleting..." : "Yes, Confirm Deletion"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-13"
              onClick={() => setDeleteOpen(false)}
            >
              No, Go Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
