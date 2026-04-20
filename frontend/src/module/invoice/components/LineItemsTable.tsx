import { useGetInfiniteItems } from "@/api/hooks/item.hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { calculateRowTotal } from "../utils/invoice.utils";

interface LineItemsTableProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: any;
  disabled?: boolean;
}

export function LineItemsTable({ control, register, errors, setValue, disabled }: LineItemsTableProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [search, setSearch] = useState("");
  const { data: itemPages } = useGetInfiniteItems({ name: search });
  const itemsList = itemPages?.pages.flatMap(p => p.items) || [];

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
      
      // Update only if different to avoid infinite loops
      if (item.rowTotal !== rowTotal) {
        setValue(`items.${index}.rowTotal`, rowTotal);
      }
    });
  }, [watchedItems, setValue]);

  const handleAddItem = (item: any) => {
    append({
      itemId: item._id,
      quantity: 1,
      gstPercentage: 0,
      discountType: "percentage",
      discountValue: 0,
      basePrice: item.basePrice,
      rowTotal: item.basePrice,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg border border-dashed">
        <Label className="text-base font-semibold">Add Line Items</Label>
        <div className="flex gap-2">
          <Select onValueChange={(val) => {
            const selected = itemsList.find(i => i._id === val);
            if (selected) handleAddItem(selected);
          }}>
            <SelectTrigger className="w-full bg-background shadow-sm">
              <SelectValue placeholder="Search or select a product..." />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 sticky top-0 bg-popover z-10">
                <Input 
                  placeholder="Filter products..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8"
                />
              </div>
              {itemsList.map((item) => (
                <SelectItem key={item._id} value={item._id}>
                  {item.name} - ₹{item.basePrice.toFixed(2)}
                </SelectItem>
              ))}
              {itemsList.length === 0 && <div className="p-2 text-sm text-center text-muted-foreground">No products found</div>}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[200px]">Product</TableHead>
              <TableHead className="w-[100px]">Qty</TableHead>
              <TableHead className="w-[120px]">GST %</TableHead>
              <TableHead className="w-[200px]">Discount</TableHead>
              <TableHead className="text-right">Total (₹)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id} className="animate-in fade-in duration-200">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{(watchedItems?.[index] as any)?.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Base: ₹{(watchedItems?.[index] as any)?.basePrice?.toFixed(2)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                    disabled={disabled}
                    className="h-8 w-16"
                  />
                </TableCell>
                <TableCell>
                  <Select 
                    disabled={disabled}
                    defaultValue={String((field as any).gstPercentage)}
                    onValueChange={(val) => setValue(`items.${index}.gstPercentage`, Number(val))}
                  >
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue placeholder="GST" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 5, 12, 18, 28].map(gst => (
                        <SelectItem key={gst} value={String(gst)}>{gst}%</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Select 
                      disabled={disabled}
                      defaultValue={(field as any).discountType}
                      onValueChange={(val: any) => setValue(`items.${index}.discountType`, val)}
                    >
                      <SelectTrigger className="h-8 w-16 px-1 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="amount">₹</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      {...register(`items.${index}.discountValue` as const, { valueAsNumber: true })}
                      disabled={disabled}
                      className="h-8 flex-1"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  ₹{(watchedItems?.[index] as any)?.rowTotal?.toFixed(2) || "0.00"}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                  No line items added. Select a product above to start.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {errors.items && (
        <p className="text-sm font-medium text-destructive mt-2">{errors.items.message || (errors.items as any).root?.message}</p>
      )}
    </div>
  );
}
