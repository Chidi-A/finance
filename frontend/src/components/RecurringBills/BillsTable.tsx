import { Search } from 'lucide-react';
import type { TransactionPublic } from '@/client/types.gen';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getInitials } from '@/utils';

function getBillStatus(postedAt: string): 'paid' | 'due-soon' | 'upcoming' {
  const billDay = new Date(postedAt).getUTCDate();
  const today = new Date().getDate();
  if (billDay <= today) return 'paid';
  if (billDay - today <= 5) return 'due-soon';
  return 'upcoming';
}

function StatusDot({ status }: { status: 'paid' | 'due-soon' | 'upcoming' }) {
  if (status === 'paid')
    return <span className="size-2 rounded-full bg-emerald-500 inline-block" />;
  if (status === 'due-soon')
    return <span className="size-2 rounded-full bg-[#C94736] inline-block" />;
  return null;
}

function BillRow({ bill }: { bill: TransactionPublic }) {
  const status = getBillStatus(bill.posted_at);
  const day = new Date(bill.posted_at).getUTCDate();
  const amount = Math.abs(Number(bill.amount)).toFixed(2);
  const isDueSoon = status === 'due-soon';

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={bill.avatar_url ?? undefined}
              alt={bill.counterparty_name}
            />
            <AvatarFallback>
              {getInitials(bill.counterparty_name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{bill.counterparty_name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div
          className={`flex items-center gap-2 text-sm ${isDueSoon ? 'text-[#C94736]' : 'text-emerald-600'}`}
        >
          Monthly-{day}th
          <StatusDot status={status} />
        </div>
      </TableCell>
      <TableCell
        className={`text-right font-semibold ${isDueSoon ? 'text-[#C94736]' : ''}`}
      >
        ${amount}
      </TableCell>
    </TableRow>
  );
}

interface Props {
  bills: TransactionPublic[];
  search: string;
  sortBy: string;
  onSearch: (v: string) => void;
  onSortBy: (v: string) => void;
}

export function BillsTable({
  bills,
  search,
  sortBy,
  onSearch,
  onSortBy,
}: Props) {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-card p-6 flex-1">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bills"
            className="pl-9"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Sort by</span>
          <Select value={sortBy} onValueChange={onSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="a-z">A to Z</SelectItem>
              <SelectItem value="z-a">Z to A</SelectItem>
              <SelectItem value="highest">Highest</SelectItem>
              <SelectItem value="lowest">Lowest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No bills found</h3>
          <p className="text-muted-foreground">Try adjusting your search</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Bill Title</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <BillRow key={bill.id} bill={bill} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
