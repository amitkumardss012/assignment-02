import { useEffect, Fragment, useState } from "react";
import { useInView } from "react-intersection-observer";
import { MoreHorizontal, Eye, Edit, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useGetInfiniteItems } from "@/api/hooks/item.hook";
import { useItemStore } from "@/store/item.store";
import type { IItem } from "@/types/item";

export function ItemsTable() {
  const { ref, inView } = useInView();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useGetInfiniteItems({ name: debouncedSearch });
  const { openModal } = useItemStore();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAction = (mode: 'view' | 'edit', item: IItem) => {
    openModal(mode, item);
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search items by name..." 
          className="pl-10 h-11 bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4 bg-background rounded-md border p-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-12" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-4 text-center text-destructive bg-destructive/10 rounded-md border border-destructive">
          Failed to load items. Please try again.
        </div>
      ) : (
        <div className="rounded-md border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Base Price</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.pages.map((page, i) => (
            <Fragment key={i}>
              {page.items.map((item) => (
                <TableRow key={item._id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[250px]">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{item.basePrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('view', item)} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('edit', item)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                          Edit Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
          {data?.pages[0].items.length === 0 && (
             <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                No items found. Create a new item to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Intersection Observer Target */}
      <div ref={ref} className="h-10 flex items-center justify-center py-4">
        {isFetchingNextPage ? (
           <span className="text-sm text-muted-foreground animate-pulse">Loading more items...</span>
        ) : hasNextPage ? (
          <span className="text-sm text-muted-foreground">Scroll for more</span>
        ) : data?.pages[0].items.length !== 0 ? (
           <span className="text-sm text-muted-foreground opacity-50">No more items</span>
        ) : null}
        </div>
      </div>
      )}
    </div>
  );
}
