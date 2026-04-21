import { ReceiptText } from "lucide-react";
import { CreateInvoiceForm } from "../dashboard/components/CreateInvoiceForm";

export default function InvoicePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-2 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 transition-all">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <ReceiptText className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Create Invoice</h2>
        </div>
        <p className="text-muted-foreground font-medium pl-[60px] max-w-2xl text-lg">
          Fill out the form below to map customer details, add inventory line items, and generate a professional invoice.
        </p>
      </div>

      <div className="bg-background rounded-2xl border shadow-sm p-8">
        <CreateInvoiceForm />
      </div>
    </div>
  );
}