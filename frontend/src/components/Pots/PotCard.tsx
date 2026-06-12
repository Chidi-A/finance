import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Ellipsis, X } from 'lucide-react';

import type { PotPublic } from '@/client/types.gen';
import { PotsService } from '@/client/sdk.gen';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { EditPotDialog } from './EditPotDialog';
import { AddMoneyDialog } from './AddMoneyDialog';
import { WithdrawDialog } from './WithdrawDialog';

interface PotCardProps {
  pot: PotPublic;
  usedThemes: string[];
}

export function PotCard({ pot, usedThemes }: PotCardProps) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const total = Number(pot.total ?? 0);
  const target = Number(pot.target);
  const progress = Math.min(100, (total / target) * 100);

  const { mutate: deletePot, isPending: isDeleting } = useMutation({
    mutationFn: () => PotsService.deletePot({ potId: pot.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
    },
  });

  return (
    <div className="rounded-xl bg-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-8">
        <div className="flex items-center gap-3">
          <div
            className="size-4 rounded-full"
            style={{ backgroundColor: pot.theme }}
          />
          <h3 className="font-bold text-xl">{pot.name}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground outline-none">
            <Ellipsis className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              Edit Pot
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              Delete Pot
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="pb-8">
        {/* Total saved */}
        <div className="flex items-center justify-between pb-4">
          <span className="text-sm text-muted-foreground">Total Saved</span>
          <span className="text-3xl font-bold">${total.toFixed(2)}</span>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="w-full h-2 bg-[#F8F4F0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: pot.theme }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress.toFixed(1)}%</span>
            <span>Target of ${target.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="h-13 bg-[#F8F4F0] hover:bg-[#F8F4F0]/90 text-[#201F24] font-bold   "
          onClick={() => setAddMoneyOpen(true)}
        >
          + Add Money
        </Button>
        <Button
          className="h-13 bg-[#F8F4F0] hover:bg-[#F8F4F0]/90 text-[#201F24] font-bold   "
          onClick={() => setWithdrawOpen(true)}
        >
          Withdraw
        </Button>
      </div>
      {/* Dialogs */}
      <EditPotDialog
        pot={pot}
        open={editOpen}
        onOpenChange={setEditOpen}
        usedThemes={usedThemes}
      />
      <AddMoneyDialog
        pot={pot}
        open={addMoneyOpen}
        onOpenChange={setAddMoneyOpen}
      />
      <WithdrawDialog
        pot={pot}
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
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
                  Delete '{pot.name}'?
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Are you sure you want to delete this pot? This action cannot
                  be reversed, and all the data inside it will be removed
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
              onClick={() => deletePot()}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Confirm Deletion'}
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
  );
}
