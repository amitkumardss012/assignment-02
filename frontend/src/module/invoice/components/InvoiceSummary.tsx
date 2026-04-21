import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { useEffect } from "react";
import { calculateInvoiceTotals } from "../utils/invoice.utils";
import { Receipt, Coins, ShieldCheck } from "lucide-react";

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

  const SummaryRow = ({ label, value, isBold = false, isPrimary = false, icon: Icon }: any) => (
    <div className={`flex justify-between items-center py-2 transition-all ${isBold ? "mt-4 pt-4 border-t-2 border-primary/20" : ""}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-3.5 w-3.5 ${isPrimary ? "text-primary" : "text-muted-foreground/60"}`} />}
        <span className={`${isBold ? "font-black text-foreground" : "text-[11px] font-bold uppercase tracking-wider text-muted-foreground"}`}>
          {label}
        </span>
      </div>
      <span className={`font-mono transition-all duration-500 ${isPrimary ? "text-2xl font-black text-primary drop-shadow-sm" : isBold ? "text-xl font-black" : "text-sm font-bold"}`}>
        ₹{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );

  return (
    <div className="bg-background rounded-2xl border border-border/50 p-6 shadow-sm relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-6 border-b pb-4 border-border/50">
        <div className="bg-primary/10 p-1.5 rounded-lg">
          <Receipt className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-black tracking-tight uppercase">Billing Summary</h3>
      </div>

      <div className="space-y-1">
        <SummaryRow label="Subtotal" value={subtotal} icon={Coins} />
        <SummaryRow label="Total Discount" value={totalDiscount} />
        <SummaryRow label="TAX (GST)" value={totalGst} />
        <SummaryRow label="Grand Total" value={grandTotal} isBold isPrimary icon={ShieldCheck} />
      </div>

      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
    </div>
  );
}

