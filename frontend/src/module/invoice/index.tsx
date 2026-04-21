import { CreateInvoiceForm } from "./components/CreateInvoiceForm";

export default function InvoicePage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8 p-4 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 transition-all">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl font-black tracking-tight drop-shadow-sm">Create Invoice</h2>
        </div>
      </div>

      <div className="bg-background rounded-[2rem] border shadow-2xl p-1 shadow-primary/5">
        <div className="bg-background rounded-[1.8rem] border border-border/50 p-8">
          <CreateInvoiceForm />
        </div>
      </div>
    </div>
  );
}