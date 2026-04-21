import { useGetInfiniteItems } from "@/api/hooks/item.hook";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, Package, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AvailableItemsListProps {
  onAddItem: (item: any) => void;
  disabled?: boolean;
}

export function AvailableItemsList({ onAddItem, disabled }: AvailableItemsListProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetInfiniteItems({ name: debouncedSearch });

  const items = data?.pages.flatMap((page) => page.items) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col h-full bg-muted/10 rounded-xl overflow-hidden border border-border/50">
      <div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search items by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-background border-border/50 focus:border-primary shadow-sm transition-all rounded-lg"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading catalog...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-3 bg-background/50 rounded-xl border border-dashed">
            <Package className="h-10 w-10 text-muted-foreground/30" />
            <div>
              <p className="font-medium text-muted-foreground">No items found</p>
              <p className="text-xs text-muted-foreground/60">Try searching with a different term</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="group relative bg-background border border-border/50 p-4 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300 flex items-center justify-between overflow-hidden"
                >
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2">
                       <Badge variant="secondary" className="font-mono text-[10px] bg-primary/5 text-primary border-primary/10">
                        ₹{item.basePrice.toLocaleString()}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Base Price</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={disabled}
                    onClick={() => onAddItem(item)}
                    className="h-10 w-10 rounded-full border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>

                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>

            {/* Intersection Obsever Trigger */}
            <div ref={ref} className="h-10 flex items-center justify-center pt-2">
              {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-primary/50" />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
