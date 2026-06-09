import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { BudgetsService } from '@/client/sdk.gen';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BUDGET_THEMES } from '@/lib/budget-themes';
import { getCategoriesQueryOptions } from '@/queries/categories';
import { X } from 'lucide-react';
import { getLatestTransactionsByCategoryQueryOptions } from '@/queries/transactions';

const schema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),
  maximum: z
    .string()
    .min(1, 'Required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'Must be greater than 0',
    }),
  theme: z.string().min(1, 'Please select a theme'),
});

type FormValues = z.infer<typeof schema>;

interface AddBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usedThemes: string[];
}

export function AddBudgetDialog({
  open,
  onOpenChange,
  usedThemes,
}: AddBudgetDialogProps) {
  const queryClient = useQueryClient();
  const { data: categories } = useSuspenseQuery(getCategoriesQueryOptions());

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: '',
      maximum: '',
      theme: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      BudgetsService.createBudget({
        requestBody: {
          category_id: data.categoryId,
          maximum: data.maximum,
          theme: data.theme,
        },
      }),
    onSuccess: async (newBudget) => {
      await queryClient.prefetchQuery(
        getLatestTransactionsByCategoryQueryOptions(newBudget.category_id),
      );
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({
        queryKey: ['transactions', 'spending-by-category'],
      });
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
                Add New Budget
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Choose a category to set a spending budget. These categories can
                help you monitor spending.
              </DialogDescription>
            </div>
            <DialogClose className="rounded-full border border-[#696868] p-1.5 hover:border-[#201F24] transition-colors">
              <X className="size-4" />
            </DialogClose>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutate(v))}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-[#696868]">
                    Budget Category
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full h-11! border-[#98908B]">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maximum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-[#696868]">
                    Maximum Spend
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

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-[#696868]">
                    Theme
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full h-11! border-[#98908B]">
                        <SelectValue placeholder="Select a theme">
                          {field.value && (
                            <div className="flex items-center gap-2">
                              <div
                                className="size-3 rounded-full"
                                style={{ backgroundColor: field.value }}
                              />
                              {
                                BUDGET_THEMES.find(
                                  (t) => t.value === field.value,
                                )?.label
                              }
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_THEMES.map((t) => {
                        const alreadyUsed = usedThemes.includes(t.value);
                        return (
                          <SelectItem
                            key={t.value}
                            value={t.value}
                            disabled={alreadyUsed}
                          >
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="size-3 rounded-full"
                                  style={{ backgroundColor: t.value }}
                                />
                                {t.label}
                              </div>
                              {alreadyUsed && (
                                <span className="text-xs text-muted-foreground">
                                  Already used
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-2 h-13 bg-[#201F24]"
              disabled={isPending}
            >
              {isPending ? 'Adding...' : 'Add Budget'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
