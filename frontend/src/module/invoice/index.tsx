import { CreateInvoiceForm } from "../dashboard/components/CreateInvoiceForm";

export default function InvoicePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-2 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 transition-all">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl font-extrabold tracking-tight">Create Invoice</h2>
        </div>
      </div>

      <div className="bg-background rounded-2xl border shadow-sm p-8">
        <CreateInvoiceForm />
      </div>
    </div>
  );
}