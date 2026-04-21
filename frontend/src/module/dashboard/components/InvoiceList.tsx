import { useGetInfiniteInvoices } from "@/api/hooks/invoice.hook";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useInvoiceStore } from "@/store/invoice.store";
import type { IInvoice } from "@/types/invoice";
import { format } from "date-fns";
import { Eye, FileText, MoreHorizontal, Search } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export function InvoiceList() {
  const { ref, inView } = useInView();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useGetInfiniteInvoices({ search: debouncedSearch });
  const { openModal } = useInvoiceStore();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAction = (mode: 'view' | 'edit', invoice: IInvoice) => {
    openModal(mode, invoice);
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by invoice number..." 
          className="pl-10 h-11 bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-16 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-destructive bg-destructive/5 rounded-xl border border-destructive/20 font-medium">
          Failed to load invoices. Ensure backend is running.
        </div>
      ) : (
        <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Invoice #</TableHead>
              <TableHead className="font-bold">Customer</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold text-right">Grand Total</TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.pages.map((page, i) => (
              <Fragment key={i}>
                {page.invoices.map((invoice) => (
                  <TableRow key={invoice._id} className="hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => handleAction('view', invoice)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-mono font-bold tracking-tighter">{invoice.invoiceNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{invoice.customerDetails.fullName}</span>
                        <span className="text-[10px] text-muted-foreground">{invoice.customerDetails.phoneNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {invoice.date ? format(new Date(invoice.date), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-base">
                      ₹{invoice.totals.grandTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-muted/50">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAction('view', invoice)} className="cursor-pointer gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" /> Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
            {data?.pages[0].invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                  No invoices found. Generate your first invoice to see it here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <div ref={ref} className="h-10 border-t flex items-center justify-center py-6 bg-muted/10">
          {isFetchingNextPage ? (
             <span className="text-xs text-muted-foreground animate-pulse font-medium">Loading more history...</span>
          ) : hasNextPage ? (
            <span className="text-xs text-muted-foreground font-medium">Scroll to load more</span>
          ) : data?.pages[0].invoices.length !== 0 ? (
             <span className="text-sm text-muted-foreground opacity-50">No more items</span>
          ) : null}
        </div>
      </div>
      )}
    </div>
  );
}
