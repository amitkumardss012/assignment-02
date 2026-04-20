import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { useEffect } from "react";
import { calculateInvoiceTotals } from "../utils/invoice.utils";
import type { InvoiceFormValues } from "../validators/invoice.validator";

interface InvoiceSummaryProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

export function InvoiceSummary({ control, setValue }: InvoiceSummaryProps) {
  const watchedItems = useWatch({
    control,
    name: "items",
  });

  const { subtotal, totalDiscount, totalGst, grandTotal } = calculateInvoiceTotals(watchedItems || []);

  // Update form totals state
  useEffect(() => {
    setValue("totals.subtotal", subtotal);
    setValue("totals.totalDiscount", totalDiscount);
    setValue("totals.totalGst", totalGst);
    setValue("totals.grandTotal", grandTotal);
  }, [subtotal, totalDiscount, totalGst, grandTotal, setValue]);

  const SummaryRow = ({ label, value, isBold = false, isPrimary = false }: any) => (
    <div className={`flex justify-between items-center py-2 ${isBold ? "font-bold text-lg border-t mt-2" : "text-sm"}`}>
      <span className={isBold ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className={isPrimary ? "text-primary text-xl" : "text-foreground"}>₹{value.toFixed(2)}</span>
    </div>
  );

  return (
    <div className="bg-muted/30 rounded-xl border p-6 space-y-1">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Invoice Summary</h3>
      <SummaryRow label="Subtotal" value={subtotal} />
      <SummaryRow label="Total Discount" value={totalDiscount} />
      <SummaryRow label="Total GST" value={totalGst} />
      <SummaryRow label="Grand Total" value={grandTotal} isBold isPrimary />
    </div>
  );
}
