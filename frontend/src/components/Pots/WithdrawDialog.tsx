import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PotsService } from "@/client/sdk.gen"
import type { PotPublic } from "@/client/types.gen"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface WithdrawDialogProps {
  pot: PotPublic
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WithdrawDialog({
  pot,
  open,
  onOpenChange,
}: WithdrawDialogProps) {
  const queryClient = useQueryClient()
  const total = Number(pot.total ?? 0)
  const target = Number(pot.target)

  const schema = z.object({
    amount: z
      .string()
      .min(1, "Required")
      .refine((v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) > 0, {
        message: "Must be greater than 0",
      })
      .refine((v) => parseFloat(v) <= total, {
        message: `Cannot exceed current total of $${total.toFixed(2)}`,
      }),
  })

  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "" },
  })

  const amount = parseFloat(form.watch("amount") || "0") || 0
  const newTotal = Math.max(0, total - amount)
  const currentPct = Math.min(100, (total / target) * 100)
  const newPct = Math.min(100, (newTotal / target) * 100)
  const withdrawPct = currentPct - newPct

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      PotsService.withdrawFromPot({
        potId: pot.id,
        requestBody: { amount: data.amount },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pots"] })
      form.reset()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-white md:max-w-xl p-8"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-start justify-between mb-5">
            <div className="flex flex-col gap-5">
              <DialogTitle className="text-3xl font-bold">
                Withdraw from '{pot.name}'
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Withdraw from your pot to put money back in your account.
              </DialogDescription>
            </div>
            <DialogClose className="rounded-full border border-[#696868] p-1.5 hover:border-[#201F24] transition-colors">
              <X className="size-4" />
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Progress preview */}
        <div className="bg-[#F8F4F0] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">New Amount</span>
            <span className="text-3xl font-bold">${newTotal.toFixed(2)}</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden flex">
            <div
              className="h-full rounded-l-full transition-all"
              style={{ width: `${newPct}%`, backgroundColor: "#201F24" }}
            />
            {amount > 0 && (
              <div
                className="h-full rounded-r-full transition-all bg-[#C94736] ml-1"
                style={{ width: `${withdrawPct}%` }}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-xs  text-[#C94736]">
            <span>{newPct.toFixed(1)}%</span>
            <span className="text-[#696868]">
              Target of ${target.toFixed(2)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutate(v))}
            className="flex flex-col gap-4 mt-2"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-[#696868]">
                    Amount to Withdraw
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-7 h-11! border-[#98908B]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-13 bg-[#201F24]"
              disabled={isPending}
            >
              {isPending ? "Withdrawing..." : "Confirm Withdrawal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
