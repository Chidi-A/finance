import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LIMIT } from "@/queries/transactions"

const PendingTransactions = () => (
  <Table>
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead>Recipient / Sender</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Transaction Date</TableHead>
        <TableHead className="text-right">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: LIMIT }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default PendingTransactions
