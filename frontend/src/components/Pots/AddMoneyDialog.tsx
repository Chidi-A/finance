import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { PotPublic } from '@/client/types.gen';
import { PotsService } from '@/client/sdk.gen';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface AddMoneyDialogProps {
  pot: PotPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMoneyDialog({
  pot,
  open,
  onOpenChange,
}: AddMoneyDialogProps) {
  const queryClient = useQueryClient();
  const total = Number(pot.total ?? 0);
  const target = Number(pot.target);

  const schema = z.object({
    amount: z
      .string()
      .min(1, 'Required')
      .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
        message: 'Must be greater than 0',
      }),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '' },
  });

  const amount = parseFloat(form.watch('amount') || '0') || 0;
  const newTotal = Math.min(total + amount, target);
  const currentPct = Math.min(100, (total / target) * 100);
  const newPct = Math.min(100, (newTotal / target) * 100);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      PotsService.addToPot({
        potId: pot.id,
        requestBody: { amount: data.amount },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      form.reset();
      onOpenChange(false);
    },
  });

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
                Add to '{pot.name}'
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Add money to your pot to keep it growing!
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
              className="h-full rounded-full transition-all"
              style={{ width: `${currentPct}%`, backgroundColor: pot.theme }}
            />
            {amount > 0 && (
              <div
                className="h-full rounded-full transition-all bg-[#201F24]"
                style={{ width: `${newPct - currentPct}%` }}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{newPct.toFixed(1)}%</span>
            <span>Target of ${target.toFixed(2)}</span>
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
                    Amount to Add
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
              {isPending ? 'Adding...' : 'Confirm Addition'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
