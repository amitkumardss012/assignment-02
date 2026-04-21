import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { calculateRowTotal } from "../utils/invoice.utils";

interface SelectedItemsListProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: any;
  disabled?: boolean;
  isViewMode?: boolean;
}

export function SelectedItemsList({ control, register, errors, setValue, disabled, isViewMode }: SelectedItemsListProps) {
  const { fields, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
  });

  // Update row totals whenever values change
  useEffect(() => {
    watchedItems?.forEach((item: any, index: number) => {
      const calculationRow = {
        basePrice: item.basePrice || 0,
        quantity: item.quantity || 0,
        gstPercentage: item.gstPercentage || 0,
        discountType: item.discountType || "percentage",
        discountValue: item.discountValue || 0,
      };

      const { rowTotal } = calculateRowTotal(calculationRow);

      if (item.rowTotal !== rowTotal) {
        setValue(`items.${index}.rowTotal`, rowTotal);
      }
    });
  }, [watchedItems, setValue]);

  return (
    <div className={cn("flex flex-col border border-border/50 rounded-xl overflow-hidden bg-background shadow-sm transition-all duration-300", !isViewMode && "h-full")}>

      <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold tracking-tight">Selected Items</h3>
          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
            {fields.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Table>
          <TableHeader className="bg-muted/10 sticky top-0 z-10 backdrop-blur-sm border-b">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-2">Item</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-center py-2">Qty</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-2">Tax %</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-2">Disc</TableHead>
              <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest py-2">Total</TableHead>
              {!isViewMode && <TableHead className="w-[40px]"></TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id} className="hover:bg-muted/20 transition-colors animate-in fade-in slide-in-from-right-4 duration-300">
                <TableCell className="py-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{(field as any).name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ₹{(field as any).basePrice?.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Input
                    type="number"
                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                    disabled={disabled}
                    className="h-8 w-14 text-center font-bold bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                  />
                </TableCell>
                <TableCell className="py-3">
                  <Select
                    disabled={disabled}
                    defaultValue={String((field as any).gstPercentage)}
                    onValueChange={(val) => setValue(`items.${index}.gstPercentage`, Number(val))}
                  >
                    <SelectTrigger className="h-8 w-16 px-2 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none">
                      <SelectValue placeholder="Tax" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 5, 12, 18, 28].map(gst => (
                        <SelectItem key={gst} value={String(gst)} className="text-xs">{gst}%</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-1">
                    <Select
                      disabled={disabled}
                      defaultValue={(field as any).discountType}
                      onValueChange={(val: any) => setValue(`items.${index}.discountType`, val)}
                    >
                      <SelectTrigger className="h-8 w-10 px-1 text-[10px] bg-muted/30 border-none shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="min-w-16">
                        <SelectItem value="percentage" className="text-[10px]">%</SelectItem>
                        <SelectItem value="amount" className="text-[10px]">₹</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      {...register(`items.${index}.discountValue` as const, { valueAsNumber: true })}
                      disabled={disabled}
                      className="h-8 w-12 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none px-1"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-sm text-primary py-3">
                  ₹{(watchedItems?.[index] as any)?.rowTotal?.toLocaleString() || "0"}
                </TableCell>
                {!isViewMode && (
                  <TableCell className="py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => remove(index)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                    <ShoppingBag className="h-10 w-10" />
                    <p className="text-xs font-medium italic">Your cart is empty</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {errors.items && (
        <div className="p-2 border-t bg-destructive/10">
          <p className="text-[10px] font-bold text-destructive text-center uppercase tracking-wider">
            {errors.items.message || (errors.items as any).root?.message}
          </p>
        </div>
      )}
    </div>
  );
}

